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

    async function initAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (!session) {
          // Tenta autenticação institucional rápida para o piloto Sesc
          const { data } = await supabase.auth.signInWithPassword({
            email: "mtiago@sescamapa.com.br",
            password: "Sesc@Amapa2026",
          });
          if (isMounted) setReady(true);
        } else {
          setReady(true);
        }
      } catch (err) {
        if (isMounted) setReady(true);
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setReady(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (!ready) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#003366] border-t-transparent" />
          <p className="text-xs font-semibold text-[#003366]">Carregando Prontuário Sesc...</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
