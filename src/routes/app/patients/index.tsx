import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getPatients, createPatient, deletePatient } from "@/lib/nutrition.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, User, FileText, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/patients/")({
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
      { title: "Prontuários de Pacientes — Saúde Nutricional Sesc" },
      {
        name: "description",
        content: "Gerencie prontuários e atendimentos clínicos dos pacientes Sesc.",
      },
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
  const [calorieGoal, setCalorieGoal] = useState("2000");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPatient({
        data: {
          patient_email: email,
          full_name: name,
          daily_calorie_goal: Number(calorieGoal) || 2000,
        },
      });
      toast.success("Paciente cadastrado no prontuário Sesc!");
      setName("");
      setEmail("");
      setCalorieGoal("2000");
      setOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar paciente");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (patientId: string, patientName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o prontuário de ${patientName}?`)) return;
    try {
      await deletePatient({ data: patientId });
      toast.success("Prontuário do paciente excluído");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir paciente");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Cabeçalho da Seção de Pacientes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003366]">Prontuários dos Pacientes</h1>
          <p className="mt-1 text-xs text-slate-600">
            Cadastre, acompanhe avaliações antropométricas, IMC e prescrições alimentares Sesc
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#003366] hover:bg-[#002244] text-white font-semibold">
              <Plus className="h-4 w-4 mr-1.5" />
              Novo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-[#003366]">
                Cadastrar Novo Paciente Sesc
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Maria das Dores Silva"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  E-mail de Contato / Cadastro
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="paciente@exemplo.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="calorieGoal" className="text-xs font-semibold text-slate-700">
                  Meta Calórica Diária (kcal)
                </Label>
                <Input
                  id="calorieGoal"
                  type="number"
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(e.target.value)}
                  placeholder="2000"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold"
                disabled={loading}
              >
                {loading ? "Salvando..." : "Salvar Prontuário"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid de Cards dos Pacientes */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {patients?.map((patientItem) => {
          const patientName =
            (patientItem.patient as any)?.full_name ||
            (patientItem.profile as any)?.full_name ||
            (patientItem.notes && patientItem.notes.includes("|")
              ? patientItem.notes.split("|")[0].replace("Paciente", "").trim()
              : null) ||
            "Paciente Sesc";
          return (
            <Card
              key={patientItem.id}
              className="border border-slate-200 hover:border-[#003366] transition-all shadow-sm flex flex-col justify-between"
            >
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="h-9 w-9 rounded-full bg-blue-50 text-[#003366] font-bold flex items-center justify-center text-sm shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-bold text-[#003366] truncate">
                    {patientName}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                  title="Excluir paciente"
                  onClick={() => handleDeletePatient(patientItem.id, patientName)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <span className="font-semibold text-slate-700">Meta:</span>{" "}
                    {patientItem.daily_calorie_goal || 2000} kcal/dia
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Cadastrado em: {new Date(patientItem.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Link
                  to="/app/patients/$id"
                  params={{ id: patientItem.id }}
                  className="w-full border border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white transition-colors rounded-md py-2 px-3 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm block text-center"
                >
                  <FileText className="h-3.5 w-3.5 inline" />
                  Abrir Prontuário Clínico
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(!patients || patients.length === 0) && (
        <div className="mt-12 rounded-lg border-2 border-dashed border-slate-300 p-12 text-center bg-white space-y-3">
          <User className="h-10 w-10 text-slate-300 mx-auto" />
          <p className="text-sm text-slate-600 font-medium">
            Nenhum paciente cadastrado no momento.
          </p>
          <p className="text-xs text-slate-400">
            Clique no botão <strong>"Novo Paciente"</strong> acima para criar a primeira ficha
            clínica.
          </p>
        </div>
      )}
    </div>
  );
}
