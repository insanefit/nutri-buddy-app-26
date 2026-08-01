import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPatients, getFoods } from "@/lib/nutrition.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Utensils,
  FileText,
  Plus,
  ArrowRight,
  ShieldCheck,
  Database,
  Calendar,
} from "lucide-react";

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
    foods && foods.length > 0 ? `${foods.length} cadastrados` : "597 itens TACO";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Banner Institucional Sesc Executive Header */}
      <div className="bg-gradient-to-r from-[#003366] to-[#002244] text-white p-6 sm:p-8 rounded-2xl shadow-md border-b-4 border-[#FFCC00] relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded bg-[#FFCC00] text-[#003366]">
              Sesc Amapá
            </span>
            <span className="text-[10px] font-semibold text-blue-100 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[#FFCC00]" />
              Sistema Eletrônico de Atendimento Nutricional
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Painel Clínico de Saúde Nutricional
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Acompanhamento centralizado de consultas, antropometria, exames laboratoriais e
            prescrições alimentares.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Link
            to="/app/patients"
            className="bg-[#FFCC00] hover:bg-amber-300 text-[#003366] font-extrabold text-xs px-5 py-3 rounded-xl shadow transition-all flex items-center justify-center gap-2"
          >
            <Users className="h-4 w-4" />
            Acessar Prontuários Sesc
          </Link>
        </div>
      </div>

      {/* Grid de Métricas Clínicas com Tamanho 100% Igual */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3 items-stretch">
        <StatCard
          to="/app/patients"
          icon={<Users className="h-6 w-6 text-[#003366]" />}
          label="Pacientes Cadastrados"
          value={patients?.length ?? 0}
          subtitle="Ver todos os prontuários →"
        />
        <StatCard
          to="/app/patients"
          icon={<Utensils className="h-6 w-6 text-[#003366]" />}
          label="Prontuários & Prescrições"
          value={patients?.length ? `${patients.length} ativos` : "0 prontuários"}
          subtitle="Acessar histórico de consultas →"
        />
        <StatCard
          to="/app/foods"
          icon={<Database className="h-6 w-6 text-[#003366]" />}
          label="Tabela de Alimentos TACO"
          value={foodCountLabel}
          subtitle="Consultar tabela nutricional →"
        />
      </div>

      {/* Tabela de Prontuários Recentes com Botão Harmonioso */}
      <Card className="border border-slate-200/90 shadow-xs bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/80 border-b border-slate-100 flex flex-row items-center justify-between p-5">
          <div>
            <CardTitle className="text-base font-extrabold text-[#003366]">
              Prontuários Clínicos Recentes
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Últimos pacientes atendidos na unidade Sesc
            </p>
          </div>
          <Link
            to="/app/patients"
            className="text-xs text-[#003366] bg-blue-50 hover:bg-[#003366] hover:text-white font-bold px-3.5 py-1.5 rounded-lg transition-all"
          >
            Ver Todos os Pacientes ({patients?.length || 0})
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {patients && patients.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {patients.slice(0, 6).map((patientItem) => {
                const patientName =
                  (patientItem.patient as { full_name?: string } | null)?.full_name ||
                  (patientItem as { profile?: { full_name?: string } })?.profile?.full_name ||
                  (patientItem.notes && patientItem.notes.includes("|")
                    ? patientItem.notes.split("|")[0].replace("Paciente", "").trim()
                    : null) ||
                  "Paciente Sesc";

                return (
                  <div
                    key={patientItem.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50/80 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-[#003366] font-extrabold flex items-center justify-center text-sm shrink-0 border border-blue-200 shadow-2xs">
                        {patientName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[#003366]">{patientName}</p>
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Prontuário Ativo
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>
                            Meta:{" "}
                            <strong className="text-slate-700">
                              {patientItem.daily_calorie_goal || 2000} kcal/dia
                            </strong>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {new Date(patientItem.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/app/patients/$id"
                      params={{ id: patientItem.id }}
                      className="bg-blue-50 text-[#003366] hover:bg-[#003366] hover:text-white font-bold text-xs px-4 py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-2xs shrink-0"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Abrir Prontuário
                    </Link>
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
    <Link to={to} className="group block h-full flex flex-col">
      <Card className="h-full border border-slate-200/90 group-hover:border-[#003366] group-hover:shadow-md transition-all cursor-pointer bg-white rounded-2xl flex flex-col justify-between overflow-hidden">
        <CardContent className="flex items-center gap-4 p-6 h-full">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-colors shrink-0">
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="text-xl font-extrabold text-[#003366] mt-0.5">{value}</p>
            {subtitle && (
              <p className="text-[11px] font-bold text-[#003366]/70 group-hover:text-[#003366] transition-colors mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
