import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (!session) {
          // Redireciona para a página de login
          if (typeof window !== "undefined") {
            window.location.href = "/auth?mode=signin";
          }
        } else {
          setReady(true);
        }
      } catch (err) {
        if (isMounted) setReady(true);
      }
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (!ready) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#003366] border-t-transparent" />
          <p className="text-xs font-semibold text-[#003366]">Carregando Login Sesc...</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
