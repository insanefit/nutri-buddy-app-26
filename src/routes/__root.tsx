import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { SescLogo } from "@/components/SescLogo";
import { Menu, X } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Saúde Nutricional Sesc — Prontuário Clínico & Prescrição" },
      {
        name: "description",
        content:
          "Sistema Institucional de Prontuário Clínico, Avaliação Antropométrica e Prescrição Nutricional — Sesc Amapá.",
      },
      { name: "author", content: "Saúde Nutricional Sesc" },
      { property: "og:site_name", content: "Saúde Nutricional Sesc" },
      { property: "og:title", content: "Saúde Nutricional Sesc" },
      {
        property: "og:description",
        content:
          "Sistema Institucional de Prontuário Clínico, Avaliação Antropométrica e Prescrição Nutricional — Sesc Amapá.",
      },
      {
        property: "og:image",
        content: "https://saude-nutricional-sesc.vercel.app/og-image-sesc.png",
      },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Saúde Nutricional Sesc" },
      {
        name: "twitter:description",
        content:
          "Sistema Institucional de Prontuário Clínico, Avaliação Antropométrica e Prescrição Nutricional — Sesc Amapá.",
      },
      {
        name: "twitter:image",
        content: "https://saude-nutricional-sesc.vercel.app/og-image-sesc.png",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/sesc-logo-v2.png", type: "image/png" },
      { rel: "shortcut icon", href: "/sesc-logo-v2.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/sesc-logo-v2.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.invalidate();
        if (event !== "SIGNED_OUT") {
          queryClient.invalidateQueries();
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-950">
        <Header />
        <main>
          <Outlet />
        </main>
        <Toaster position="bottom-right" richColors />
      </div>
    </QueryClientProvider>
  );
}

function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-[#FFCC00] bg-[#003366] text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-white px-2.5 py-1 rounded shadow-sm flex items-center justify-center">
            <SescLogo className="h-8" />
          </div>
          <div className="border-l border-blue-800/80 pl-3">
            <span className="text-sm sm:text-base font-bold tracking-tight text-white block leading-tight">
              Saúde Nutricional
            </span>
            <span className="text-[9px] sm:text-[10px] text-amber-300 uppercase tracking-widest font-semibold block">
              Prontuário Clínico
            </span>
          </div>
        </Link>

        {/* Menu Desktop */}
        <nav className="hidden md:flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              <Link
                to="/app"
                className="px-3 py-1.5 text-sm font-medium text-blue-100 hover:text-white hover:bg-[#002855] rounded transition-colors"
              >
                Início
              </Link>
              <Link
                to="/app/patients"
                className="px-3 py-1.5 text-sm font-medium text-blue-100 hover:text-white hover:bg-[#002855] rounded transition-colors"
              >
                Pacientes
              </Link>
              <Link
                to="/app/foods"
                className="px-3 py-1.5 text-sm font-medium text-blue-100 hover:text-white hover:bg-[#002855] rounded transition-colors"
              >
                Alimentos
              </Link>
              <Link
                to="/app/orientations"
                className="px-3 py-1.5 text-sm font-medium text-blue-100 hover:text-white hover:bg-[#002855] rounded transition-colors"
              >
                Orientações
              </Link>
              <button
                onClick={async () => {
                  await queryClient.cancelQueries();
                  queryClient.clear();
                  await supabase.auth.signOut();
                }}
                className="ml-2 px-3 py-1.5 text-xs font-semibold bg-amber-400 text-slate-900 hover:bg-amber-300 rounded transition-colors shadow-sm flex items-center gap-1"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              search={{ mode: "signin" }}
              className="inline-flex items-center justify-center rounded bg-[#FFCC00] px-4 py-1.5 text-sm font-bold text-[#003366] transition-colors hover:bg-amber-300 shadow"
            >
              Entrar no Sistema
            </Link>
          )}
        </nav>

        {/* Botão do Menu Hambúrguer Mobile */}
        <div className="flex md:hidden items-center gap-2">
          {user ? (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-[#002855] rounded-md focus:outline-none"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-amber-400" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          ) : (
            <Link
              to="/auth"
              search={{ mode: "signin" }}
              className="inline-flex items-center justify-center rounded bg-[#FFCC00] px-3 py-1 text-xs font-bold text-[#003366]"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>

      {/* Drawer do Menu Mobile */}
      {mobileMenuOpen && user && (
        <div className="md:hidden border-t border-blue-900/80 bg-[#002855] px-4 pt-3 pb-5 space-y-2 shadow-inner">
          <Link
            to="/app"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-white hover:bg-[#003366] rounded"
          >
            <ClipboardList className="h-4 w-4 text-amber-300" />
            Início / Prontuários
          </Link>
          <Link
            to="/app/patients"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-white hover:bg-[#003366] rounded"
          >
            <Users className="h-4 w-4 text-amber-300" />
            Pacientes
          </Link>
          <Link
            to="/app/foods"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-white hover:bg-[#003366] rounded"
          >
            <Utensils className="h-4 w-4 text-amber-300" />
            Tabela de Alimentos
          </Link>
          <Link
            to="/app/orientations"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-white hover:bg-[#003366] rounded"
          >
            <BookOpen className="h-4 w-4 text-amber-300" />
            Orientações MS
          </Link>
          <div className="pt-2 border-t border-blue-800">
            <button
              onClick={async () => {
                setMobileMenuOpen(false);
                await queryClient.cancelQueries();
                queryClient.clear();
                await supabase.auth.signOut();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold bg-amber-400 text-slate-900 rounded"
            >
              <LogOut className="h-4 w-4" />
              Sair da Conta
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
