import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPatients } from "@/lib/nutrition.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Utensils, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Painel Clínico — Saúde Nutricional Sesc" },
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#003366]">Painel Clínico Sesc</h1>
          <p className="mt-1 text-sm text-slate-600">
            Gestão de prontuários e atendimento das unidades
          </p>
        </div>
        <Button asChild className="bg-[#003366] hover:bg-[#002244] text-white">
          <Link to="/app/patients">Ver prontuários</Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard
          to="/app/patients"
          icon={<Users className="h-5 w-5 text-[#003366]" />}
          label="Pacientes Cadastrados"
          value={patients?.length ?? 0}
          subtitle="Ver todos os prontuários →"
        />
        <StatCard
          to="/app/patients"
          icon={<Utensils className="h-5 w-5 text-[#003366]" />}
          label="Prontuários & Planos"
          value={patients?.length ? `${patients.length} ativos` : "0"}
          subtitle="Acessar prescrições →"
        />
        <StatCard
          to="/app/foods"
          icon={<TrendingUp className="h-5 w-5 text-[#003366]" />}
          label="Tabela Alimentos TACO"
          value="597 itens"
          subtitle="Consultar tabela →"
        />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Pacientes recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {patients && patients.length > 0 ? (
            <ul className="divide-y divide-border">
              {patients.slice(0, 5).map((patient) => (
                <li key={patient.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {(patient.patient as any)?.full_name || "Paciente"}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/app/patients/$id" params={{ id: patient.id }}>
                      Abrir
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum paciente cadastrado ainda.{" "}
              <Link to="/app/patients" className="text-primary hover:underline">
                Cadastre seu primeiro paciente
              </Link>
            </p>
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
            <p className="text-xl font-bold text-[#003366]">{value}</p>
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
