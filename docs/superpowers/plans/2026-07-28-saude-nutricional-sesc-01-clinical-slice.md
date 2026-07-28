# Saúde Nutricional Sesc — Primeiro Atendimento Clínico Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o primeiro fluxo clínico real: nutricionista autorizado cadastra um paciente adulto, agenda, inicia um rascunho, registra peso e altura, recebe IMC versionado, finaliza e consulta o registro imutável na linha do tempo.

**Architecture:** Estender o monólito modular da fundação com os módulos `patients`, `schedule` e `encounters`. Escritas clínicas passam por funções transacionais do banco com revisão otimista e idempotência; a aplicação usa funções puras para cálculo e apresentação, enquanto o banco preserva snapshots, estado e imutabilidade.

**Tech Stack:** Stack do Plano 00, mais React Hook Form, `@hookform/resolvers`, date-fns e funções PostgreSQL transacionais.

## Global Constraints

- O Plano 00 deve estar completo e verde.
- O primeiro slice aceita somente pacientes com perfil clínico `adult`; os demais perfis entram nos Planos 05 e 06.
- `unit_id` é obrigatório em pacientes, agendamentos e consultas.
- Nutricionistas acessam a unidade principal e grants ativos; coordenadores acessam as duas.
- Todo comando revalida `ActorContext` no servidor e RLS no banco.
- Paciente atual e snapshot da consulta são dados distintos.
- Consultas usam apenas `draft` e `finalized`.
- Rascunho usa `revision` e `idempotency_key`.
- Consulta finalizada é somente leitura; correções entram em plano posterior como complementos.
- IMC adulto usa `peso_kg / altura_m²`, arredondado para uma casa apenas na apresentação.
- Classificação inicial: `<18,5` baixo peso; `18,5–24,9` peso adequado; `25,0–29,9` sobrepeso; `≥30,0` obesidade.
- A regra possui código `who-adult-bmi`, versão `2025-12-08` e fonte `https://www.who.int/en/news-room/fact-sheets/detail/obesity-and-overweight`.
- O indicador apoia a avaliação e não gera diagnóstico automático.
- Auditoria guarda identificadores, tipo de evento e revisão, nunca motivo, observações ou outros textos clínicos.
- Cobertura global mínima de 80%; acesso, transição de estado, idempotência e cálculo clínico exigem 100% dos ramos.

---

## File Map

```text
saude-nutricional-sesc/
├── src/
│   ├── app/(protected)/
│   │   ├── agenda/page.tsx
│   │   ├── pacientes/page.tsx
│   │   └── pacientes/[patientId]/
│   │       ├── page.tsx
│   │       └── consultas/[encounterId]/page.tsx
│   ├── modules/patients/
│   │   ├── actions.ts
│   │   ├── patient-form.tsx
│   │   ├── repository.ts
│   │   ├── schemas.test.ts
│   │   ├── schemas.ts
│   │   └── types.ts
│   ├── modules/schedule/
│   │   ├── actions.ts
│   │   ├── appointment-form.tsx
│   │   ├── repository.ts
│   │   ├── schemas.test.ts
│   │   ├── schemas.ts
│   │   └── types.ts
│   └── modules/encounters/
│       ├── actions.ts
│       ├── adult-bmi.test.ts
│       ├── adult-bmi.ts
│       ├── encounter-form.tsx
│       ├── repository.ts
│       ├── state-machine.test.ts
│       ├── state-machine.ts
│       ├── timeline.tsx
│       └── types.ts
├── supabase/
│   ├── migrations/20260728000200_patients.sql
│   ├── migrations/20260728000300_schedule.sql
│   ├── migrations/20260728000400_encounters.sql
│   ├── tests/patients_rls.sql
│   ├── tests/schedule_conflicts.sql
│   └── tests/encounter_lifecycle.sql
└── tests/e2e/
    ├── first-clinical-encounter.spec.ts
    └── helpers.ts
```

## Task 1: Cadastro direto e busca de paciente adulto

**Files:**

- Create: `saude-nutricional-sesc/supabase/tests/patients_rls.sql`
- Create: `saude-nutricional-sesc/supabase/migrations/20260728000200_patients.sql`
- Create: `saude-nutricional-sesc/src/modules/patients/types.ts`
- Create: `saude-nutricional-sesc/src/modules/patients/schemas.ts`
- Create: `saude-nutricional-sesc/src/modules/patients/schemas.test.ts`
- Create: `saude-nutricional-sesc/src/modules/patients/repository.ts`
- Create: `saude-nutricional-sesc/src/modules/patients/actions.ts`
- Create: `saude-nutricional-sesc/src/modules/patients/patient-form.tsx`
- Create: `saude-nutricional-sesc/src/app/(protected)/pacientes/page.tsx`
- Create: `saude-nutricional-sesc/src/app/(protected)/pacientes/[patientId]/page.tsx`

**Interfaces:**

- Produces type: `PatientSummary`.
- Produces schema: `patientInputSchema`.
- Produces server action: `createPatient`.
- Produces repository functions: `listPatients(query)` and `getPatient(patientId)`.
- Produces protected routes `/pacientes` and `/pacientes/[patientId]`.

- [ ] **Step 1: Install the slice dependencies**

Run:

```bash
pnpm add react-hook-form @hookform/resolvers date-fns date-fns-tz
```

Expected: dependencies are locked in `pnpm-lock.yaml`; no application behavior changes.

- [ ] **Step 2: Write failing schema and RLS tests**

Create `src/modules/patients/schemas.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { patientInputSchema } from "./schemas";

describe("patientInputSchema", () => {
  it("accepts an adult patient with required fields", () => {
    const result = patientInputSchema.parse({
      unitId: "10000000-0000-4000-8000-000000000001",
      fullName: "Marina Almeida",
      birthDate: "1988-04-12",
      sexAtBirth: "female",
      clinicalProfile: "adult",
      institutionalId: "SESC-000123",
    });

    expect(result.fullName).toBe("Marina Almeida");
  });

  it("rejects a future birth date", () => {
    expect(() =>
      patientInputSchema.parse({
        unitId: "10000000-0000-4000-8000-000000000001",
        fullName: "Paciente Futuro",
        birthDate: "2099-01-01",
        sexAtBirth: "not_informed",
        clinicalProfile: "adult",
        institutionalId: "",
      }),
    ).toThrow();
  });
});
```

Create `supabase/tests/patients_rls.sql` proving:

- Unit A nutritionist can insert/read Unit A;
- the same actor cannot insert/read Unit B;
- an active grant enables Unit B;
- coordinator reads both;
- `unit_id` cannot be null.

- [ ] **Step 3: Run tests to verify RED**

Run:

```bash
pnpm test src/modules/patients/schemas.test.ts
pnpm test:db
```

Expected: FAIL because patient schema, table and policies are absent.

- [ ] **Step 4: Implement patient schema and RLS**

Create:

```sql
create type public.sex_at_birth as enum
  ('female', 'male', 'intersex', 'not_informed');
create type public.clinical_profile as enum
  ('child', 'adolescent', 'adult', 'older_adult', 'pregnant');

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete restrict,
  institutional_id text,
  full_name text not null check (char_length(trim(full_name)) between 2 and 160),
  normalized_name text generated always as
    (lower(regexp_replace(trim(full_name), '\s+', ' ', 'g'))) stored,
  birth_date date not null,
  sex_at_birth public.sex_at_birth not null,
  clinical_profile public.clinical_profile not null,
  active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index patients_institutional_id_unique
  on public.patients(unit_id, institutional_id)
  where institutional_id is not null and institutional_id <> '';
create index patients_search_idx
  on public.patients(unit_id, normalized_name);

create function private.reject_future_birth_date()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.birth_date > current_date then
    raise exception 'FUTURE_BIRTH_DATE' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger patients_birth_date_guard
before insert or update of birth_date on public.patients
for each row execute function private.reject_future_birth_date();
```

Enable RLS. Select, insert and update policies require `private.can_access_unit(unit_id)`. Deletes are not granted. The insert policy also requires `created_by = (select auth.uid())`.

- [ ] **Step 5: Implement immutable input validation and server action**

Create:

```ts
export const patientInputSchema = z.object({
  unitId: z.string().uuid(),
  fullName: z.string().trim().min(2).max(160),
  birthDate: z.iso.date().refine(
    (value) => new Date(`${value}T00:00:00Z`) <= new Date(),
    "A data de nascimento não pode estar no futuro",
  ),
  sexAtBirth: z.enum(["female", "male", "intersex", "not_informed"]),
  clinicalProfile: z.literal("adult"),
  institutionalId: z.string().trim().max(80).optional(),
});
```

`createPatient` must:

1. parse the form;
2. call `requireUnitAccess(input.unitId)`;
3. insert with `created_by = actor.userId`;
4. translate unique violations to `Paciente possivelmente duplicado`;
5. redirect to `/pacientes/{id}`.

`listPatients` accepts `{ unitId, query, limit }`, limits results to 50, uses the authenticated client and never accepts an arbitrary sort column from the browser.

- [ ] **Step 6: Implement patient list and registration UI**

The list page shows:

- search input;
- active accessible-unit selector;
- `Cadastrar paciente` button;
- name, birth date, profile and primary unit.

The form has explicit labels and a hidden/fixed `clinicalProfile=adult` in this slice. The patient page shows identity, unit, an empty timeline and buttons `Agendar consulta` and `Nova consulta`.

Use server-rendered rows with stable links:

```tsx
{patients.map((patient) => (
  <li key={patient.id}>
    <Link href={`/pacientes/${patient.id}`}>
      <strong>{patient.fullName}</strong>
      <span>{formatBirthDate(patient.birthDate)}</span>
    </Link>
  </li>
))}
```

- [ ] **Step 7: Verify**

Run:

```bash
pnpm test src/modules/patients
pnpm test:db
pnpm lint
pnpm typecheck
pnpm build
```

Expected: all commands exit with code 0; negative RLS tests pass.

- [ ] **Step 8: Commit**

```bash
git add saude-nutricional-sesc
git commit -m "feat: add unit scoped patient registration"
```

## Task 2: Agenda diária e prevenção de conflito

**Files:**

- Create: `saude-nutricional-sesc/supabase/tests/schedule_conflicts.sql`
- Create: `saude-nutricional-sesc/supabase/migrations/20260728000300_schedule.sql`
- Create: `saude-nutricional-sesc/src/modules/schedule/types.ts`
- Create: `saude-nutricional-sesc/src/modules/schedule/schemas.ts`
- Create: `saude-nutricional-sesc/src/modules/schedule/schemas.test.ts`
- Create: `saude-nutricional-sesc/src/modules/schedule/repository.ts`
- Create: `saude-nutricional-sesc/src/modules/schedule/actions.ts`
- Create: `saude-nutricional-sesc/src/modules/schedule/appointment-form.tsx`
- Create: `saude-nutricional-sesc/src/app/(protected)/agenda/page.tsx`

**Interfaces:**

- Produces enum: `appointment_status`.
- Produces schema: `appointmentInputSchema`.
- Produces server action: `createAppointment`.
- Produces repository function: `listDayAppointments(unitId, localDate)`.

- [ ] **Step 1: Write failing validation and conflict tests**

Create a unit test proving:

```ts
expect(() =>
  appointmentInputSchema.parse({
    unitId,
    patientId,
    professionalId,
    startsAt: "2026-07-29T10:00:00-03:00",
    endsAt: "2026-07-29T09:30:00-03:00",
  }),
).toThrow("O término deve ocorrer após o início");
```

Create `supabase/tests/schedule_conflicts.sql` that inserts a 09:00–10:00 appointment and asserts an overlapping 09:30–10:30 appointment for the same professional raises exclusion violation `23P01`. Prove a different professional or adjacent 10:00 start succeeds.

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
pnpm test src/modules/schedule/schemas.test.ts
pnpm test:db
```

Expected: FAIL because schedule artifacts are missing.

- [ ] **Step 3: Implement appointments and database conflict protection**

Create:

```sql
create extension if not exists btree_gist;
create type public.appointment_status as enum
  ('scheduled', 'confirmed', 'completed', 'missed', 'cancelled');

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  professional_id uuid not null references public.profiles(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  status public.appointment_status not null default 'scheduled',
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  exclude using gist (
    professional_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('scheduled', 'confirmed'))
);
```

RLS requires `private.can_access_unit(unit_id)`. Insert also requires accessible patient unit and `created_by = auth.uid()`. No browser-provided `professional_id` may be accepted unless it equals the actor or the actor is coordinator.

- [ ] **Step 4: Implement schema, action and daily agenda**

Validate dates with `z.coerce.date()` and `.refine(endsAt > startsAt)`. `createAppointment` verifies patient and unit, then inserts. Translate `23P01` to `Este profissional já possui atendimento nesse horário`.

```ts
export const appointmentInputSchema = z
  .object({
    unitId: z.string().uuid(),
    patientId: z.string().uuid(),
    professionalId: z.string().uuid(),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
  })
  .refine((value) => value.endsAt > value.startsAt, {
    message: "O término deve ocorrer após o início",
    path: ["endsAt"],
  });
```

`listDayAppointments` converts the requested local date using `America/Belem` and queries an inclusive-exclusive UTC interval:

```ts
const dayStart = fromZonedTime(`${localDate}T00:00:00`, "America/Belem");
const dayEnd = addDays(dayStart, 1);
```

Render the daily list ordered by `starts_at`, with status badges and an `Iniciar consulta` action for scheduled/confirmed appointments.

- [ ] **Step 5: Verify**

Run:

```bash
pnpm test src/modules/schedule
pnpm test:db
pnpm lint
pnpm typecheck
pnpm build
```

Expected: unit and database tests pass, including adjacent appointments and cross-unit denial.

- [ ] **Step 6: Commit**

```bash
git add saude-nutricional-sesc
git commit -m "feat: add conflict safe daily schedule"
```

## Task 3: Regra de IMC adulto e ciclo transacional da consulta

**Files:**

- Create: `saude-nutricional-sesc/src/modules/encounters/types.ts`
- Create: `saude-nutricional-sesc/src/modules/encounters/adult-bmi.ts`
- Create: `saude-nutricional-sesc/src/modules/encounters/adult-bmi.test.ts`
- Create: `saude-nutricional-sesc/src/modules/encounters/state-machine.ts`
- Create: `saude-nutricional-sesc/src/modules/encounters/state-machine.test.ts`
- Create: `saude-nutricional-sesc/supabase/tests/encounter_lifecycle.sql`
- Create: `saude-nutricional-sesc/supabase/migrations/20260728000400_encounters.sql`
- Regenerate: `saude-nutricional-sesc/src/platform/types/database.ts`

**Interfaces:**

- Produces: `calculateAdultBmi(weightKg, heightM): AdultBmiResult`.
- Produces: `canTransitionEncounter(from, to): boolean`.
- Produces RPC: `save_encounter_draft(...) returns encounters`.
- Produces RPC: `finalize_encounter(...) returns encounters`.

- [ ] **Step 1: Write failing BMI and state-machine tests**

Create:

```ts
import { describe, expect, it } from "vitest";
import { calculateAdultBmi } from "./adult-bmi";

describe("calculateAdultBmi", () => {
  it.each([
    [50, 1.75, 16.3265, "underweight"],
    [70, 1.75, 22.8571, "adequate"],
    [80, 1.75, 26.1224, "overweight"],
    [100, 1.75, 32.6531, "obesity"],
  ] as const)("classifies %s kg / %s m", (weight, height, raw, category) => {
    const result = calculateAdultBmi(weight, height);
    expect(result.rawValue).toBeCloseTo(raw, 4);
    expect(result.displayValue).toBe(Number(raw.toFixed(1)));
    expect(result.category).toBe(category);
    expect(result.ruleCode).toBe("who-adult-bmi");
    expect(result.ruleVersion).toBe("2025-12-08");
  });

  it("rejects non-positive measurements", () => {
    expect(() => calculateAdultBmi(0, 1.75)).toThrow("INVALID_WEIGHT");
    expect(() => calculateAdultBmi(70, 0)).toThrow("INVALID_HEIGHT");
  });
});
```

Create state tests proving only `draft → finalized` is allowed and `finalized → draft` is rejected.

- [ ] **Step 2: Run unit tests to verify RED**

Run:

```bash
pnpm test src/modules/encounters/adult-bmi.test.ts \
  src/modules/encounters/state-machine.test.ts
```

Expected: FAIL because calculation and state modules do not exist.

- [ ] **Step 3: Implement pure clinical rule and state machine**

Create:

```ts
export type AdultBmiCategory =
  | "underweight"
  | "adequate"
  | "overweight"
  | "obesity";

export type AdultBmiResult = Readonly<{
  rawValue: number;
  displayValue: number;
  category: AdultBmiCategory;
  ruleCode: "who-adult-bmi";
  ruleVersion: "2025-12-08";
  sourceUrl: "https://www.who.int/en/news-room/fact-sheets/detail/obesity-and-overweight";
}>;

export function calculateAdultBmi(
  weightKg: number,
  heightM: number,
): AdultBmiResult {
  if (!Number.isFinite(weightKg) || weightKg <= 0) throw new Error("INVALID_WEIGHT");
  if (!Number.isFinite(heightM) || heightM <= 0) throw new Error("INVALID_HEIGHT");
  const rawValue = weightKg / heightM ** 2;
  const category =
    rawValue < 18.5
      ? "underweight"
      : rawValue < 25
        ? "adequate"
        : rawValue < 30
          ? "overweight"
          : "obesity";
  return Object.freeze({
    rawValue,
    displayValue: Number(rawValue.toFixed(1)),
    category,
    ruleCode: "who-adult-bmi",
    ruleVersion: "2025-12-08",
    sourceUrl:
      "https://www.who.int/en/news-room/fact-sheets/detail/obesity-and-overweight",
  });
}
```

`canTransitionEncounter` returns true only for identical `draft` state or `draft → finalized`; any mutation from `finalized` returns false.

- [ ] **Step 4: Write failing database lifecycle tests**

Create `supabase/tests/encounter_lifecycle.sql` proving:

1. create draft for an accessible appointment;
2. save revision 0 with idempotency key `00000000-0000-4000-8000-000000000101`;
3. repeat the same command and receive the same revision without duplicate measurements;
4. save with stale expected revision and receive `ENCOUNTER_REVISION_CONFLICT`;
5. finalize revision 1 and mark the linked appointment completed in one transaction;
6. attempt to update finalized notes and receive `FINALIZED_ENCOUNTER_IMMUTABLE`;
7. cross-unit actor receives no row;
8. audit event contains only encounter id, unit id, action and revision.

- [ ] **Step 5: Implement encounter storage, idempotency and immutability**

Create enums/tables:

```sql
create type public.encounter_status as enum ('draft', 'finalized');

create table public.encounters (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  appointment_id uuid unique references public.appointments(id) on delete restrict,
  professional_id uuid not null references public.profiles(id) on delete restrict,
  status public.encounter_status not null default 'draft',
  revision integer not null default 0 check (revision >= 0),
  patient_snapshot jsonb not null,
  reason text not null default '',
  clinical_notes text not null default '',
  finalized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.encounter_measurements (
  id uuid primary key default gen_random_uuid(),
  encounter_id uuid not null references public.encounters(id) on delete restrict,
  code text not null check (code in ('weight_kg', 'height_m', 'bmi')),
  numeric_value numeric not null,
  unit text not null,
  rule_code text,
  rule_version text,
  source_url text,
  created_at timestamptz not null default now(),
  unique (encounter_id, code)
);

create table public.encounter_commands (
  actor_id uuid not null references public.profiles(id) on delete restrict,
  idempotency_key uuid not null,
  encounter_id uuid not null references public.encounters(id) on delete restrict,
  resulting_revision integer not null,
  created_at timestamptz not null default now(),
  primary key (actor_id, idempotency_key)
);
```

Implement `save_encounter_draft` and `finalize_encounter` as `security definer` functions with empty search path. Each function:

- verifies `private.can_access_unit`;
- verifies actor is the assigned professional or a coordinator;
- locks the encounter `for update`;
- checks status and expected revision;
- returns the previous result for a repeated idempotency key;
- updates notes and upserts measurements atomically;
- increments revision once;
- marks the linked appointment `completed` inside `finalize_encounter`;
- writes metadata-only audit.

Add a trigger that rejects updates/deletes to encounters and measurements when the existing encounter is finalized. Permit status change to `finalized` only inside `finalize_encounter`.

- [ ] **Step 6: Verify lifecycle and generated types**

Run:

```bash
pnpm test src/modules/encounters
pnpm exec supabase db reset
pnpm test:db
pnpm exec supabase gen types typescript --local \
  > src/platform/types/database.ts
```

Expected: clinical unit tests and all lifecycle assertions pass.

- [ ] **Step 7: Commit**

```bash
git add saude-nutricional-sesc
git commit -m "feat: add immutable encounter lifecycle"
```

## Task 4: Formulário de consulta com autosave seguro

**Files:**

- Create: `saude-nutricional-sesc/src/modules/encounters/repository.ts`
- Create: `saude-nutricional-sesc/src/modules/encounters/actions.ts`
- Create: `saude-nutricional-sesc/src/modules/encounters/encounter-form.tsx`
- Create: `saude-nutricional-sesc/src/modules/encounters/encounter-form.test.tsx`
- Create: `saude-nutricional-sesc/src/app/(protected)/pacientes/[patientId]/consultas/[encounterId]/page.tsx`
- Modify: `saude-nutricional-sesc/src/app/(protected)/agenda/page.tsx`

**Interfaces:**

- Consumes: `calculateAdultBmi`, `save_encounter_draft`, `finalize_encounter`.
- Produces server actions: `startEncounter`, `saveDraft`, `finalizeEncounter`.
- Produces route: `/pacientes/[patientId]/consultas/[encounterId]`.

- [ ] **Step 1: Write failing form behavior tests**

Use fake timers and a mocked action:

```tsx
it("calculates BMI and autosaves one immutable payload after 800 ms", async () => {
  render(<EncounterForm initialEncounter={draftFixture} saveDraft={saveDraftSpy} />);

  await userEvent.clear(screen.getByLabelText("Peso"));
  await userEvent.type(screen.getByLabelText("Peso"), "80");
  await userEvent.clear(screen.getByLabelText("Altura"));
  await userEvent.type(screen.getByLabelText("Altura"), "1.75");

  expect(screen.getByText("26,1")).toBeInTheDocument();
  expect(screen.getByText("Sobrepeso")).toBeInTheDocument();

  await vi.advanceTimersByTimeAsync(800);
  expect(saveDraftSpy).toHaveBeenCalledTimes(1);
  expect(saveDraftSpy.mock.calls[0][0]).toMatchObject({
    expectedRevision: 0,
    weightKg: 80,
    heightM: 1.75,
  });
});
```

Add tests for:

- no save while required numeric input is invalid;
- revision updates after success;
- conflict displays `Este prontuário foi atualizado em outra sessão`;
- finalize requires explicit confirmation.

- [ ] **Step 2: Run component tests to verify RED**

Run:

```bash
pnpm test src/modules/encounters/encounter-form.test.tsx
```

Expected: FAIL because actions and form are missing.

- [ ] **Step 3: Implement server actions with boundary validation**

Define immutable commands:

```ts
export const saveDraftSchema = z.object({
  encounterId: z.string().uuid(),
  expectedRevision: z.number().int().nonnegative(),
  idempotencyKey: z.string().uuid(),
  reason: z.string().trim().max(2_000),
  clinicalNotes: z.string().trim().max(20_000),
  weightKg: z.number().positive().max(500),
  heightM: z.number().positive().max(2.5),
});

export type SaveDraftCommand = Readonly<z.infer<typeof saveDraftSchema>>;
```

`startEncounter` verifies appointment, patient and unit, snapshots patient identity/profile, and creates one draft per appointment. `saveDraft` calculates BMI on the server and calls the RPC. `finalizeEncounter` recalculates BMI, calls the finalization RPC—which also completes the appointment in the same transaction—and then redirects to the patient page.

- [ ] **Step 4: Implement accessible consultation UI**

Render:

- patient and appointment header;
- `Motivo da consulta`;
- `Observações clínicas`;
- `Peso (kg)`;
- `Altura (m)`;
- computed `IMC`, category, rule and source;
- save status `Salvando…`, `Salvo` or conflict;
- button `Finalizar consulta`.

Bind the calculated result as read-only output:

```tsx
<output aria-live="polite" aria-label="Resultado do IMC">
  <strong>{bmi.displayValue.toLocaleString("pt-BR")}</strong>
  <span>{categoryLabel[bmi.category]}</span>
  <small>
    Regra {bmi.ruleCode} • versão {bmi.ruleVersion}
  </small>
</output>
```

Generate a new UUID idempotency key for each logical edit batch and reuse it on retry. Never mutate the existing form state object; create a new command object. Debounce autosave by 800 ms and flush a valid pending save before finalization.

- [ ] **Step 5: Verify**

Run:

```bash
pnpm test src/modules/encounters
pnpm lint
pnpm typecheck
pnpm build
```

Expected: all commands pass; autosave, conflict and finalization branches are covered.

- [ ] **Step 6: Commit**

```bash
git add saude-nutricional-sesc
git commit -m "feat: add safe clinical consultation form"
```

## Task 5: Linha do tempo e E2E do primeiro atendimento

**Files:**

- Create: `saude-nutricional-sesc/src/modules/encounters/timeline.tsx`
- Create: `saude-nutricional-sesc/src/modules/encounters/timeline.test.tsx`
- Modify: `saude-nutricional-sesc/src/modules/encounters/repository.ts`
- Modify: `saude-nutricional-sesc/src/app/(protected)/pacientes/[patientId]/page.tsx`
- Create: `saude-nutricional-sesc/tests/e2e/first-clinical-encounter.spec.ts`
- Create: `saude-nutricional-sesc/tests/e2e/helpers.ts`
- Modify: `saude-nutricional-sesc/README.md`

**Interfaces:**

- Produces: `listPatientTimeline(patientId): Promise<readonly TimelineEntry[]>`.
- Produces: read-only timeline containing finalized encounters.
- Produces: complete clinical E2E acceptance test.

- [ ] **Step 1: Write the failing read-only timeline test**

Create:

```tsx
it("shows finalized encounter values without edit controls", () => {
  render(<Timeline entries={[finalizedEncounterFixture]} />);

  expect(screen.getByText("Consulta finalizada")).toBeInTheDocument();
  expect(screen.getByText("80 kg")).toBeInTheDocument();
  expect(screen.getByText("1,75 m")).toBeInTheDocument();
  expect(screen.getByText("IMC 26,1 • Sobrepeso")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /editar/i })).toBeNull();
});
```

- [ ] **Step 2: Run the timeline test to verify RED**

Run:

```bash
pnpm test src/modules/encounters/timeline.test.tsx
```

Expected: FAIL because the timeline component does not exist.

- [ ] **Step 3: Implement server-filtered timeline**

`listPatientTimeline` must:

1. call `loadActor()`;
2. load the patient through RLS;
3. call `requireAccessibleUnit`;
4. select only finalized encounters and measurements;
5. order by `finalized_at desc`;
6. map database rows to new immutable view objects.

Display date/time in `America/Belem`, professional, unit, reason, notes, weight, height, raw rule metadata and localized category. Do not provide update/delete controls.

Return frozen view objects:

```ts
return rows.map((row) =>
  Object.freeze({
    id: row.id,
    finalizedAt: row.finalized_at,
    professionalName: row.professional.full_name,
    unitName: row.unit.name,
    reason: row.reason,
    clinicalNotes: row.clinical_notes,
    measurements: Object.freeze([...row.encounter_measurements]),
  }),
);
```

- [ ] **Step 4: Write the failing complete E2E flow**

Create `tests/e2e/first-clinical-encounter.spec.ts`:

```ts
test("nutritionist completes an adult nutritional encounter", async ({ page }) => {
  await loginAsNutritionist(page);
  await page.getByRole("link", { name: "Pacientes" }).click();
  await page.getByRole("button", { name: "Cadastrar paciente" }).click();
  await fillAdultPatient(page, {
    fullName: "Marina Almeida",
    birthDate: "1988-04-12",
    sexAtBirth: "female",
    institutionalId: "SESC-E2E-001",
  });
  await page.getByRole("button", { name: "Salvar paciente" }).click();

  await page.getByRole("button", { name: "Agendar consulta" }).click();
  await fillAppointment(page, "2026-08-03", "09:00", "10:00");
  await page.getByRole("button", { name: "Agendar" }).click();
  await page.getByRole("button", { name: "Iniciar consulta" }).click();

  await page.getByLabel("Motivo da consulta").fill("Acompanhamento nutricional");
  await page.getByLabel("Observações clínicas").fill("Registro clínico de teste");
  await page.getByLabel("Peso").fill("80");
  await page.getByLabel("Altura").fill("1.75");
  await expect(page.getByText("26,1")).toBeVisible();
  await expect(page.getByText("Sobrepeso")).toBeVisible();
  await expect(page.getByText("Salvo")).toBeVisible();

  await page.getByRole("button", { name: "Finalizar consulta" }).click();
  await page.getByRole("button", { name: "Confirmar finalização" }).click();

  await expect(page.getByText("Consulta finalizada")).toBeVisible();
  await expect(page.getByText("IMC 26,1 • Sobrepeso")).toBeVisible();
  await expect(page.getByRole("button", { name: /editar/i })).toHaveCount(0);
});
```

Provide exact helpers in `tests/e2e/helpers.ts`; helpers contain selectors only and never bypass the UI or RLS.

- [ ] **Step 5: Run the E2E test to verify RED, then complete wiring**

Run:

```bash
pnpm test:e2e tests/e2e/first-clinical-encounter.spec.ts
```

Expected initially: FAIL at the first missing selector or route.

Wire the agenda `Iniciar consulta` action, patient navigation, confirmation dialog and timeline until the exact test passes. Do not weaken the assertions.

- [ ] **Step 6: Run the complete verification loop**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm test:db
pnpm test:e2e
pnpm build
pnpm audit --prod
git diff --check
```

Expected:

- all commands exit with code 0;
- coverage is at least 80%;
- access, BMI, state and idempotency critical branches are 100%;
- no critical or high production vulnerability;
- E2E completes the vertical slice.

- [ ] **Step 7: Review gates**

Run a code-quality review and a security review. Confirm:

- every operation is unit-scoped;
- negative cross-unit tests exist;
- finalized records cannot be changed in UI, API or SQL;
- repeated idempotency keys cannot create extra revisions;
- BMI source/version is visible and tested;
- audit metadata contains no reason or clinical notes;
- no secret or patient fixture is staged.

Fix critical and high findings and rerun Step 6.

- [ ] **Step 8: Commit**

```bash
git add saude-nutricional-sesc
git commit -m "feat: complete first nutritional encounter"
```
