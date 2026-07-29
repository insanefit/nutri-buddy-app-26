import { loadActor } from "../../../modules/access/actor";

export default async function InicioPage() {
  const actor = await loadActor();
  const accessibleUnitCount = actor.accessibleUnitIds.length;
  const unitLabel =
    accessibleUnitCount === 1
      ? "1 unidade acessível"
      : `${accessibleUnitCount} unidades acessíveis`;

  return (
    <section
      aria-labelledby="welcome-heading"
      className="border-t-4 border-amber-400 bg-white p-8 shadow-sm"
    >
      <p className="text-base font-semibold uppercase tracking-[0.12em] text-blue-800">
        Visão geral
      </p>
      <h1
        className="mt-3 text-3xl font-bold text-blue-950"
        id="welcome-heading"
      >
        Bem-vinda, {actor.fullName}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700">
        Use a navegação principal para acessar os fluxos clínicos
        disponíveis para o seu perfil.
      </p>
      <div className="mt-8 inline-flex min-h-11 items-center rounded border border-blue-200 bg-blue-50 px-4 py-2 font-semibold text-blue-950">
        {unitLabel}
      </div>
    </section>
  );
}
