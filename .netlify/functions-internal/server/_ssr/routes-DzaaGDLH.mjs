import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as SescLogo } from "./SescLogo-DAaqfixY.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as BookOpen, a as UserCheck, n as Utensils } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DzaaGDLH.js
var import_jsx_runtime = require_jsx_runtime();
function HomePage() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "flex flex-col min-h-[calc(100vh-4rem)] bg-slate-50",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
        className:
          "relative overflow-hidden bg-[#003366] text-white px-4 py-20 sm:px-6 lg:px-8 border-b-8 border-[#FFCC00] shadow-md",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className: "mx-auto max-w-4xl text-center space-y-6",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
              className: "flex justify-center mb-4",
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                className: "bg-white p-3 rounded-lg shadow-md inline-block",
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SescLogo, {
                  className: "h-16",
                }),
              }),
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
              className: "text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight",
              children: "Saúde Nutricional",
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
              className: "mx-auto max-w-2xl text-base sm:text-lg text-blue-100 leading-relaxed",
              children:
                "Plataforma clínica centralizada para atendimento nutricional, prontuário imutável, avaliação antropométrica por público e prescrição de planos alimentares.",
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
              className: "pt-4 flex flex-col items-center justify-center gap-4 sm:flex-row",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
                  to: "/auth",
                  search: { mode: "signin" },
                  className:
                    "inline-flex items-center justify-center rounded-md bg-[#FFCC00] px-8 py-3 text-base font-bold text-[#003366] transition-colors hover:bg-amber-300 shadow-lg",
                  children: "Acessar o Prontuário Clínico",
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
                  to: "/app/orientations",
                  className:
                    "inline-flex items-center justify-center rounded-md border border-blue-400 bg-[#002855] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-900",
                  children: "Ver Orientações do Ministério da Saúde",
                }),
              ],
            }),
          ],
        }),
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
        className: "mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
            className: "text-center mb-12",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
              className: "text-2xl font-bold text-[#003366]",
              children: "Módulos Clínicos",
            }),
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            className: "grid gap-8 sm:grid-cols-3",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureCard, {
                icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, {
                  className: "h-6 w-6 text-[#003366]",
                }),
                title: "Prontuário Centrado no Paciente",
                description:
                  "Histórico imutável de consultas, anamnese por faixa etária (crianças, adultos, idosos, gestantes) e acompanhamento de medidas.",
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureCard, {
                icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Utensils, {
                  className: "h-6 w-6 text-[#003366]",
                }),
                title: "Tabela Nutricional & Alimentos",
                description:
                  "Composição de calorias e macronutrientes (proteínas, carbs, gorduras) com alimentos da dieta brasileira e customizados.",
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureCard, {
                icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
                  className: "h-6 w-6 text-[#003366]",
                }),
                title: "Diretrizes do Ministério da Saúde",
                description:
                  "Modelos reutilizáveis de orientação sobre alimentação consciente, planejamento e hábitos alimentares.",
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function FeatureCard({ icon, title, description }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className:
      "rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md border-t-4 border-t-[#003366]",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
        className: "flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50",
        children: icon,
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
        className: "mt-4 text-base font-bold text-[#003366]",
        children: title,
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
        className: "mt-2 text-xs leading-relaxed text-slate-600",
        children: description,
      }),
    ],
  });
}
//#endregion
export { HomePage as component };
