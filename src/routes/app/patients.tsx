import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getPatients, createPatient } from "@/lib/nutrition.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/app/patients")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["patients"],
      queryFn: () => getPatients({ data: undefined }),
    });
  },
  head: () => ({
    meta: [
      { title: "Pacientes — NutriAvalia" },
      { name: "description", content: "Gerencie seus pacientes no NutriAvalia." },
    ],
  }),
  component: PatientsPage,
});

function PatientsPage() {
  const { data: patients, refetch } = useSuspenseQuery({
    queryKey: ["patients"],
    queryFn: () => getPatients({ data: undefined }),
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPatient({ data: { patient_email: email, full_name: name } });
      toast.success("Paciente cadastrado com sucesso");
      setName("");
      setEmail("");
      setOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar paciente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Pacientes</h1>
          <p className="mt-1 text-muted-foreground">Gerencie seus pacientes e acompanhe seus diários</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Novo paciente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar paciente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Maria Silva"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maria@email.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {patients?.map((patient) => (
          <Card key={patient.id} className="transition-shadow hover:shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                {patient.patient?.full_name || "Paciente"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                <Link to="/app/patients/$id" params={{ id: patient.id }}>
                  Ver diário
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!patients || patients.length === 0) && (
        <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">Nenhum paciente cadastrado.</p>
          <p className="mt-2 text-sm text-muted-foreground">Clique em "Novo paciente" para começar.</p>
        </div>
      )}
    </div>
  );
}
