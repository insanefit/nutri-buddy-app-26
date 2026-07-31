import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Saúde Nutricional Sesc — Prontuário Clínico" },
      { name: "description", content: "Sistema de atendimento clínico nutricional Sesc." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = "/app";
    }
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#003366] border-t-transparent" />
        <p className="text-xs font-semibold text-[#003366]">Carregando Saúde Nutricional Sesc...</p>
      </div>
    </div>
  );
}
