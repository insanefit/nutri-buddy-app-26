import { createFileRoute, Link } from "@tanstack/react-router";
import { UserCheck, Utensils, BookOpen, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Saúde Nutricional Sesc — Atendimento Clínico" },
      {
        name: "description",
        content:
          "Plataforma de atendimento clínico nutricional, prontuários, tabela de alimentos TACO e prescrição para o Sesc.",
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
            Plataforma clínica centralizada para atendimento nutricional, prontuário individual,
            avaliação antropométrica, exames e prescrição de planos alimentares.
          </p>

          <div className="pt-4 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/app"
              className="inline-flex items-center justify-center rounded-md bg-[#FFCC00] px-8 py-3.5 text-base font-extrabold text-[#003366] transition-all hover:bg-amber-300 shadow-lg gap-2"
            >
              Acessar o Painel Clínico Sesc
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/app/patients"
              className="inline-flex items-center justify-center rounded-md border border-blue-400 bg-[#002855] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
            >
              Ver Prontuários dos Pacientes
            </Link>
          </div>
        </div>
      </section>

      {/* Seção de Funcionalidades do Sesc */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-extrabold text-[#003366]">Módulos de Atendimento Clínico</h2>
          <p className="text-xs text-slate-500 mt-1">
            Recursos integrados para acompanhamento dos beneficiários Sesc
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <FeatureCard
            icon={<UserCheck className="h-6 w-6 text-[#003366]" />}
            title="Prontuário & Anamnese"
            description="Histórico clínico completo, anamnese nutricional, acompanhamento de evolução física e medidas corporais."
          />
          <FeatureCard
            icon={<Utensils className="h-6 w-6 text-[#003366]" />}
            title="Tabela de Alimentos TACO"
            description="Consulta de calorias e macronutrientes (proteínas, carboidratos e gorduras) com prescrição de refeições."
          />
          <FeatureCard
            icon={<BookOpen className="h-6 w-6 text-[#003366]" />}
            title="Receitas & Exames"
            description="Prescrição de guias alimentares, receitas personalizadas e acompanhamento de exames laboratoriais."
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
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-[#003366] transition-all">
      <div>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
          {icon}
        </div>
        <h3 className="text-base font-bold text-[#003366]">{title}</h3>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
