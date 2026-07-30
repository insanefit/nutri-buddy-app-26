import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as getPatients } from "./nutrition.functions-BRebx5zk.mjs";
import {
  a as CardHeader,
  n as Card,
  o as CardTitle,
  r as CardContent,
  t as Button,
} from "./card-DEk-bcO6.mjs";
import { n as Utensils, o as TrendingUp, r as Users } from "../_libs/lucide-react.mjs";
import { t as useSuspenseQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-LojFnXtE.js
var import_jsx_runtime = require_jsx_runtime();
function DashboardPage() {
  const { data: patients } = useSuspenseQuery({
    queryKey: ["patients"],
    queryFn: () => getPatients({ data: void 0 }),
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className: "mb-8 flex items-center justify-between border-b border-slate-200 pb-4",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
                className: "text-2xl font-bold tracking-tight text-[#003366]",
                children: "Painel Clínico Sesc",
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                className: "mt-1 text-sm text-slate-600",
                children: "Gestão de prontuários e atendimento das unidades",
              }),
            ],
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
            asChild: true,
            className: "bg-[#003366] hover:bg-[#002244] text-white",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
              to: "/app/patients",
              children: "Ver prontuários",
            }),
          }),
        ],
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className: "grid gap-6 sm:grid-cols-3",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
            icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
              className: "h-5 w-5 text-primary",
            }),
            label: "Pacientes",
            value: patients?.length ?? 0,
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
            icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Utensils, {
              className: "h-5 w-5 text-primary",
            }),
            label: "Refeições hoje",
            value: "—",
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
            icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, {
              className: "h-5 w-5 text-primary",
            }),
            label: "Média calórica",
            value: "—",
          }),
        ],
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
        className: "mt-8",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
              className: "text-lg",
              children: "Pacientes recentes",
            }),
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
            children:
              patients && patients.length > 0
                ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
                    className: "divide-y divide-border",
                    children: patients.slice(0, 5).map((patient) =>
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                        "li",
                        {
                          className: "flex items-center justify-between py-3",
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                                className: "font-medium text-foreground",
                                children: patient.patient?.full_name || "Paciente",
                              }),
                            }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                              variant: "ghost",
                              size: "sm",
                              asChild: true,
                              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
                                to: "/app/patients/$id",
                                params: { id: patient.id },
                                children: "Abrir",
                              }),
                            }),
                          ],
                        },
                        patient.id,
                      ),
                    ),
                  })
                : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                    className: "text-sm text-muted-foreground",
                    children: [
                      "Nenhum paciente cadastrado ainda.",
                      " ",
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
                        to: "/app/patients",
                        className: "text-primary hover:underline",
                        children: "Cadastre seu primeiro paciente",
                      }),
                    ],
                  }),
          }),
        ],
      }),
    ],
  });
}
function StatCard({ icon, label, value }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
      className: "flex items-center gap-4 p-6",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
          className: "flex h-10 w-10 items-center justify-center rounded-full bg-primary/10",
          children: icon,
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
              className: "text-sm text-muted-foreground",
              children: label,
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
              className: "text-2xl font-semibold text-foreground",
              children: value,
            }),
          ],
        }),
      ],
    }),
  });
}
//#endregion
export { DashboardPage as component };
