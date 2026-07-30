import { r as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as SescLogo } from "./SescLogo-DAaqfixY.mjs";
import {
  c as HeadContent,
  d as Outlet,
  f as lazyRouteComponent,
  h as Link,
  m as createRootRouteWithContext,
  p as createFileRoute,
  s as Scripts,
  u as createRouter,
  v as useRouter,
} from "../_libs/@tanstack/react-router+[...].mjs";
import {
  c as getMealsForPatient,
  l as getPatient,
  s as getFoods,
  u as getPatients,
} from "./nutrition.functions-BRebx5zk.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { n as QueryClientProvider, r as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { n as format } from "../_libs/date-fns.mjs";
import { t as supabase } from "./client-Cf7FIzC3.mjs";
import { t as Route$8 } from "./auth-I0xemxX8.mjs";
import { n as Route$9 } from "./orientations-B784w6GD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-B0nDTAN9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Toaster$1 = ({ ...props }) => {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
    className: "toaster group",
    toastOptions: {
      classNames: {
        toast:
          "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        description: "group-[.toast]:text-muted-foreground",
        actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
        cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
      },
    },
    ...props,
  });
};
var styles_default = "/assets/styles-CsUnhNg7.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    },
  );
  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);
  window.__lovableReportRuntimeError?.({
    message,
    stack: error instanceof Error ? error.stack : void 0,
    filename: window.location.pathname,
  });
}
function NotFoundComponent() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
    className: "flex min-h-screen items-center justify-center bg-background px-4",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
      className: "max-w-md text-center",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
          className: "text-7xl font-bold text-foreground",
          children: "404",
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
          className: "mt-4 text-xl font-semibold text-foreground",
          children: "Page not found",
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
          className: "mt-2 text-sm text-muted-foreground",
          children: "The page you're looking for doesn't exist or has been moved.",
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
          className: "mt-6",
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
            to: "/",
            className:
              "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
            children: "Go home",
          }),
        }),
      ],
    }),
  });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router = useRouter();
  (0, import_react.useEffect)(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
    className: "flex min-h-screen items-center justify-center bg-background px-4",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
      className: "max-w-md text-center",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
          className: "text-xl font-semibold tracking-tight text-foreground",
          children: "This page didn't load",
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
          className: "mt-2 text-sm text-muted-foreground",
          children: "Something went wrong on our end. You can try refreshing or head back home.",
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className: "mt-6 flex flex-wrap justify-center gap-2",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
              onClick: () => {
                router.invalidate();
                reset();
              },
              className:
                "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
              children: "Try again",
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
              href: "/",
              className:
                "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
              children: "Go home",
            }),
          ],
        }),
      ],
    }),
  });
}
var Route$7 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "Saúde Nutricional Sesc" },
      {
        name: "description",
        content:
          "Piloto Saúde Nutricional Sesc — Atendimento clínico, prontuário e acompanhamento nutricional.",
      },
      {
        name: "author",
        content: "Saúde Nutricional Sesc",
      },
      {
        property: "og:title",
        content: "Saúde Nutricional Sesc",
      },
      {
        property: "og:description",
        content: "Atendimento clínico e acompanhamento nutricional.",
      },
      {
        property: "og:type",
        content: "website",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: styles_default,
      },
      {
        rel: "icon",
        href: "/favicon.ico",
        type: "image/x-icon",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
function RootShell({ children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
    lang: "pt-BR",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", {
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}),
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
        children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})],
      }),
    ],
  });
}
function RootComponent() {
  const { queryClient } = Route$7.useRouteContext();
  const router = useRouter();
  (0, import_react.useEffect)(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, router]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
    client: queryClient,
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
      className: "min-h-screen bg-slate-50 font-sans antialiased text-slate-950",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}),
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
          position: "bottom-right",
          richColors: true,
        }),
      ],
    }),
  });
}
function Header() {
  const [user, setUser] = (0, import_react.useState)(null);
  const queryClient = useQueryClient();
  (0, import_react.useEffect)(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
    className:
      "sticky top-0 z-50 w-full border-b-4 border-[#FFCC00] bg-[#003366] text-white shadow-md",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
      className: "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
          to: "/",
          className: "flex items-center gap-3",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
              className: "bg-white px-2.5 py-1 rounded shadow-sm flex items-center justify-center",
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SescLogo, { className: "h-8" }),
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
              className: "border-l border-blue-800/80 pl-3",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                  className: "text-base font-bold tracking-tight text-white block leading-tight",
                  children: "Saúde Nutricional",
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                  className:
                    "text-[10px] text-amber-300 uppercase tracking-widest font-semibold block",
                  children: "Prontuário Clínico",
                }),
              ],
            }),
          ],
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
          className: "flex items-center gap-2 sm:gap-4",
          children: user
            ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
                    to: "/app",
                    className:
                      "px-3 py-1.5 text-sm font-medium text-blue-100 hover:text-white hover:bg-[#002855] rounded transition-colors",
                    children: "Início",
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
                    to: "/app/patients",
                    className:
                      "px-3 py-1.5 text-sm font-medium text-blue-100 hover:text-white hover:bg-[#002855] rounded transition-colors",
                    children: "Pacientes",
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
                    to: "/app/foods",
                    className:
                      "px-3 py-1.5 text-sm font-medium text-blue-100 hover:text-white hover:bg-[#002855] rounded transition-colors",
                    children: "Alimentos",
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
                    to: "/app/orientations",
                    className:
                      "px-3 py-1.5 text-sm font-medium text-blue-100 hover:text-white hover:bg-[#002855] rounded transition-colors",
                    children: "Orientações",
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
                    onClick: async () => {
                      await queryClient.cancelQueries();
                      queryClient.clear();
                      await supabase.auth.signOut();
                    },
                    className:
                      "ml-2 px-3 py-1.5 text-xs font-semibold bg-amber-400 text-slate-900 hover:bg-amber-300 rounded transition-colors shadow-sm",
                    children: "Sair",
                  }),
                ],
              })
            : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
                to: "/auth",
                search: { mode: "signin" },
                className:
                  "inline-flex items-center justify-center rounded bg-[#FFCC00] px-4 py-1.5 text-sm font-bold text-[#003366] transition-colors hover:bg-amber-300 shadow",
                children: "Entrar no Sistema",
              }),
        }),
      ],
    }),
  });
}
var $$splitComponentImporter$6 = () => import("./routes-DzaaGDLH.mjs");
var Route$6 = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Saúde Nutricional Sesc — Piloto de Atendimento Clínico" },
      {
        name: "description",
        content:
          "Sistema de atendimento clínico nutricional, prontuário centralizado, tabela de alimentos e orientações oficiais do Ministério da Saúde para o Sesc.",
      },
      {
        property: "og:title",
        content: "Saúde Nutricional Sesc",
      },
      {
        property: "og:description",
        content:
          "Prontuário clínico centralizado, avaliação antropométrica e prescrição alimentar para o Sesc.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component"),
});
var $$splitComponentImporter$5 = () => import("./app-JUx13Wfl.mjs");
var Route$5 = createFileRoute("/app")({
  ssr: false,
  component: lazyRouteComponent($$splitComponentImporter$5, "component"),
});
var $$splitComponentImporter$4 = () => import("./app-LojFnXtE.mjs");
var Route$4 = createFileRoute("/app/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["patients"],
      queryFn: () => getPatients({ data: void 0 }),
    });
  },
  head: () => ({
    meta: [
      { title: "Painel Clínico — Saúde Nutricional Sesc" },
      {
        name: "description",
        content: "Visão geral do atendimento clínico nutricional Sesc.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component"),
});
var $$splitComponentImporter$3 = () => import("./foods-C208j7aL.mjs");
var Route$3 = createFileRoute("/app/foods")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["foods"],
      queryFn: () => getFoods({ data: void 0 }),
    });
  },
  head: () => ({
    meta: [
      { title: "Alimentos — NutriAvalia" },
      {
        name: "description",
        content: "Banco de alimentos do NutriAvalia.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component"),
});
var $$splitComponentImporter$2 = () => import("./patients-CTQYx3oL.mjs");
var Route$2 = createFileRoute("/app/patients")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component"),
});
var $$splitComponentImporter$1 = () => import("./patients-bVba195G.mjs");
var Route$1 = createFileRoute("/app/patients/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["patients"],
      queryFn: () => getPatients({ data: void 0 }),
    });
  },
  head: () => ({
    meta: [
      { title: "Prontuários de Pacientes — Saúde Nutricional Sesc" },
      {
        name: "description",
        content: "Gerencie prontuários e atendimentos clínicos dos pacientes Sesc.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component"),
});
var $$splitComponentImporter = () => import("../_id-D_u_Qpi4.mjs");
var Route = createFileRoute("/app/patients/$id")({
  loader: async ({ context, params }) => {
    const id = params.id;
    const today = format(/* @__PURE__ */ new Date(), "yyyy-MM-dd");
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["patient", id],
        queryFn: () => getPatient({ data: id }),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["meals", id, today],
        queryFn: () =>
          getMealsForPatient({
            data: {
              patient_id: id,
              date: today,
            },
          }),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["foods"],
        queryFn: () => getFoods({ data: void 0 }),
      }),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Prontuário do Paciente — Saúde Nutricional Sesc" },
      {
        name: "description",
        content: "Prontuário clínico, IMC e prescrição nutricional.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component"),
});
var IndexRoute = Route$6.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$7,
});
var AppRoute = Route$5.update({
  id: "/app",
  path: "/app",
  getParentRoute: () => Route$7,
});
var AuthRoute = Route$8.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$7,
});
var AppIndexRoute = Route$4.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppRoute,
});
var AppFoodsRoute = Route$3.update({
  id: "/foods",
  path: "/foods",
  getParentRoute: () => AppRoute,
});
var AppOrientationsRoute = Route$9.update({
  id: "/orientations",
  path: "/orientations",
  getParentRoute: () => AppRoute,
});
var AppPatientsRoute = Route$2.update({
  id: "/patients",
  path: "/patients",
  getParentRoute: () => AppRoute,
});
var AppPatientsIndexRoute = Route$1.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppPatientsRoute,
});
var AppPatientsRouteChildren = {
  AppPatientsIdRoute: Route.update({
    id: "/$id",
    path: "/$id",
    getParentRoute: () => AppPatientsRoute,
  }),
  AppPatientsIndexRoute,
};
var AppRouteChildren = {
  AppFoodsRoute,
  AppOrientationsRoute,
  AppPatientsRoute: AppPatientsRoute._addFileChildren(AppPatientsRouteChildren),
  AppIndexRoute,
};
var rootRouteChildren = {
  IndexRoute,
  AppRoute: AppRoute._addFileChildren(AppRouteChildren),
  AuthRoute,
};
var routeTree = Route$7._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
  return createRouter({
    routeTree,
    context: { queryClient: new QueryClient() },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });
};
//#endregion
export { getRouter };
