import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as CLINICAL_ORIENTATIONS } from "./orientations-B784w6GD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orientations-BbkSYKLV.js
var import_jsx_runtime = require_jsx_runtime();
function OrientationsPage() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className: "rounded-lg bg-[#003366] p-6 text-white shadow-md border-l-8 border-[#FFCC00]",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
            className: "text-xs uppercase tracking-widest font-bold text-amber-300",
            children: "Diretrizes Oficiais — Ministério da Saúde",
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
            className: "text-2xl sm:text-3xl font-bold mt-1",
            children: "Orientações para Alimentação Saudável e Atenta",
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
            className: "text-sm text-blue-100 mt-2 max-w-3xl leading-relaxed",
            children:
              "Guia prático de hábitos alimentares e planejamento de rotina para nutricionistas prescreverem e anexarem aos prontuários dos pacientes do Sesc.",
          }),
        ],
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        children: CLINICAL_ORIENTATIONS.map((item) =>
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "div",
            {
              className:
                "bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                  className:
                    "absolute top-0 right-0 bg-[#003366] text-[#FFCC00] font-black text-xs px-3 py-1 rounded-bl-lg",
                  children: ["#", item.number],
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
                      className: "text-base font-bold text-[#003366] mb-2 pr-8",
                      children: item.title,
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                      className: "text-xs text-slate-600 leading-relaxed",
                      children: item.description,
                    }),
                  ],
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                  className:
                    "mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium",
                  children: "Saúde Nutricional Sesc",
                }),
              ],
            },
            item.number,
          ),
        ),
      }),
    ],
  });
}
//#endregion
export { OrientationsPage as component };
