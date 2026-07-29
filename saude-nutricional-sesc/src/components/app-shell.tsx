import Link from "next/link";
import type { ReactNode } from "react";
import type { ActorContext } from "../modules/access/types";

const baseLinks = [
  { href: "/inicio", label: "Início" },
  { href: "/pacientes", label: "Pacientes" },
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

      <header className="border-b-4 border-amber-400 bg-blue-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-8 py-5">
          <div>
            <p className="text-lg font-bold leading-tight">
              Saúde Nutricional
            </p>
            <p className="mt-1 text-base text-blue-100">
              Atendimento clínico seguro
            </p>
          </div>

          <div className="text-right">
            <p className="font-semibold">{actor.fullName}</p>
            <p className="mt-1 text-base text-blue-100">
              {primaryUnitName}
            </p>
          </div>
        </div>

        <nav
          aria-label="Navegação principal"
          className="border-t border-blue-800"
        >
          <ul className="mx-auto flex max-w-7xl flex-wrap gap-2 px-8 py-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  className="inline-flex min-h-11 items-center rounded px-4 py-2 font-semibold text-blue-50 outline-none hover:bg-blue-800 focus-visible:ring-4 focus-visible:ring-amber-300"
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
