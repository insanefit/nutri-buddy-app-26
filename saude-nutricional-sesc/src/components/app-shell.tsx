import Link from "next/link";
import type { ReactNode } from "react";
import type { ActorContext } from "../modules/access/types";

const baseLinks = [
  { href: "/inicio", label: "Início" },
  { href: "/pacientes", label: "Pacientes" },
  { href: "/alimentos", label: "Alimentos" },
  { href: "/agenda", label: "Agenda" },
  { href: "/relatorios", label: "Relatórios" },
] as const;

type AppShellProps = Readonly<{
  actor: ActorContext;
  primaryUnitName: string;
  children: ReactNode;
}>;

export function AppShell({
  actor,
  primaryUnitName,
  children,
}: AppShellProps) {
  const links =
    actor.role === "coordinator"
      ? [
          ...baseLinks,
          { href: "/settings/access", label: "Configurações" },
        ]
      : [...baseLinks];

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-950">
      <a
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded bg-white px-4 py-3 font-semibold text-blue-950 shadow focus:translate-y-0 focus:outline-none focus:ring-4 focus:ring-amber-300"
        href="#main-content"
      >
        Ir para o conteúdo
      </a>

      {/* Header Institucional Saúde Nutricional Sesc */}
      <header className="border-b-4 border-[#FFCC00] bg-[#003366] text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-[#FFCC00] font-black text-[#003366] text-xl shadow">
              S
            </div>
            <div>
              <p className="text-xl font-bold leading-tight tracking-tight text-white">
                Saúde Nutricional
              </p>
              <p className="text-xs text-blue-200 uppercase tracking-widest font-semibold">
                Piloto Sesc — Prontuário Clínico
              </p>
            </div>
          </div>

          <div className="text-right border-l border-blue-800/80 pl-6">
            <p className="font-semibold text-sm text-white">{actor.fullName}</p>
            <p className="mt-0.5 text-xs text-amber-300 font-medium flex items-center justify-end gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400 inline-block"></span>
              {primaryUnitName}
            </p>
          </div>
        </div>

        {/* Barra de Navegação */}
        <nav
          aria-label="Navegação principal"
          className="border-t border-blue-900/60 bg-[#002855]"
        >
          <ul className="mx-auto flex max-w-7xl flex-wrap gap-1 px-8 py-1.5">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  className="inline-flex min-h-10 items-center rounded px-3.5 py-1.5 text-sm font-medium text-blue-100 outline-none hover:bg-[#003366] hover:text-white focus-visible:ring-2 focus-visible:ring-[#FFCC00] transition-colors"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main
        className="mx-auto w-full max-w-7xl px-8 py-8"
        id="main-content"
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  );
}
