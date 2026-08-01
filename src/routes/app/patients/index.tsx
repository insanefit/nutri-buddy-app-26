import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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

import { Search } from "lucide-react";

function PatientsPage() {
  const { data: patients, refetch } = useQuery({
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

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<"comerciario" | "dependente" | "publico_geral">(
    "comerciario",
  );
  const [calorieGoal, setCalorieGoal] = useState("2000");
  const [loading, setLoading] = useState(false);

  const filteredPatients = patients?.filter((patientItem) => {
    const pName =
      (patientItem.patient as any)?.full_name ||
      (patientItem.profile as any)?.full_name ||
      patientItem.notes ||
      "";
    return pName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Cálculo de Métricas do Público Alvo Sesc
  const totalCount = patients?.length || 0;
  const comerciariosCount =
    patients?.filter((p) => (p.notes || "").toLowerCase().includes("comerciário")).length || 0;
  const dependentesCount =
    patients?.filter((p) => (p.notes || "").toLowerCase().includes("dependente")).length || 0;
  const publicoGeralCount = Math.max(0, totalCount - comerciariosCount - dependentesCount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      toast.error("Preencha o Nome Completo, E-mail e Telefone do paciente.");
      return;
    }
    setLoading(true);
    try {
      await createPatient({
        data: {
          patient_email: email,
          full_name: name,
          phone: phone,
          category: category,
          daily_calorie_goal: Number(calorieGoal) || 2000,
        },
      });
      toast.success("Paciente cadastrado no prontuário Sesc!");
      setName("");
      setEmail("");
      setPhone("");
      setCategory("comerciario");
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Cabeçalho da Seção de Pacientes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#003366]">Prontuários dos Pacientes</h1>
          <p className="mt-1 text-xs text-slate-600">
            Cadastre, acompanhe o público-alvo Sesc (Comerciários, Dependentes e Comunidade) e
            prescrições alimentares
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#003366] hover:bg-[#002244] text-white font-bold gap-1.5 shadow-sm rounded-xl">
              <Plus className="h-4 w-4" />
              Novo Paciente Sesc
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-[#003366]">
                Cadastrar Novo Paciente (Público-Alvo Sesc)
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold text-slate-700">
                  Nome Completo <span className="text-rose-600">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Maria das Dores Silva"
                  required
                  className="bg-white border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                    E-mail de Contato <span className="text-rose-600">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="paciente@exemplo.com"
                    required
                    className="bg-white border-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold text-slate-700">
                    Telefone / Celular <span className="text-rose-600">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(96) 99123-4567"
                    required
                    className="bg-white border-slate-200"
                  />
                </div>
              </div>

              {/* Seleção de Categoria Sesc (Público-Alvo) */}
              <div className="space-y-2 pt-1">
                <Label className="text-xs font-bold text-slate-700 block">
                  Categoria do Paciente (Público-Alvo Sesc) <span className="text-rose-600">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory("comerciario")}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      category === "comerciario"
                        ? "border-[#003366] bg-blue-50 text-[#003366] ring-2 ring-[#003366]"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>🏢 Comerciário</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      Trabalhador Comércio
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory("dependente")}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      category === "dependente"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>👨‍👩‍👧 Dependente</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      Família do Comerciário
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory("publico_geral")}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      category === "publico_geral"
                        ? "border-slate-600 bg-slate-100 text-slate-900 ring-2 ring-slate-600"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>🌐 Público Geral</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      Comunidade em Geral
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="calorieGoal" className="text-xs font-bold text-slate-700">
                  Meta Calórica Diária (kcal)
                </Label>
                <Input
                  id="calorieGoal"
                  type="number"
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(e.target.value)}
                  placeholder="2000"
                  required
                  className="bg-white border-slate-200"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 rounded-xl shadow-xs"
                disabled={loading}
              >
                {loading ? "Salvando..." : "Salvar Prontuário no Sesc"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo Institucional do Público Alvo Sesc */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
            Total Cadastrados
          </span>
          <span className="text-lg font-black text-[#003366]">{totalCount} Pacientes</span>
        </div>
        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
          <span className="text-[10px] font-extrabold text-[#003366] uppercase tracking-wider block">
            🏢 Comerciários
          </span>
          <span className="text-lg font-black text-[#003366]">{comerciariosCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
          <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
            👨‍👩‍👧 Dependentes
          </span>
          <span className="text-lg font-black text-emerald-800">{dependentesCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-100/70 border border-slate-200">
          <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">
            🌐 Público Geral
          </span>
          <span className="text-lg font-black text-slate-800">{publicoGeralCount}</span>
        </div>
      </div>

      {/* Barra de Pesquisa de Pacientes */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar prontuário por nome do paciente ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 text-xs bg-white border-slate-200 shadow-xs focus:ring-1 focus:ring-[#003366]"
        />
      </div>

      {/* Grid de Cards dos Pacientes em Tamanho 100% Igual */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
        {filteredPatients?.map((patientItem) => {
          const patientName =
            (patientItem.patient as any)?.full_name ||
            (patientItem.profile as any)?.full_name ||
            (patientItem.notes && patientItem.notes.includes("|")
              ? patientItem.notes.split("|")[0].replace("Paciente", "").trim()
              : null) ||
            "Paciente Sesc";

          const notesText = patientItem.notes || "";
          const isComerciario =
            notesText.toLowerCase().includes("comerciário") ||
            (!notesText.toLowerCase().includes("dependente") &&
              !notesText.toLowerCase().includes("público geral"));
          const isDependente = notesText.toLowerCase().includes("dependente");

          const categoryBadge = isDependente
            ? { text: "Dependente", color: "bg-emerald-100 text-emerald-900 border-emerald-200" }
            : isComerciario
              ? { text: "Comerciário", color: "bg-blue-100 text-[#003366] border-blue-200" }
              : { text: "Público Geral", color: "bg-slate-100 text-slate-800 border-slate-200" };

          return (
            <Card
              key={patientItem.id}
              className="h-full border border-slate-200/90 hover:border-[#003366] transition-all shadow-xs hover:shadow-md bg-white rounded-2xl flex flex-col justify-between overflow-hidden group"
            >
              <CardHeader className="pb-3 border-b border-slate-100/80 bg-slate-50/50 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-blue-100/80 text-[#003366] font-extrabold flex items-center justify-center text-xs shrink-0 border border-blue-200">
                    {patientName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-bold text-[#003366] truncate">
                      {patientName}
                    </CardTitle>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded border inline-block mt-0.5 ${categoryBadge.color}`}
                    >
                      {categoryBadge.text}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0"
                  title="Excluir paciente"
                  onClick={() => handleDeletePatient(patientItem.id, patientName)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 flex flex-col justify-between flex-1">
                <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="flex justify-between items-center">
                    <span className="font-semibold text-slate-500">Meta Calórica:</span>
                    <strong className="font-bold text-[#003366]">
                      {patientItem.daily_calorie_goal || 2000} kcal/dia
                    </strong>
                  </p>
                  <p className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Data de Cadastro:</span>
                    <span className="font-medium text-slate-600">
                      {new Date(patientItem.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </p>
                </div>

                <Link
                  to="/app/patients/$id"
                  params={{ id: patientItem.id }}
                  className="w-full bg-blue-50 text-[#003366] hover:bg-[#003366] hover:text-white font-bold text-xs rounded-xl py-2.5 px-3.5 transition-all duration-200 flex items-center justify-center gap-2 shadow-2xs group-hover:bg-[#003366] group-hover:text-white"
                >
                  <FileText className="h-4 w-4" />
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
            Clique no botão <strong>"Novo Paciente Sesc"</strong> acima para criar a primeira ficha
            clínica.
          </p>
        </div>
      )}
    </div>
  );
}
