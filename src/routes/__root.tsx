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
import { Menu, X, ClipboardList, Users, Utensils, BookOpen, LogOut } from "lucide-react";

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

function ErrorComponent({ error }: { error: Error }) {
  console.error(error);
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
    if (typeof window !== "undefined") {
      const key = "sesc_auto_recover";
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "true");
        window.location.href = "/app";
      }
    }
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-xl border border-slate-200 shadow-md space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#003366]">
          <SescLogo className="h-8" />
        </div>
        <h1 className="text-lg font-bold text-[#003366]">Saúde Nutricional Sesc</h1>
        <p className="text-xs text-slate-600 leading-relaxed">Abrindo painel de atendimento...</p>
        <div className="pt-2 flex justify-center">
          <a
            href="/app"
            onClick={() => {
              if (typeof window !== "undefined") {
                sessionStorage.clear();
                window.location.href = "/app";
              }
            }}
            className="inline-flex items-center justify-center rounded-md bg-[#003366] px-6 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#002244] shadow"
          >
            Acessar Prontuário Sesc
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white text-slate-900 shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <SescLogo className="h-10 sm:h-12" />
          <div className="border-l border-slate-200 pl-3">
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-[#003366] block leading-tight">
              Saúde Nutricional
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">
              Prontuário Clínico
            </span>
          </div>
        </Link>

        {/* Menu Desktop */}
        <nav className="hidden md:flex items-center gap-2 sm:gap-4">
          <Link
            to="/app"
            className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-[#003366] hover:bg-slate-100 rounded-md transition-colors"
          >
            Início
          </Link>
          <Link
            to="/app/patients"
            className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-[#003366] hover:bg-slate-100 rounded-md transition-colors"
          >
            Pacientes
          </Link>
          <Link
            to="/app/foods"
            className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-[#003366] hover:bg-slate-100 rounded-md transition-colors"
          >
            Alimentos
          </Link>
          <button
            onClick={async () => {
              await queryClient.cancelQueries();
              queryClient.clear();
              await supabase.auth.signOut();
              window.location.href = "/auth?mode=signin";
            }}
            className="ml-2 px-4 py-2 text-xs font-bold bg-[#003366] text-white hover:bg-[#002244] rounded-md transition-colors shadow-sm flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </nav>

        {/* Botão do Menu Hambúrguer Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#003366] hover:bg-slate-100 rounded-md focus:outline-none flex items-center gap-1.5 bg-white border border-slate-200 shadow-sm"
            aria-label="Abrir menu mobile Sesc"
          >
            <span className="text-xs font-bold text-[#003366]">Menu</span>
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-[#003366]" />
            ) : (
              <Menu className="h-5 w-5 text-[#003366]" />
            )}
          </button>
        </div>
      </div>

      {/* Drawer do Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <Link
            to="/app"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold text-[#003366] hover:bg-blue-50 rounded-md"
          >
            <ClipboardList className="h-4 w-4 text-[#003366]" />
            Painel Clínico Sesc
          </Link>
          <Link
            to="/app/patients"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold text-[#003366] hover:bg-blue-50 rounded-md"
          >
            <Users className="h-4 w-4 text-[#003366]" />
            Prontuários dos Pacientes
          </Link>
          <Link
            to="/app/foods"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold text-[#003366] hover:bg-blue-50 rounded-md"
          >
            <Utensils className="h-4 w-4 text-[#003366]" />
            Tabela de Alimentos TACO
          </Link>
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={async () => {
                setMobileMenuOpen(false);
                await queryClient.cancelQueries();
                queryClient.clear();
                await supabase.auth.signOut();
                window.location.href = "/auth?mode=signin";
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold bg-[#003366] text-white hover:bg-[#002244] rounded-md shadow"
            >
              <LogOut className="h-4 w-4" />
              Alternar / Sair da Conta
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
