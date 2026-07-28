# Saúde Nutricional Sesc — Fundação Segura Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar a fundação executável do piloto com qualidade automatizada, login por convite, duas funções, duas unidades, autorização entre unidades, Row Level Security e auditoria sem conteúdo clínico.

**Architecture:** Criar um monólito modular em `saude-nutricional-sesc/`, usando Next.js App Router para interface e operações no servidor e Supabase para Auth e PostgreSQL. O módulo `access` será a única fonte das regras de função e unidade; toda operação futura consumirá o mesmo `ActorContext` e continuará protegida por RLS no banco.

**Tech Stack:** Node.js 24, pnpm 11, Next.js 16.2.9, React, TypeScript strict, Tailwind CSS, Supabase Auth/PostgreSQL/CLI, Zod, Vitest, Testing Library, pgTAP e Playwright.

## Global Constraints

- O app fica isolado em `saude-nutricional-sesc/`.
- A interface é otimizada para computador e tablet.
- A identidade usa azul institucional, amarelo de destaque e o nome de trabalho `Saúde Nutricional`.
- Existem somente os perfis `coordinator` e `nutritionist`.
- Contas entram por convite; cadastro público fica desabilitado.
- Cada perfil possui uma unidade principal.
- Acesso à outra unidade exige concessão registrada com concedente, motivo, início, validade e eventual revogação.
- Toda autorização é verificada no servidor e novamente por RLS.
- A service-role key nunca é exposta ao navegador.
- Auditoria não recebe anamnese, observações ou outro conteúdo clínico.
- Segredos ficam apenas no ambiente; `.env.local` não é versionado.
- Cobertura global mínima de 80%; funções de autorização exigem 100% dos ramos.
- Commits usam Conventional Commits e incluem somente os arquivos do app ou dos planos.

---

## File Map

```text
saude-nutricional-sesc/
├── .env.example
├── .env.test.example
├── .gitignore
├── package.json
├── playwright.config.ts
├── scripts/seed-local-users.mjs
├── vitest.config.ts
├── vitest.setup.ts
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (protected)/layout.tsx
│   │   ├── (protected)/inicio/page.tsx
│   │   ├── (protected)/settings/access/page.tsx
│   │   ├── error.tsx
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/app-shell.tsx
│   ├── modules/access/
│   │   ├── actions.ts
│   │   ├── actor.ts
│   │   ├── authorization.ts
│   │   ├── authorization.test.ts
│   │   ├── repository.ts
│   │   ├── schemas.ts
│   │   └── types.ts
│   ├── platform/env.ts
│   ├── platform/supabase/browser.ts
│   ├── platform/supabase/server.ts
│   ├── platform/supabase/update-session.ts
│   ├── platform/types/database.ts
│   └── proxy.ts
├── supabase/
│   ├── config.toml
│   ├── migrations/20260728000100_access_foundation.sql
│   ├── seed.sql
│   └── tests/access_foundation.sql
└── tests/e2e/access-foundation.spec.ts
```

## Task 1: Scaffold do app e quality gates

**Files:**

- Create: `saude-nutricional-sesc/package.json`
- Create: `saude-nutricional-sesc/vitest.config.ts`
- Create: `saude-nutricional-sesc/vitest.setup.ts`
- Create: `saude-nutricional-sesc/playwright.config.ts`
- Create: `saude-nutricional-sesc/src/app/layout.tsx`
- Create: `saude-nutricional-sesc/src/app/page.test.tsx`
- Create: `saude-nutricional-sesc/src/app/page.tsx`
- Create: `saude-nutricional-sesc/src/app/globals.css`
- Create: `saude-nutricional-sesc/.env.example`
- Create: `saude-nutricional-sesc/.gitignore`

**Interfaces:**

- Produces: scripts `dev`, `build`, `lint`, `typecheck`, `test`, `test:coverage`, `test:db` e `test:e2e`.
- Produces: alias TypeScript `@/*` apontando para `src/*`.
- Produces: layout base com largura mínima suportada de 768 px.

- [ ] **Step 1: Scaffold the application and install test dependencies**

Run:

```bash
pnpm create next-app@16.2.9 saude-nutricional-sesc \
  --ts --eslint --tailwind --app --src-dir \
  --import-alias "@/*" --use-pnpm
cd saude-nutricional-sesc
pnpm add @supabase/ssr @supabase/supabase-js zod
pnpm add -D vitest @vitejs/plugin-react jsdom \
  @vitest/coverage-v8 dotenv-cli \
  @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event @playwright/test supabase
pnpm pkg set packageManager=pnpm@11.9.0
pnpm pkg set scripts.typecheck="tsc --noEmit"
pnpm pkg set scripts.test="vitest run"
pnpm pkg set scripts.test:coverage="vitest run --coverage"
pnpm pkg set scripts.test:db="supabase test db"
pnpm pkg set scripts.test:e2e="dotenv -e .env.test.local -- playwright test"
```

Expected: Next.js is scaffolded under `saude-nutricional-sesc/`; the lockfile is `pnpm-lock.yaml`.

- [ ] **Step 2: Write the failing institutional shell test**

Create `src/app/page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("identifies the Saúde Nutricional pilot", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "Saúde Nutricional" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Acesso clínico seguro")).toBeInTheDocument();
  });
});
```

Create:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

Import `@testing-library/jest-dom/vitest` from `vitest.setup.ts`.

- [ ] **Step 3: Run the test to verify RED**

Run:

```bash
pnpm test src/app/page.test.tsx
```

Expected: FAIL because the scaffolded page does not contain `Saúde Nutricional` and `Acesso clínico seguro`.

- [ ] **Step 4: Implement the minimal institutional shell**

Replace `src/app/page.tsx` with:

```tsx
export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-8 py-12 text-slate-950">
      <section className="mx-auto max-w-5xl border-t-8 border-amber-400 bg-white p-10 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-800">
          Piloto • duas unidades
        </p>
        <h1 className="mt-3 text-4xl font-bold text-blue-950">
          Saúde Nutricional
        </h1>
        <p className="mt-4 text-lg text-slate-600">Acesso clínico seguro</p>
      </section>
    </main>
  );
}
```

Set `metadata.title` to `Saúde Nutricional` and `metadata.description` to `Piloto clínico nutricional para duas unidades` in `src/app/layout.tsx`. Keep global colors as CSS variables and do not copy a logo that was not provided.

Create `.env.example` with names only:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Create `.gitignore` entries for `.env*`, with `!.env.example`, plus `.next/`, `coverage/`, `playwright-report/` and `test-results/`.

- [ ] **Step 5: Verify GREEN and the production build**

Run:

```bash
pnpm test src/app/page.test.tsx
pnpm lint
pnpm typecheck
pnpm build
```

Expected: all commands exit with code 0.

- [ ] **Step 6: Commit**

```bash
git add saude-nutricional-sesc
git commit -m "feat: scaffold saude nutricional app"
```

## Task 2: Banco de acesso, RLS e auditoria

**Files:**

- Create: `saude-nutricional-sesc/supabase/config.toml`
- Create: `saude-nutricional-sesc/supabase/tests/access_foundation.sql`
- Create: `saude-nutricional-sesc/supabase/migrations/20260728000100_access_foundation.sql`
- Create: `saude-nutricional-sesc/supabase/seed.sql`
- Create: `saude-nutricional-sesc/src/platform/types/database.ts`

**Interfaces:**

- Produces tables: `units`, `profiles`, `unit_access_grants`, `audit_events`.
- Produces enum: `app_role = 'coordinator' | 'nutritionist'`.
- Produces function: `private.can_access_unit(target_unit_id uuid) returns boolean`.
- Produces function: `private.is_coordinator() returns boolean`.
- Produces RPC: `grant_unit_access(target_profile_id uuid, target_unit_id uuid, reason text, valid_until timestamptz) returns uuid`.
- Produces RPC: `revoke_unit_access(grant_id uuid, reason text) returns void`.

- [ ] **Step 1: Initialize Supabase and write failing pgTAP access tests**

Run:

```bash
cd saude-nutricional-sesc
pnpm exec supabase init
```

Create `supabase/tests/access_foundation.sql` with tests that:

1. authenticate as a nutritionist from Unit A using `set_config('request.jwt.claims', ...)`;
2. assert `private.can_access_unit(unit_a_id)` is true;
3. assert `private.can_access_unit(unit_b_id)` is false;
4. insert an active cross-unit grant as a coordinator;
5. assert Unit B becomes accessible;
6. revoke the grant;
7. assert Unit B is inaccessible again;
8. assert a nutritionist cannot call `grant_unit_access`;
9. assert audit metadata has no keys named `clinical_text`, `notes` or `anamnesis`.

Use fixed test UUIDs:

```sql
\set coordinator_id '00000000-0000-4000-8000-000000000001'
\set nutritionist_id '00000000-0000-4000-8000-000000000002'
\set unit_a_id '10000000-0000-4000-8000-000000000001'
\set unit_b_id '10000000-0000-4000-8000-000000000002'

begin;
select plan(9);
-- assertions use lives_ok, throws_ok, ok and is
select * from finish();
rollback;
```

- [ ] **Step 2: Run database tests to verify RED**

Run:

```bash
pnpm exec supabase start
pnpm test:db
```

Expected: FAIL because the access tables and functions do not exist.

- [ ] **Step 3: Implement the access schema and policies**

Create `supabase/migrations/20260728000100_access_foundation.sql` with:

```sql
create extension if not exists pgcrypto;

create type public.app_role as enum ('coordinator', 'nutritionist');

create table public.units (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 2 and 120),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  full_name text not null check (char_length(trim(full_name)) between 2 and 160),
  role public.app_role not null,
  primary_unit_id uuid not null references public.units(id) on delete restrict,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.unit_access_grants (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete restrict,
  unit_id uuid not null references public.units(id) on delete restrict,
  reason text not null check (char_length(trim(reason)) between 5 and 500),
  granted_by uuid not null references public.profiles(id) on delete restrict,
  valid_from timestamptz not null default now(),
  valid_until timestamptz not null check (valid_until > valid_from),
  revoked_at timestamptz,
  revoked_by uuid references public.profiles(id) on delete restrict,
  revocation_reason text,
  created_at timestamptz not null default now()
);

create unique index one_active_grant_per_profile_unit
  on public.unit_access_grants(profile_id, unit_id)
  where revoked_at is null;

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  unit_id uuid references public.units(id) on delete set null,
  event_type text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  check (not (metadata ?| array['clinical_text', 'notes', 'anamnesis']))
);
```

Add `private.current_profile()`, `private.is_coordinator()` and `private.can_access_unit(uuid)` as `security definer`, `stable`, with `set search_path = ''`. `can_access_unit` returns true for an active coordinator, the active profile's primary unit, or a non-revoked grant whose validity contains `now()`.

Enable RLS on all public tables. Policies must:

- allow authenticated active profiles to read their own profile;
- allow coordinators to read active profiles and units;
- allow a nutritionist to read only its own active grants;
- allow coordinators to read all grants;
- deny direct inserts/updates/deletes on grants and audit events to authenticated users;
- expose grant/revoke only through coordinator-checked RPCs;
- insert audit events inside each RPC.

Grant only the minimum table and function privileges to `authenticated`. Revoke all access from `anon`.

Seed two non-production units:

```sql
insert into public.units (id, name) values
  ('10000000-0000-4000-8000-000000000001', 'Unidade Piloto 1'),
  ('10000000-0000-4000-8000-000000000002', 'Unidade Piloto 2')
on conflict (id) do update set name = excluded.name;
```

- [ ] **Step 4: Verify RLS and generate types**

Run:

```bash
pnpm exec supabase db reset
pnpm test:db
pnpm exec supabase gen types typescript --local \
  > src/platform/types/database.ts
```

Expected: 9 pgTAP assertions pass; the generated `Database` type contains the four tables and two RPCs.

- [ ] **Step 5: Review migration security**

Run:

```bash
rg -n "service_role|clinical_text|notes|anamnesis" \
  supabase/migrations supabase/tests
pnpm exec supabase db lint --level warning
```

Expected: `service_role` does not appear in browser-facing SQL; prohibited clinical keys appear only in the audit constraint/test; database lint has no security errors.

- [ ] **Step 6: Commit**

```bash
git add saude-nutricional-sesc/supabase \
  saude-nutricional-sesc/src/platform/types/database.ts
git commit -m "feat: enforce unit access with row level security"
```

## Task 3: Auth SSR e contexto de acesso único

**Files:**

- Create: `saude-nutricional-sesc/src/platform/env.ts`
- Create: `saude-nutricional-sesc/src/platform/supabase/browser.ts`
- Create: `saude-nutricional-sesc/src/platform/supabase/server.ts`
- Create: `saude-nutricional-sesc/src/platform/supabase/update-session.ts`
- Create: `saude-nutricional-sesc/src/proxy.ts`
- Create: `saude-nutricional-sesc/src/modules/access/types.ts`
- Create: `saude-nutricional-sesc/src/modules/access/authorization.ts`
- Create: `saude-nutricional-sesc/src/modules/access/authorization.test.ts`
- Create: `saude-nutricional-sesc/src/modules/access/actor.ts`
- Create: `saude-nutricional-sesc/src/modules/access/schemas.ts`
- Create: `saude-nutricional-sesc/src/modules/access/actions.ts`
- Create: `saude-nutricional-sesc/src/app/(auth)/login/page.tsx`

**Interfaces:**

- Produces type: `ActorContext`.
- Produces pure functions: `canAccessUnit(actor, unitId)` and `requireCoordinator(actor)`.
- Produces server function: `loadActor(): Promise<ActorContext>`.
- Produces server function: `requireUnitAccess(unitId: string): Promise<ActorContext>`.
- Produces server action: `signIn(_: ActionState, formData: FormData): Promise<ActionState>`.

- [ ] **Step 1: Write failing authorization tests**

Create `src/modules/access/authorization.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  canAccessUnit,
  requireCoordinator,
} from "@/modules/access/authorization";
import type { ActorContext } from "@/modules/access/types";

const actor: ActorContext = {
  userId: "00000000-0000-4000-8000-000000000002",
  fullName: "Nutricionista Teste",
  role: "nutritionist",
  primaryUnitId: "10000000-0000-4000-8000-000000000001",
  accessibleUnitIds: ["10000000-0000-4000-8000-000000000001"],
};

describe("authorization", () => {
  it("allows the primary unit", () => {
    expect(canAccessUnit(actor, actor.primaryUnitId)).toBe(true);
  });

  it("denies a unit absent from accessibleUnitIds", () => {
    expect(
      canAccessUnit(actor, "10000000-0000-4000-8000-000000000002"),
    ).toBe(false);
  });

  it("requires coordinator role", () => {
    expect(() => requireCoordinator(actor)).toThrowError("FORBIDDEN");
  });
});
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
pnpm test src/modules/access/authorization.test.ts
```

Expected: FAIL because the access types and functions are missing.

- [ ] **Step 3: Implement immutable access types and pure guards**

Create `src/modules/access/types.ts`:

```ts
export type AppRole = "coordinator" | "nutritionist";

export type ActorContext = Readonly<{
  userId: string;
  fullName: string;
  role: AppRole;
  primaryUnitId: string;
  accessibleUnitIds: readonly string[];
}>;
```

Create `src/modules/access/authorization.ts`:

```ts
import type { ActorContext } from "./types";

export function canAccessUnit(
  actor: ActorContext,
  unitId: string,
): boolean {
  return actor.accessibleUnitIds.includes(unitId);
}

export function requireCoordinator(actor: ActorContext): ActorContext {
  if (actor.role !== "coordinator") {
    throw new Error("FORBIDDEN");
  }
  return actor;
}

export function requireAccessibleUnit(
  actor: ActorContext,
  unitId: string,
): ActorContext {
  if (!canAccessUnit(actor, unitId)) {
    throw new Error("UNIT_FORBIDDEN");
  }
  return actor;
}
```

- [ ] **Step 4: Implement validated environment and Supabase clients**

Use Zod in `src/platform/env.ts`:

```ts
import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
});

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});
```

Create a browser client with `createBrowserClient<Database>()`. Create a server client with `createServerClient<Database>()`, `await cookies()`, `getAll` and `setAll`. Do not import `SUPABASE_SERVICE_ROLE_KEY` in either file.

In `src/platform/supabase/update-session.ts`, refresh authentication with `supabase.auth.getUser()` and copy changed cookies to the returned response. Export it from `src/proxy.ts`:

```ts
import type { NextRequest } from "next/server";
import { updateSession } from "@/platform/supabase/update-session";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 5: Implement actor loading and invitation-only login**

`loadActor()` must call `supabase.auth.getUser()`, fetch the active profile and active grants, and return a newly created immutable `ActorContext`. It must redirect unauthenticated users to `/login` and throw `PROFILE_INACTIVE` for an absent/inactive profile.

In the same server-only module, implement:

```ts
export async function requireUnitAccess(
  unitId: string,
): Promise<ActorContext> {
  const actor = await loadActor();
  return requireAccessibleUnit(actor, unitId);
}
```

Validate login form data:

```ts
export const signInSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(12, "A senha deve ter pelo menos 12 caracteres"),
});
```

`signIn` calls `supabase.auth.signInWithPassword`, returns a generic `Credenciais inválidas` for all authentication failures, and redirects to `/inicio` on success. The login page must not contain a registration link.

- [ ] **Step 6: Verify unit tests, lint, types and build**

Run:

```bash
pnpm test src/modules/access/authorization.test.ts
pnpm lint
pnpm typecheck
pnpm build
```

Expected: all commands exit with code 0 and the authorization branch coverage is 100%.

- [ ] **Step 7: Commit**

```bash
git add saude-nutricional-sesc/src
git commit -m "feat: add invitation only authentication"
```

## Task 4: Shell protegido e administração de acessos

**Files:**

- Create: `saude-nutricional-sesc/src/components/app-shell.tsx`
- Create: `saude-nutricional-sesc/src/components/app-shell.test.tsx`
- Create: `saude-nutricional-sesc/src/modules/access/repository.ts`
- Modify: `saude-nutricional-sesc/src/modules/access/actions.ts`
- Create: `saude-nutricional-sesc/src/app/(protected)/layout.tsx`
- Create: `saude-nutricional-sesc/src/app/(protected)/inicio/page.tsx`
- Create: `saude-nutricional-sesc/src/app/(protected)/settings/access/page.tsx`
- Create: `saude-nutricional-sesc/src/app/error.tsx`

**Interfaces:**

- Consumes: `loadActor()`, `requireCoordinator(actor)`, `grant_unit_access` and `revoke_unit_access`.
- Produces: `listAccessGrants(): Promise<readonly AccessGrantSummary[]>`.
- Produces server actions: `grantAccess` and `revokeAccess`.
- Produces protected routes `/inicio` and `/settings/access`.

- [ ] **Step 1: Write the failing protected-shell component test**

Create `src/components/app-shell.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { AppShell } from "./app-shell";

it("shows actor and primary unit without exposing settings to nutritionists", () => {
  render(
    <AppShell
      actor={{
        userId: "user-1",
        fullName: "Ana Nutricionista",
        role: "nutritionist",
        primaryUnitId: "unit-1",
        accessibleUnitIds: ["unit-1"],
      }}
      primaryUnitName="Unidade Piloto 1"
    >
      <p>Conteúdo</p>
    </AppShell>,
  );

  expect(screen.getByText("Ana Nutricionista")).toBeInTheDocument();
  expect(screen.getByText("Unidade Piloto 1")).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Configurações" })).toBeNull();
});
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
pnpm test src/components/app-shell.test.tsx
```

Expected: FAIL because `AppShell` does not exist.

- [ ] **Step 3: Implement the protected institutional shell**

`AppShell` must render:

- top bar in blue;
- a yellow 4 px accent;
- actor name and primary unit;
- links `Início`, `Pacientes`, `Agenda` and `Relatórios`;
- `Configurações` only for coordinators;
- `children` in a semantic `<main>`.

Use a new navigation array rather than mutating a shared constant:

```tsx
const baseLinks = [
  { href: "/inicio", label: "Início" },
  { href: "/pacientes", label: "Pacientes" },
  { href: "/agenda", label: "Agenda" },
  { href: "/relatorios", label: "Relatórios" },
] as const;
const links =
  actor.role === "coordinator"
    ? [...baseLinks, { href: "/settings/access", label: "Configurações" }]
    : [...baseLinks];
```

The protected layout calls `loadActor()` and the unit repository before rendering. The `/inicio` route shows only a welcome card and the accessible-unit count; patient and agenda links may point to the routes implemented in Plan 01.

- [ ] **Step 4: Implement coordinator-only grant actions**

Define:

```ts
export const grantAccessSchema = z.object({
  profileId: z.string().uuid(),
  unitId: z.string().uuid(),
  reason: z.string().trim().min(5).max(500),
  validUntil: z.coerce.date().refine(
    (value) => value.getTime() > Date.now(),
    "A validade deve estar no futuro",
  ),
});
```

`grantAccess` and `revokeAccess` must:

1. call `loadActor()`;
2. call `requireCoordinator(actor)`;
3. validate input;
4. call the corresponding RPC with the authenticated server client;
5. return a generic error without database internals; and
6. revalidate `/settings/access`.

The settings page lists active and revoked grants, reason, grantor and validity. It never exposes auth tokens or service keys.

- [ ] **Step 5: Verify component and authorization behavior**

Add a second component test proving coordinators see `Configurações`. Add action tests with a mocked repository proving a nutritionist is rejected before any RPC call.

Run:

```bash
pnpm test src/components src/modules/access
pnpm lint
pnpm typecheck
pnpm build
```

Expected: all commands exit with code 0.

- [ ] **Step 6: Commit**

```bash
git add saude-nutricional-sesc/src
git commit -m "feat: add protected access administration"
```

## Task 5: Teste E2E, auditoria de segurança e fechamento da fundação

**Files:**

- Create: `saude-nutricional-sesc/tests/e2e/access-foundation.spec.ts`
- Modify: `saude-nutricional-sesc/playwright.config.ts`
- Modify: `saude-nutricional-sesc/supabase/seed.sql`
- Modify: `saude-nutricional-sesc/package.json`
- Create: `saude-nutricional-sesc/scripts/seed-local-users.mjs`
- Create: `saude-nutricional-sesc/.env.test.example`
- Create: `saude-nutricional-sesc/README.md`

**Interfaces:**

- Consumes: login, shell protegido e administração de grants.
- Produces: fluxo E2E reproduzível e documentação de desenvolvimento local.

- [ ] **Step 1: Write the failing access E2E test**

Create `tests/e2e/access-foundation.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("coordinator grants and revokes cross-unit access", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("coordinator@example.test");
  await page
    .getByLabel("Senha")
    .fill(process.env.E2E_COORDINATOR_PASSWORD ?? "");
  await page.getByRole("button", { name: "Entrar" }).click();

  await page.getByRole("link", { name: "Configurações" }).click();
  await page.getByLabel("Profissional").selectOption({ label: "Nutricionista Teste" });
  await page.getByLabel("Unidade").selectOption({ label: "Unidade Piloto 2" });
  await page.getByLabel("Motivo").fill("Cobertura temporária do atendimento");
  await page.getByLabel("Válido até").fill("2026-12-31");
  await page.getByRole("button", { name: "Autorizar acesso" }).click();

  await expect(
    page.getByText("Cobertura temporária do atendimento"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Revogar" }).click();
  await expect(page.getByText("Acesso revogado")).toBeVisible();
});
```

- [ ] **Step 2: Run E2E to verify RED**

Run:

```bash
pnpm exec playwright install chromium
pnpm test:e2e tests/e2e/access-foundation.spec.ts
```

Expected: FAIL until local Auth fixtures, selectors and the full settings flow are wired.

- [ ] **Step 3: Add deterministic local users and complete selectors**

Keep `supabase/seed.sql` limited to units and non-secret application records. Create `.env.test.example`:

```dotenv
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=
E2E_COORDINATOR_PASSWORD=
E2E_NUTRITIONIST_PASSWORD=
```

Create `scripts/seed-local-users.mjs`:

```js
import { createClient } from "@supabase/supabase-js";

const required = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "E2E_COORDINATOR_PASSWORD",
  "E2E_NUTRITIONIST_PASSWORD",
];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing ${name}`);
}

const admin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const unitId = "10000000-0000-4000-8000-000000000001";
const fixtures = [
  {
    email: "coordinator@example.test",
    password: process.env.E2E_COORDINATOR_PASSWORD,
    fullName: "Coordenação Teste",
    role: "coordinator",
  },
  {
    email: "nutritionist@example.test",
    password: process.env.E2E_NUTRITIONIST_PASSWORD,
    fullName: "Nutricionista Teste",
    role: "nutritionist",
  },
];

for (const fixture of fixtures) {
  const listed = await admin.auth.admin.listUsers();
  if (listed.error) throw listed.error;
  const existing = listed.data.users.find(
    (user) => user.email === fixture.email,
  );
  let user = existing;
  if (!user) {
    const created = await admin.auth.admin.createUser({
        email: fixture.email,
        password: fixture.password,
        email_confirm: true,
    });
    if (created.error) throw created.error;
    user = created.data.user;
  }
  if (!user) throw new Error(`Unable to create ${fixture.email}`);

  const { error } = await admin.from("profiles").upsert({
    id: user.id,
    full_name: fixture.fullName,
    role: fixture.role,
    primary_unit_id: unitId,
    active: true,
  });
  if (error) throw error;
}
```

Add:

```json
{
  "scripts": {
    "seed:test-users": "node --env-file=.env.test.local scripts/seed-local-users.mjs"
  }
}
```

Populate `.env.test.local` from the local values printed by `pnpm exec supabase status -o env`, use non-production passwords, and keep the file ignored. Make labels and button names match the E2E test. Configure Playwright `webServer.command` as `pnpm dev`, `baseURL` as `http://127.0.0.1:3000`, and `reuseExistingServer: !process.env.CI`.

- [ ] **Step 4: Add the local-development runbook**

Document in `README.md`:

```bash
pnpm install
pnpm exec supabase start
cp .env.example .env.local
pnpm exec supabase db reset
pnpm dev
```

Also document:

- how to generate `database.ts`;
- how to run unit, database and E2E tests;
- that real patient data is forbidden in local/test fixtures;
- that service-role credentials are server-only;
- that production access requires institutional privacy approval.

- [ ] **Step 5: Run the complete foundation verification**

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
- global coverage is at least 80%;
- authorization branch coverage is 100%;
- audit has no critical or high production vulnerabilities;
- the E2E test proves grant and revocation.

- [ ] **Step 6: Security review gate**

Review the diff and confirm:

- no secret or `.env.local` is staged;
- no service-role key is imported under `src/app`, `src/components` or browser clients;
- no direct public write policy exists for grants or audit;
- every server action re-verifies actor role;
- errors shown to users contain no SQL, stack or auth provider detail.

Do not proceed to Plan 01 until critical and high findings are fixed.

- [ ] **Step 7: Commit**

```bash
git add saude-nutricional-sesc
git commit -m "test: verify secure access foundation"
```
