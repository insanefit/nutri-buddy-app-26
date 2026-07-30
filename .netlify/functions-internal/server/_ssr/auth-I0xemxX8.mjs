import {
  f as lazyRouteComponent,
  p as createFileRoute,
} from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-I0xemxX8.js
var $$splitComponentImporter = () => import("./auth-DhB-LfdD.mjs");
var Route = createFileRoute("/auth")({
  validateSearch: (search) => ({ mode: search.mode || "signin" }),
  head: () => ({
    meta: [
      { title: "Entrar — Saúde Nutricional Sesc" },
      {
        name: "description",
        content:
          "Acesso individual e seguro ao prontuário clínico e sistema de Saúde Nutricional Sesc.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component"),
});
//#endregion
export { Route as t };
