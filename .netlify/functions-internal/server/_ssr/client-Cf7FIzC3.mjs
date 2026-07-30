import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-Cf7FIzC3.js
var supabase = createClient(
  "https://xthwqmspmvyoobcxersw.supabase.co",
  "sb_publishable_7_2tYOUINfcMnxE6q0-WCg_ffyrqDif",
  {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : void 0,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
//#endregion
export { supabase as t };
