import { r as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { d as Outlet, g as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as supabase } from "./client-Cf7FIzC3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-JUx13Wfl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AppLayout() {
  const [ready, setReady] = (0, import_react.useState)(false);
  const navigate = useNavigate();
  (0, import_react.useEffect)(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (!session)
        navigate({
          to: "/auth",
          search: { mode: "signin" },
        });
      else setReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (!session)
        navigate({
          to: "/auth",
          search: { mode: "signin" },
        });
      else setReady(true);
    });
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);
  if (!ready)
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
      className: "flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50",
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className: "flex flex-col items-center gap-3",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
            className:
              "h-8 w-8 animate-spin rounded-full border-3 border-[#003366] border-t-transparent",
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
            className: "text-xs font-semibold text-[#003366]",
            children: "Carregando Prontuário Sesc...",
          }),
        ],
      }),
    });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
}
//#endregion
export { AppLayout as component };
