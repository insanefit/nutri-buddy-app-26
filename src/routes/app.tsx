import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  useEffect(() => {
    async function initAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          await supabase.auth.signInWithPassword({
            email: "mtiago@sescamapa.com.br",
            password: "Sesc@Amapa2026",
          });
        }
      } catch (err) {}
    }

    initAuth();
  }, []);

  return <Outlet />;
}
