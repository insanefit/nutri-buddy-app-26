import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPatients, getFoods } from "@/lib/nutrition.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Utensils, FileText, Plus, ArrowRight, ShieldCheck, Database } from "lucide-react";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Painel Clínico Sesc — Saúde Nutricional" },
      { name: "description", content: "Visão geral do atendimento clínico nutricional Sesc." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      try {
        return await getPatients({ data: undefined });
      } catch (err) {
        return [];
      }
    },
    initialData: [],
  });

  const { data: foods } = useQuery({
    queryKey: ["foods"],
    queryFn: async () => {
      try {
        return await getFoods({ data: undefined });
      } catch (err) {
        return [];
      }
    },
    initialData: [],
  });

  const foodCountLabel =
    foods && foods.length > 0 ? `${foods.length} alimentos` : "597 alimentos TACO";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Banner Institucional Sesc */}
      <div className="bg-[#003366] text-white p-6 sm:p-8 rounded-2xl shadow-md border-b-4 border-[#FFCC00] relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded bg-amber-400 text-slate-900">
              Unidade Amapá
            </span>
            <span className="text-[10px] font-semibold text-blue-200 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
              Prontuário Eletrônico Institucional
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Saúde Nutricional Sesc
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Painel integrado para gestão de prontuários, avaliações antropométricas, prescrição
            alimentar e acompanhamento laboratorial.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Button
            asChild
            className="bg-[#FFCC00] hover:bg-amber-300 text-[#003366] font-extrabold text-xs shadow"
          >
            <Link to="/app/patients">
              <Users className="h-4 w-4 mr-1.5" />
              Gerenciar Prontuários
            </Link>
          </Button>
        </div>
      </div>

      {/* Cards de Métricas Clínicas Clicáveis */}
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard
          to="/app/patients"
          icon={<Users className="h-6 w-6 text-[#003366]" />}
          label="Pacientes Cadastrados"
          value={patients?.length ?? 0}
          subtitle="Ver prontuários dos pacientes →"
        />
        <StatCard
          to="/app/patients"
          icon={<Utensils className="h-6 w-6 text-[#003366]" />}
          label="Prontuários & Prescrições"
          value={patients?.length ? `${patients.length} prontuários` : "0 prontuários"}
          subtitle="Acessar histórico clínico →"
        />
        <StatCard
          to="/app/foods"
          icon={<Database className="h-6 w-6 text-[#003366]" />}
          label="Tabela de Alimentos TACO"
          value={foodCountLabel}
          subtitle="Consultar tabela nutricional →"
        />
      </div>

      {/* Tabela de Prontuários Recentes */}
      <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-[#003366]">
              Prontuários Clínicos Recentes
            </CardTitle>
            <p className="text-xs text-slate-500">Últimos pacientes atendidos na unidade Sesc</p>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs text-[#003366] border-slate-300 font-bold"
          >
            <Link to="/app/patients">Ver Todos ({patients?.length || 0})</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {patients && patients.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {patients.slice(0, 6).map((patientItem) => {
                const patientName =
                  (patientItem.patient as any)?.full_name ||
                  (patientItem.profile as any)?.full_name ||
                  (patientItem.notes && patientItem.notes.includes("|")
                    ? patientItem.notes.split("|")[0].replace("Paciente", "").trim()
                    : null) ||
                  "Paciente Sesc";

                return (
                  <div
                    key={patientItem.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-50 text-[#003366] font-bold flex items-center justify-center text-sm shrink-0">
                        {patientName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#003366]">{patientName}</p>
                        <p className="text-xs text-slate-500">
                          Meta: {patientItem.daily_calorie_goal || 2000} kcal/dia | Cadastrado em:{" "}
                          {new Date(patientItem.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="text-xs text-[#003366] border-[#003366] hover:bg-[#003366] hover:text-white font-bold gap-1"
                    >
                      <Link to="/app/patients/$id" params={{ id: patientItem.id }}>
                        <FileText className="h-3.5 w-3.5" />
                        Abrir Prontuário
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center space-y-2">
              <Users className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-600">
                Nenhum paciente cadastrado no momento.
              </p>
              <Link
                to="/app/patients"
                className="text-xs text-[#003366] font-bold underline inline-block"
              >
                Cadastrar primeiro paciente Sesc
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  to: string;
}) {
  return (
    <Link to={to} className="block group">
      <Card className="border border-slate-200 group-hover:border-[#003366] group-hover:shadow-md transition-all cursor-pointer bg-white">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-colors shrink-0">
            {icon}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="text-xl font-extrabold text-[#003366] mt-0.5">{value}</p>
            {subtitle && (
              <p className="text-[11px] font-medium text-slate-400 group-hover:text-[#003366] transition-colors mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
