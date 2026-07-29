import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, UserCheck, Utensils, BookOpen } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Saúde Nutricional Sesc — Piloto de Atendimento Clínico" },
      {
        name: "description",
        content:
          "Sistema de atendimento clínico nutricional, prontuário centralizado, tabela de alimentos e orientações oficiais do Ministério da Saúde para o Sesc.",
      },
      { property: "og:title", content: "Saúde Nutricional Sesc" },
      {
        property: "og:description",
        content:
          "Prontuário clínico centralizado, avaliação antropométrica e prescrição alimentar para o Sesc.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* Hero Section Institucional Sesc */}
      <section className="relative overflow-hidden bg-[#003366] text-white px-4 py-20 sm:px-6 lg:px-8 border-b-8 border-[#FFCC00] shadow-md">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight">
            Saúde Nutricional Sesc
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-blue-100 leading-relaxed">
            Plataforma clínica centralizada para atendimento nutricional, prontuário imutável,
            avaliação antropométrica por público e prescrição de planos alimentares.
          </p>

          <div className="pt-4 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/auth"
              search={{ mode: "signin" }}
              className="inline-flex items-center justify-center rounded-md bg-[#FFCC00] px-8 py-3 text-base font-bold text-[#003366] transition-colors hover:bg-amber-300 shadow-lg"
            >
              Acessar o Prontuário Clínico
            </Link>
            <Link
              to="/app/orientations"
              className="inline-flex items-center justify-center rounded-md border border-blue-400 bg-[#002855] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
            >
              Ver Orientações do Ministério da Saúde
            </Link>
          </div>
        </div>
      </section>

      {/* Seção de Funcionalidades do Piloto Sesc */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-[#003366]">Módulos Clínicos do Piloto</h2>
          <p className="text-sm text-slate-600 mt-1">
            Conforme especificado no plano de diretrizes e governança Sesc
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <FeatureCard
            icon={<UserCheck className="h-6 w-6 text-[#003366]" />}
            title="Prontuário Centrado no Paciente"
            description="Histórico imutável de consultas, anamnese por faixa etária (crianças, adultos, idosos, gestantes) e acompanhamento de medidas."
          />
          <FeatureCard
            icon={<Utensils className="h-6 w-6 text-[#003366]" />}
            title="Tabela Nutricional & Alimentos"
            description="Composição de calorias e macronutrientes (proteínas, carbs, gorduras) com alimentos da dieta brasileira e customizados."
          />
          <FeatureCard
            icon={<BookOpen className="h-6 w-6 text-[#003366]" />}
            title="Diretrizes do Ministério da Saúde"
            description="Modelos reutilizáveis de orientação sobre alimentação consciente, planejamento e hábitos alimentares."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md border-t-4 border-t-[#003366]">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">{icon}</div>
      <h3 className="mt-4 text-base font-bold text-[#003366]">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}
