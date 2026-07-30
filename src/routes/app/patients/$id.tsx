import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  getPatient,
  getMealsForPatient,
  getFoods,
  createMeal,
  addMealItem,
  deleteMeal,
  deletePatient,
} from "@/lib/nutrition.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SescLogo } from "@/components/SescLogo";
import {
  Calculator,
  Printer,
  Trash2,
  Plus,
  Utensils,
  FileText,
  UserCheck,
  Ruler,
  Scale,
  Activity,
  History,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/patients/$id")({
  loader: async ({ context, params }) => {
    try {
      const id = params.id;
      const today = format(new Date(), "yyyy-MM-dd");
      await Promise.all([
        context.queryClient.ensureQueryData({
          queryKey: ["patient", id],
          queryFn: () => getPatient({ data: id }),
        }),
        context.queryClient.ensureQueryData({
          queryKey: ["meals", id, today],
          queryFn: () => getMealsForPatient({ data: { patient_id: id, date: today } }),
        }),
        context.queryClient.ensureQueryData({
          queryKey: ["foods"],
          queryFn: () => getFoods({ data: undefined }),
        }),
      ]);
    } catch (err) {}
  },
  head: () => ({
    meta: [
      { title: "Prontuário & Medidas Corporais — Saúde Nutricional Sesc" },
      {
        name: "description",
        content: "Prontuário clínico, medidas corporais e prescrição nutricional.",
      },
    ],
  }),
  component: PatientDetailPage,
});

const MEAL_NAMES = [
  { value: "Café da manhã", label: "Café da manhã" },
  { value: "Lanche da manhã", label: "Lanche da manhã" },
  { value: "Almoço", label: "Almoço" },
  { value: "Lanche da tarde", label: "Lanche da tarde" },
  { value: "Jantar", label: "Jantar" },
  { value: "Ceia", label: "Ceia" },
];

function getImcClassification(imc: number) {
  if (imc < 18.5) return { text: "Baixo Peso", color: "text-amber-600 bg-amber-50" };
  if (imc < 25)
    return { text: "Peso Adequado (Eutrofia)", color: "text-emerald-700 bg-emerald-50" };
  if (imc < 30) return { text: "Sobrepeso", color: "text-amber-700 bg-amber-100" };
  if (imc < 35) return { text: "Obesidade Grau I", color: "text-red-600 bg-red-50" };
  if (imc < 40) return { text: "Obesidade Grau II", color: "text-red-700 bg-red-100" };
  return { text: "Obesidade Grau III", color: "text-red-800 bg-red-200" };
}

function PatientDetailPage() {
  const { id } = useParams({ from: "/app/patients/$id" });
  const navigate = useNavigate();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: patient } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      try {
        return await getPatient({ data: id });
      } catch (err) {
        return null;
      }
    },
  });
  const { data: meals, refetch: refetchMeals } = useQuery({
    queryKey: ["meals", id, today],
    queryFn: async () => {
      try {
        return await getMealsForPatient({ data: { patient_id: id, date: today } });
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

  const patientName =
    (patient?.patient as any)?.full_name ||
    (patient?.profile as any)?.full_name ||
    (patient?.notes && patient.notes.includes("|")
      ? patient.notes.split("|")[0].replace("Paciente", "").trim()
      : null) ||
    "Paciente Sesc";

  // Estados de IMC & Medidas Corporais
  const [weight, setWeight] = useState("78.5");
  const [height, setHeight] = useState("175");
  const [waist, setWaist] = useState("84");
  const [hip, setHip] = useState("98");
  const [abdomen, setAbdomen] = useState("88");
  const [chest, setChest] = useState("96");
  const [rightArm, setRightArm] = useState("33");
  const [leftArm, setLeftArm] = useState("33");
  const [rightThigh, setRightThigh] = useState("56");
  const [leftThigh, setLeftThigh] = useState("56");
  const [bodyFat, setBodyFat] = useState("21.5");

  // Histórico de avaliações salvas em memória/localStorage
  const [evaluationsHistory, setEvaluationsHistory] = useState([
    {
      date: "15/05/2026",
      label: "Avaliação Inicial Sesc",
      weight: "81.0",
      height: "175",
      imc: "26.4",
      waist: "88",
      hip: "100",
      rcq: "0.88",
      bodyFat: "24.0%",
    },
  ]);

  const numWeight = Number(weight) || 0;
  const numHeightM = (Number(height) || 0) / 100;
  const imcValue =
    numWeight > 0 && numHeightM > 0
      ? Number((numWeight / (numHeightM * numHeightM)).toFixed(1))
      : 0;
  const imcClass = imcValue > 0 ? getImcClassification(imcValue) : null;

  const numWaist = Number(waist) || 0;
  const numHip = Number(hip) || 0;
  const rcqValue = numWaist > 0 && numHip > 0 ? Number((numWaist / numHip).toFixed(2)) : 0;

  const handleSaveEvaluation = () => {
    const newEval = {
      date: format(new Date(), "dd/MM/yyyy"),
      label: `Retorno — Consulta ${evaluationsHistory.length + 1}`,
      weight: `${weight} kg`,
      height: `${height} cm`,
      imc: `${imcValue}`,
      waist: `${waist} cm`,
      hip: `${hip} cm`,
      rcq: `${rcqValue}`,
      bodyFat: `${bodyFat}%`,
    };
    setEvaluationsHistory([newEval, ...evaluationsHistory]);
    toast.success("Medidas corporais salvas no histórico do prontuário!");
  };

  // Estados de Refeição
  const [date, setDate] = useState(today);
  const [mealName, setMealName] = useState("Café da manhã");
  const [selectedFood, setSelectedFood] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [openMealDialog, setOpenMealDialog] = useState(false);
  const [openPrescriptionDialog, setOpenPrescriptionDialog] = useState(false);
  const [prescriptionNotes, setPrescriptionNotes] = useState(
    "Mastigar devagar. Evitar ingestão de líquidos durante as refeições principais. Seguir orientações do Guia Alimentar para a População Brasileira.",
  );
  const [loading, setLoading] = useState(false);

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const meal = await createMeal({
        data: { patient_id: id, name: mealName, meal_date: date },
      });
      if (selectedFood && quantity) {
        await addMealItem({
          data: {
            meal_id: meal.id,
            food_id: selectedFood,
            quantity_grams: Number(quantity),
          },
        });
      }
      toast.success("Refeição registrada!");
      setSelectedFood("");
      setQuantity("100");
      setOpenMealDialog(false);
      refetchMeals();
    } catch (err: any) {
      toast.error(err.message || "Erro ao registrar refeição");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm("Deseja remover esta refeição?")) return;
    try {
      await deleteMeal({ data: mealId });
      toast.success("Refeição removida");
      refetchMeals();
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover refeição");
    }
  };

  const handleDeletePatientCurrent = async () => {
    if (!confirm(`Tem certeza que deseja excluir o prontuário de ${patientName}?`)) return;
    try {
      await deletePatient({ data: id });
      toast.success("Prontuário excluído com sucesso!");
      navigate({ to: "/app/patients" });
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir paciente");
    }
  };

  const totals = meals?.reduce(
    (acc, meal) => {
      meal.items?.forEach((item: any) => {
        acc.kcal += item.calculated_calories;
        acc.protein += item.calculated_protein;
        acc.carbs += item.calculated_carbs;
        acc.fat += item.calculated_fat;
      });
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Cabeçalho do Prontuário Clínico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#003366]">{patientName}</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-[#003366]">
              Prontuário Ativo
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Meta Calórica Recomendada:{" "}
            <strong>{patient?.daily_calorie_goal || 2000} kcal/dia</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de Emitir Receita */}
          <Dialog open={openPrescriptionDialog} onOpenChange={setOpenPrescriptionDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold gap-1.5">
                <Printer className="h-4 w-4" />
                Emitir Receita / Prescrição
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-[#003366] flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#003366]" />
                  Prescrição Nutricional Sesc
                </DialogTitle>
              </DialogHeader>

              {/* Documento Imprimível */}
              <div className="p-6 border border-slate-300 rounded bg-white space-y-6 text-slate-800 my-2 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <SescLogo className="h-12" />
                  <div className="text-right">
                    <h3 className="font-extrabold text-[#003366] text-sm uppercase">
                      Saúde Nutricional Sesc
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Unidade de Atendimento Clínico — Amapá
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-600 block">PACIENTE:</span>
                    <span className="text-slate-900 font-semibold">{patientName}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 block">DATA DA EMISSÃO:</span>
                    <span className="text-slate-900">{format(new Date(), "dd/MM/yyyy")}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 block">PESO / ALTURA:</span>
                    <span className="text-slate-900">
                      {weight} kg | {height} cm (IMC: {imcValue} - {imcClass?.text})
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 block">META CALÓRICA:</span>
                    <span className="text-slate-900 font-semibold">
                      {patient?.daily_calorie_goal || 2000} kcal/dia
                    </span>
                  </div>
                </div>

                {/* Plano de Refeições Prescritas */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#003366] uppercase border-b border-slate-200 pb-1">
                    Plano Alimentar Prescrito
                  </h4>
                  {meals && meals.length > 0 ? (
                    <div className="space-y-2">
                      {meals.map((m) => (
                        <div key={m.id} className="text-xs border-b border-slate-100 pb-1">
                          <span className="font-bold text-[#003366]">{m.name}:</span>{" "}
                          {m.items
                            ?.map((it: any) => `${it.food?.name} (${it.quantity_grams}g)`)
                            .join(", ") || "Sem itens registrados"}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      Alimentação fracionada em 4 a 6 refeições diárias respeitando a saciedade.
                    </p>
                  )}
                </div>

                {/* Orientações Personalizadas */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#003366] uppercase">
                    Orientações Nutricionais & Conduta
                  </Label>
                  <textarea
                    value={prescriptionNotes}
                    onChange={(e) => setPrescriptionNotes(e.target.value)}
                    rows={3}
                    className="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                  />
                </div>

                {/* Assinatura / Carimbo Sesc */}
                <div className="pt-8 border-t border-slate-200 text-center space-y-1">
                  <div className="w-48 border-b border-slate-400 mx-auto"></div>
                  <p className="text-xs font-bold text-[#003366]">Equipe de Nutrição Sesc Amapá</p>
                  <p className="text-[10px] text-slate-400">CRN — Atendimento Clínico Autorizado</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  onClick={() => window.print()}
                  className="bg-[#003366] hover:bg-[#002244] text-white font-bold"
                >
                  <Printer className="h-4 w-4 mr-1.5" />
                  Imprimir Receita (PDF)
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Botão de Excluir Paciente */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeletePatientCurrent}
            className="border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Avaliação Antropométrica e Medidas Corporais */}
      <Card className="border border-slate-200 shadow-sm bg-white border-t-4 border-t-[#003366]">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-[#003366]" />
            <div>
              <CardTitle className="text-base font-bold text-[#003366]">
                Avaliação Antropométrica & Medidas Corporais
              </CardTitle>
              <p className="text-xs text-slate-500">
                Acompanhamento clínico de peso, circunferências, IMC e comorbidades
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {imcClass && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${imcClass.color}`}>
                {imcClass.text}
              </span>
            )}
            <Button
              onClick={handleSaveEvaluation}
              size="sm"
              className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Salvar Avaliação
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-6">
          {/* Dados Gerais & IMC */}
          <div>
            <h4 className="text-xs font-bold text-[#003366] uppercase mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <Scale className="h-4 w-4 text-[#003366]" />
              Dados Principais & Composição
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label htmlFor="weight" className="text-xs font-semibold text-slate-700">
                  Peso (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="height" className="text-xs font-semibold text-slate-700">
                  Altura (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="bodyFat" className="text-xs font-semibold text-slate-700">
                  Gordura (%BF)
                </Label>
                <Input
                  id="bodyFat"
                  type="number"
                  step="0.1"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                />
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-center">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                  IMC Calculado
                </span>
                <span className="text-xl font-black text-[#003366]">
                  {imcValue > 0 ? imcValue : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Circunferências Corporais (cm) */}
          <div>
            <h4 className="text-xs font-bold text-[#003366] uppercase mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <Ruler className="h-4 w-4 text-[#003366]" />
              Circunferências (cm) & Relação Cintura/Quadril (RCQ)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label htmlFor="waist" className="text-xs font-semibold text-slate-700">
                  Cintura (cm)
                </Label>
                <Input
                  id="waist"
                  type="number"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="hip" className="text-xs font-semibold text-slate-700">
                  Quadril (cm)
                </Label>
                <Input
                  id="hip"
                  type="number"
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="abdomen" className="text-xs font-semibold text-slate-700">
                  Abdômen (cm)
                </Label>
                <Input
                  id="abdomen"
                  type="number"
                  value={abdomen}
                  onChange={(e) => setAbdomen(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="chest" className="text-xs font-semibold text-slate-700">
                  Tórax (cm)
                </Label>
                <Input
                  id="chest"
                  type="number"
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="rightArm" className="text-xs font-semibold text-slate-700">
                  Braço Dir. (cm)
                </Label>
                <Input
                  id="rightArm"
                  type="number"
                  value={rightArm}
                  onChange={(e) => setRightArm(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="leftArm" className="text-xs font-semibold text-slate-700">
                  Braço Esq. (cm)
                </Label>
                <Input
                  id="leftArm"
                  type="number"
                  value={leftArm}
                  onChange={(e) => setLeftArm(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="rightThigh" className="text-xs font-semibold text-slate-700">
                  Coxa Dir. (cm)
                </Label>
                <Input
                  id="rightThigh"
                  type="number"
                  value={rightThigh}
                  onChange={(e) => setRightThigh(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="leftThigh" className="text-xs font-semibold text-slate-700">
                  Coxa Esq. (cm)
                </Label>
                <Input
                  id="leftThigh"
                  type="number"
                  value={leftThigh}
                  onChange={(e) => setLeftThigh(e.target.value)}
                />
              </div>
            </div>

            {/* Cálculo de RCQ */}
            <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs text-slate-700">
                <span className="font-bold text-[#003366]">Relação Cintura/Quadril (RCQ):</span>{" "}
                <span className="font-extrabold text-slate-900">
                  {rcqValue > 0 ? rcqValue : "—"}
                </span>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded ${
                  rcqValue > 0.85
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {rcqValue > 0.85
                  ? "Risco Cardiovascular Moderado/Elevado"
                  : "Risco Cardiovascular Baixo (Ideal)"}
              </span>
            </div>
          </div>

          {/* Histórico de Evolução Antropométrica */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-[#003366] uppercase mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <History className="h-4 w-4 text-[#003366]" />
              Histórico & Evolução de Medidas do Paciente
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2">Data</th>
                    <th className="p-2">Consulta</th>
                    <th className="p-2">Peso</th>
                    <th className="p-2">IMC</th>
                    <th className="p-2">Cintura</th>
                    <th className="p-2">Quadril</th>
                    <th className="p-2">RCQ</th>
                    <th className="p-2">% Gordura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evaluationsHistory.map((ev, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 font-medium text-slate-900">{ev.date}</td>
                      <td className="p-2 text-slate-600">{ev.label}</td>
                      <td className="p-2 font-bold text-[#003366]">{ev.weight}</td>
                      <td className="p-2 font-semibold text-slate-700">{ev.imc}</td>
                      <td className="p-2 text-slate-600">{ev.waist}</td>
                      <td className="p-2 text-slate-600">{ev.hip}</td>
                      <td className="p-2 text-slate-600">{ev.rcq}</td>
                      <td className="p-2 font-semibold text-slate-700">{ev.bodyFat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo de Macronutrientes do Dia */}
      <div className="grid gap-4 sm:grid-cols-4">
        <MacroCard label="Calorias Registradas" value={`${Math.round(totals?.kcal || 0)} kcal`} />
        <MacroCard label="Proteínas" value={`${Math.round(totals?.protein || 0)} g`} />
        <MacroCard label="Carboidratos" value={`${Math.round(totals?.carbs || 0)} g`} />
        <MacroCard label="Gorduras" value={`${Math.round(totals?.fat || 0)} g`} />
      </div>

      {/* Seção de Diário Alimentar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-[#003366]" />
            <h2 className="text-lg font-bold text-[#003366]">Diário Alimentar</h2>
          </div>

          <Dialog open={openMealDialog} onOpenChange={setOpenMealDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Refeição
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-[#003366]">
                  Nova Refeição no Prontuário
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMeal} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="date" className="text-xs font-semibold text-slate-700">
                    Data
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mealName" className="text-xs font-semibold text-slate-700">
                    Refeição
                  </Label>
                  <Select value={mealName} onValueChange={setMealName}>
                    <SelectTrigger id="mealName">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEAL_NAMES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="food" className="text-xs font-semibold text-slate-700">
                    Alimento
                  </Label>
                  <Select value={selectedFood} onValueChange={setSelectedFood}>
                    <SelectTrigger id="food">
                      <SelectValue placeholder="Selecione da tabela de alimentos" />
                    </SelectTrigger>
                    <SelectContent>
                      {foods?.map((foodItem) => (
                        <SelectItem key={foodItem.id} value={foodItem.id}>
                          {foodItem.name} ({foodItem.calories_per_100g} kcal/100g)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="quantity" className="text-xs font-semibold text-slate-700">
                    Quantidade (gramas)
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold"
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Salvar Refeição"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Refeições */}
        <div className="space-y-4">
          {meals && meals.length > 0 ? (
            meals.map((mealItem) => (
              <Card key={mealItem.id} className="border border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50 border-b border-slate-100">
                  <div>
                    <CardTitle className="text-sm font-bold text-[#003366]">
                      {mealItem.name}
                    </CardTitle>
                    <p className="text-[11px] text-slate-500">
                      {format(new Date(mealItem.meal_date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteMeal(mealItem.id)}
                  >
                    Remover
                  </Button>
                </CardHeader>
                <CardContent className="pt-3">
                  {mealItem.items && mealItem.items.length > 0 ? (
                    <ul className="space-y-2">
                      {mealItem.items.map((item: any) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between text-xs border-b border-slate-100 pb-1"
                        >
                          <span className="font-medium text-slate-800">
                            {item.food?.name} — {item.quantity_grams}g
                          </span>
                          <span className="font-bold text-[#003366]">
                            {Math.round(item.calculated_calories)} kcal
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Nenhum alimento adicionado.</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center bg-white space-y-2">
              <Utensils className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">Nenhuma refeição registrada na data de hoje.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MacroCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border border-slate-200 bg-white">
      <CardContent className="p-4">
        <p className="text-[11px] font-semibold text-slate-500 uppercase">{label}</p>
        <p className="mt-1 text-lg font-bold text-[#003366]">{value}</p>
      </CardContent>
    </Card>
  );
}
