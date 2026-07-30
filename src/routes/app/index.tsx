import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getPatients } from "@/lib/nutrition.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Utensils, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/app/")({
  loader: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData({
        queryKey: ["patients"],
        queryFn: () => getPatients({ data: undefined }),
      });
    } catch (err) {}
  },
  head: () => ({
    meta: [
      { title: "Painel Clínico — Saúde Nutricional Sesc" },
      { name: "description", content: "Visão geral do atendimento clínico nutricional Sesc." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: patients } = useSuspenseQuery({
    queryKey: ["patients"],
    queryFn: () => getPatients({ data: undefined }),
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
          icon={<Users className="h-5 w-5 text-primary" />}
          label="Pacientes"
          value={patients?.length ?? 0}
        />
        <StatCard
          icon={<Utensils className="h-5 w-5 text-primary" />}
          label="Refeições hoje"
          value="—"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          label="Média calórica"
          value="—"
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
