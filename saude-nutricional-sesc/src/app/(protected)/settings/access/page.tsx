import { redirect } from "next/navigation";
import {
  grantAccess,
  revokeAccess,
  type AccessActionState,
} from "../../../../modules/access/actions";
import { loadActor } from "../../../../modules/access/actor";
import { requireCoordinator } from "../../../../modules/access/authorization";
import {
  listAccessAdministrationOptions,
  listAccessGrants,
  type AccessGrantStatus,
} from "../../../../modules/access/repository";

type SettingsAccessPageProps = Readonly<{
  searchParams: Promise<
    Readonly<{
      feedback?: string | string[];
    }>
  >;
}>;

const feedbackMessages = Object.freeze({
  "grant-success": {
    kind: "success",
    message: "Acesso autorizado.",
  },
  "grant-validation": {
    kind: "error",
    message: "Revise os campos da nova autorização.",
  },
  "grant-error": {
    kind: "error",
    message: "Não foi possível alterar o acesso. Tente novamente.",
  },
  "revoke-success": {
    kind: "success",
    message: "Acesso revogado.",
  },
  "revoke-validation": {
    kind: "error",
    message: "Informe um motivo de revogação válido.",
  },
  "revoke-error": {
    kind: "error",
    message: "Não foi possível alterar o acesso. Tente novamente.",
  },
} as const);

type FeedbackKey = keyof typeof feedbackMessages;

const grantStatusLabels: Readonly<
  Record<AccessGrantStatus, string>
> = Object.freeze({
  active: "Ativo",
  expired: "Expirado",
  revoked: "Revogado",
});

function feedbackKey(
  operation: "grant" | "revoke",
  result: AccessActionState,
): FeedbackKey {
  if (result.status === "success") {
    return `${operation}-success`;
  }
  if (result.status === "validation_error") {
    return `${operation}-validation`;
  }
  return `${operation}-error`;
}

async function submitGrantAccess(formData: FormData) {
  "use server";

  const result = await grantAccess(formData);
  redirect(
    `/settings/access?feedback=${feedbackKey("grant", result)}`,
  );
}

async function submitRevokeAccess(formData: FormData) {
  "use server";

  const result = await revokeAccess(formData);
  redirect(
    `/settings/access?feedback=${feedbackKey("revoke", result)}`,
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function resolveFeedback(value: string | string[] | undefined) {
  if (typeof value !== "string" || !(value in feedbackMessages)) {
    return null;
  }

  return feedbackMessages[value as FeedbackKey];
}

export default async function SettingsAccessPage({
  searchParams,
}: SettingsAccessPageProps) {
  const actor = await loadActor();
  requireCoordinator(actor);

  const [grants, options, resolvedSearchParams] = await Promise.all([
    listAccessGrants(),
    listAccessAdministrationOptions(),
    searchParams,
  ]);
  const feedback = resolveFeedback(resolvedSearchParams.feedback);
  const formUnavailable =
    options.profiles.length === 0 || options.units.length === 0;
  const minimumValidity = new Date(Date.now() + 60_000)
    .toISOString()
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-base font-semibold uppercase tracking-[0.12em] text-blue-800">
          Configurações
        </p>
        <h1 className="mt-2 text-3xl font-bold text-blue-950">
          Administração de acessos
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-700">
          Autorize, acompanhe e revogue acessos temporários entre
          unidades. Toda alteração fica registrada na auditoria.
        </p>
      </header>

      {feedback ? (
        <p
          className={
            feedback.kind === "success"
              ? "rounded border border-green-300 bg-green-50 px-4 py-3 font-semibold text-green-900"
              : "rounded border border-red-300 bg-red-50 px-4 py-3 font-semibold text-red-900"
          }
          role={feedback.kind === "success" ? "status" : "alert"}
        >
          {feedback.message}
        </p>
      ) : null}

      <section
        aria-labelledby="grant-heading"
        className="border-t-4 border-amber-400 bg-white p-6 shadow-sm"
      >
        <h2
          className="text-2xl font-bold text-blue-950"
          id="grant-heading"
        >
          Nova autorização
        </h2>
        <p className="mt-2 text-base text-slate-700">
          Todos os campos são obrigatórios. A unidade deve ser diferente
          da unidade principal do profissional.
        </p>

        {formUnavailable ? (
          <p className="mt-5 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950">
            Não há profissionais ou unidades ativos disponíveis para uma
            nova autorização.
          </p>
        ) : null}

        <form
          action={submitGrantAccess}
          className="mt-6 grid gap-6 lg:grid-cols-2"
        >
          <div>
            <label
              className="block text-base font-semibold text-slate-900"
              htmlFor="profileId"
            >
              Profissional
            </label>
            <select
              className="mt-2 min-h-11 w-full rounded border border-slate-400 bg-white px-3 py-2 text-base outline-none focus-visible:border-blue-800 focus-visible:ring-4 focus-visible:ring-blue-200"
              disabled={formUnavailable}
              id="profileId"
              name="profileId"
              required
            >
              <option value="">Selecione um profissional</option>
              {options.profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-base font-semibold text-slate-900"
              htmlFor="unitId"
            >
              Unidade
            </label>
            <select
              aria-describedby="unit-helper"
              className="mt-2 min-h-11 w-full rounded border border-slate-400 bg-white px-3 py-2 text-base outline-none focus-visible:border-blue-800 focus-visible:ring-4 focus-visible:ring-blue-200"
              disabled={formUnavailable}
              id="unitId"
              name="unitId"
              required
            >
              <option value="">Selecione uma unidade</option>
              {options.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-base text-slate-600" id="unit-helper">
              Escolha somente uma unidade fora do vínculo principal.
            </p>
          </div>

          <div>
            <label
              className="block text-base font-semibold text-slate-900"
              htmlFor="reason"
            >
              Motivo
            </label>
            <textarea
              aria-describedby="reason-helper"
              className="mt-2 min-h-28 w-full rounded border border-slate-400 px-3 py-3 text-base outline-none focus-visible:border-blue-800 focus-visible:ring-4 focus-visible:ring-blue-200"
              disabled={formUnavailable}
              id="reason"
              maxLength={500}
              minLength={5}
              name="reason"
              required
            />
            <p
              className="mt-2 text-base text-slate-600"
              id="reason-helper"
            >
              Informe entre 5 e 500 caracteres.
            </p>
          </div>

          <div>
            <label
              className="block text-base font-semibold text-slate-900"
              htmlFor="validUntil"
            >
              Válido até
            </label>
            <input
              aria-describedby="validity-helper"
              className="mt-2 min-h-11 w-full rounded border border-slate-400 px-3 py-2 text-base outline-none focus-visible:border-blue-800 focus-visible:ring-4 focus-visible:ring-blue-200"
              disabled={formUnavailable}
              id="validUntil"
              min={minimumValidity}
              name="validUntil"
              required
              type="date"
            />
            <p
              className="mt-2 text-base text-slate-600"
              id="validity-helper"
            >
              A validade é conferida novamente no servidor.
            </p>
          </div>

          <div className="lg:col-span-2">
            <button
              className="inline-flex min-h-11 items-center justify-center rounded bg-blue-900 px-5 py-3 font-semibold text-white outline-none hover:bg-blue-800 focus-visible:ring-4 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={formUnavailable}
              type="submit"
            >
              Autorizar acesso
            </button>
          </div>
        </form>
      </section>

      <section aria-labelledby="history-heading">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2
              className="text-2xl font-bold text-blue-950"
              id="history-heading"
            >
              Histórico de autorizações
            </h2>
            <p className="mt-2 text-base text-slate-700">
              A lista inclui autorizações ativas, expiradas e revogadas.
            </p>
          </div>
          <p className="text-base font-semibold text-slate-700">
            {grants.length} registros
          </p>
        </div>

        {grants.length === 0 ? (
          <div className="mt-5 border border-slate-300 bg-white p-6 shadow-sm">
            <p className="font-semibold text-slate-900">
              Nenhuma autorização registrada.
            </p>
            <p className="mt-2 text-base text-slate-700">
              Use o formulário acima quando um profissional precisar
              atuar temporariamente em outra unidade.
            </p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto border border-slate-300 bg-white shadow-sm">
            <table className="w-full min-w-[960px] border-collapse text-left text-base">
              <caption className="sr-only">
                Autorizações entre unidades
              </caption>
              <thead className="bg-blue-950 text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    Estado
                  </th>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    Profissional e unidade
                  </th>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    Motivo e concedente
                  </th>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    Validade
                  </th>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {grants.map((grant) => (
                  <tr className="align-top" key={grant.id}>
                    <td className="px-4 py-4">
                      <span className="inline-flex min-h-8 items-center rounded border border-slate-300 bg-slate-100 px-3 py-1 font-semibold text-slate-900">
                        {grantStatusLabels[grant.status]}
                      </span>
                      {grant.revokedAt ? (
                        <p className="mt-2 text-slate-600">
                          {formatDateTime(grant.revokedAt)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-950">
                        {grant.profileName}
                      </p>
                      <p className="mt-1 text-slate-700">
                        {grant.unitName}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="max-w-sm text-slate-950">
                        {grant.reason}
                      </p>
                      <p className="mt-2 text-slate-600">
                        Concedido por {grant.grantorName}
                      </p>
                      {grant.revocationReason ? (
                        <p className="mt-2 text-red-800">
                          Revogação: {grant.revocationReason}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 tabular-nums text-slate-800">
                      <p>De {formatDateTime(grant.validFrom)}</p>
                      <p className="mt-1">
                        Até {formatDateTime(grant.validUntil)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      {grant.status === "active" ? (
                        <form
                          action={submitRevokeAccess}
                          className="min-w-64"
                        >
                          <input
                            name="grantId"
                            type="hidden"
                            value={grant.id}
                          />
                          <label
                            className="block font-semibold text-slate-900"
                            htmlFor={`revoke-reason-${grant.id}`}
                          >
                            Motivo da revogação
                          </label>
                          <textarea
                            className="mt-2 min-h-24 w-full rounded border border-slate-400 px-3 py-2 outline-none focus-visible:border-blue-800 focus-visible:ring-4 focus-visible:ring-blue-200"
                            id={`revoke-reason-${grant.id}`}
                            maxLength={500}
                            minLength={5}
                            name="reason"
                            required
                          />
                          <button
                            className="mt-3 inline-flex min-h-11 items-center justify-center rounded border-2 border-red-700 px-4 py-2 font-semibold text-red-800 outline-none hover:bg-red-50 focus-visible:ring-4 focus-visible:ring-red-200"
                            type="submit"
                          >
                            Revogar
                          </button>
                        </form>
                      ) : (
                        <span className="text-slate-600">
                          Sem ação disponível
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
