import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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
  updatePatientClinicalData,
} from "@/lib/nutrition.functions";
import {
  getBloodPressureClassification,
  getGlucoseClassification,
  getImcClassification,
} from "@/lib/clinical-formulas";
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
  Printer,
  Trash2,
  Plus,
  Utensils,
  FileText,
  Ruler,
  Activity,
  History,
  CheckCircle,
  ClipboardList,
  BookOpen,
  FlaskConical,
  Save,
  Calendar,
  ShieldCheck,
  Lock,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/patients/$id")({
  head: () => ({
    meta: [
      { title: "Prontuário & Medidas Corporais — Saúde Nutricional Sesc" },
      {
        name: "description",
        content: "Prontuário clínico, medidas corporais, anamnese e prescrição nutricional.",
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

function PatientDetailPage() {
  const { id } = useParams({ from: "/app/patients/$id" });
  const navigate = useNavigate();
  const today = format(new Date(), "yyyy-MM-dd");

  const [activeTab, setActiveTab] = useState<
    "anamnesis" | "anthropometry" | "diet" | "recipes" | "exams" | "notes"
  >("anamnesis");

  const [date, setDate] = useState(today);
  const [digitalHash, setDigitalHash] = useState("");

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
    queryKey: ["meals", id, date],
    queryFn: async () => {
      try {
        return await getMealsForPatient({ data: { patient_id: id, date } });
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

  const patientName = patient?.full_name || "Paciente Sesc";

  // 1. Estados de Medidas Corporais & Triagem de Sinais Vitais (iniciam limpos)
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [abdomen, setAbdomen] = useState("");
  const [chest, setChest] = useState("");
  const [rightArm, setRightArm] = useState("");
  const [leftArm, setLeftArm] = useState("");
  const [rightThigh, setRightThigh] = useState("");
  const [leftThigh, setLeftThigh] = useState("");
  const [bodyFat, setBodyFat] = useState("");

  // Estados de Sinais Vitais (Pressão Arterial e Glicemia)
  const [systolicBP, setSystolicBP] = useState(""); // PAS (mmHg)
  const [diastolicBP, setDiastolicBP] = useState(""); // PAD (mmHg)
  const [glucoseValue, setGlucoseValue] = useState(""); // Glicemia (mg/dL)
  const [glucoseType, setGlucoseType] = useState<"jejum" | "casual">("jejum");

  // Restaurar e hidratar os dados reais salvos no banco Supabase ao carregar
  useEffect(() => {
    // Resetar estado local para evitar vazamento entre pacientes
    setWeight("");
    setHeight("");
    setWaist("");
    setHip("");
    setAbdomen("");
    setChest("");
    setRightArm("");
    setLeftArm("");
    setRightThigh("");
    setLeftThigh("");
    setBodyFat("");
    setSystolicBP("");
    setDiastolicBP("");
    setGlucoseValue("");
    setGlucoseType("jejum");
    setClinicalHistory("");
    setMedications("");
    setAllergies("");
    setPreferences("");
    setAversions("");
    setPhysicalActivity("");
    setWaterIntake("");
    setBowelHabits("");
    setTreatmentGoal("");
    setCustomAnamnesisQuestions([]);
    setEvaluationsHistory([]);
    setRecipesList([]);
    setExamsList([]);
    setNotesHistory([]);

    if (!patient?.notes) return;
    try {
      if (patient.notes.startsWith("{")) {
        const obj = JSON.parse(patient.notes);
        if (obj.weight) setWeight(obj.weight);
        if (obj.height) setHeight(obj.height);
        if (obj.waist) setWaist(obj.waist);
        if (obj.hip) setHip(obj.hip);
        if (obj.abdomen) setAbdomen(obj.abdomen);
        if (obj.chest) setChest(obj.chest);
        if (obj.rightArm) setRightArm(obj.rightArm);
        if (obj.leftArm) setLeftArm(obj.leftArm);
        if (obj.rightThigh) setRightThigh(obj.rightThigh);
        if (obj.leftThigh) setLeftThigh(obj.leftThigh);
        if (obj.bodyFat) setBodyFat(obj.bodyFat);
        if (obj.systolicBP) setSystolicBP(obj.systolicBP);
        if (obj.diastolicBP) setDiastolicBP(obj.diastolicBP);
        if (obj.glucoseValue) setGlucoseValue(obj.glucoseValue);
        if (obj.glucoseType) setGlucoseType(obj.glucoseType);
        if (obj.clinicalHistory) setClinicalHistory(obj.clinicalHistory);
        if (obj.medications) setMedications(obj.medications);
        if (obj.allergies) setAllergies(obj.allergies);
        if (obj.preferences) setPreferences(obj.preferences);
        if (obj.aversions) setAversions(obj.aversions);
        if (obj.physicalActivity) setPhysicalActivity(obj.physicalActivity);
        if (obj.waterIntake) setWaterIntake(obj.waterIntake);
        if (obj.bowelHabits) setBowelHabits(obj.bowelHabits);
        if (obj.treatmentGoal) setTreatmentGoal(obj.treatmentGoal);
        if (obj.customAnamnesisQuestions && Array.isArray(obj.customAnamnesisQuestions)) {
          setCustomAnamnesisQuestions(obj.customAnamnesisQuestions);
        } else if (obj.anamnesis && Array.isArray(obj.anamnesis)) {
          setCustomAnamnesisQuestions(obj.anamnesis);
        }
        if (obj.evaluationsHistory && Array.isArray(obj.evaluationsHistory)) {
          setEvaluationsHistory(obj.evaluationsHistory);
        }
        if (obj.recipesList && Array.isArray(obj.recipesList)) {
          setRecipesList(obj.recipesList);
        }
        if (obj.examsList && Array.isArray(obj.examsList)) {
          setExamsList(obj.examsList);
        }
        if (obj.notesHistory && Array.isArray(obj.notesHistory)) {
          setNotesHistory(obj.notesHistory);
        }
      }
    } catch (err) {
      console.error("[Hydration Error]", err);
    }
  }, [patient]);

  const [evaluationsHistory, setEvaluationsHistory] = useState<
    Array<{
      date: string;
      label: string;
      weight: string;
      height: string;
      imc: string;
      pa: string;
      paStatus: string;
      glicemia: string;
      glicemiaStatus: string;
      waist?: string;
      rcq?: string;
      bodyFat?: string;
    }>
  >([]);

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

  const numSystolic = Number(systolicBP) || 0;
  const numDiastolic = Number(diastolicBP) || 0;
  const bpDiag =
    numSystolic > 0 && numDiastolic > 0
      ? getBloodPressureClassification(numSystolic, numDiastolic)
      : null;

  const numGlucose = Number(glucoseValue) || 0;
  const glucoseDiag = numGlucose > 0 ? getGlucoseClassification(numGlucose, glucoseType) : null;

  const handleSaveEvaluation = async () => {
    const newEval = {
      date: format(new Date(), "dd/MM/yyyy"),
      label: `Triagem & Retorno ${evaluationsHistory.length + 1}`,
      weight: weight ? `${weight} kg` : "Não informado",
      height: height ? `${height} cm` : "Não informado",
      imc: imcValue > 0 ? `${imcValue}` : "Não informado",
      pa: systolicBP && diastolicBP ? `${systolicBP}/${diastolicBP} mmHg` : "Não informado",
      paStatus: bpDiag?.status || "Não informado",
      glicemia: glucoseValue
        ? `${glucoseValue} mg/dL (${glucoseType === "jejum" ? "Jejum" : "Casual"})`
        : "Não informado",
      glicemiaStatus: glucoseDiag?.status || "Não informado",
      waist: waist ? `${waist} cm` : "Não informado",
      hip: hip ? `${hip} cm` : "Não informado",
      rcq: rcqValue > 0 ? `${rcqValue}` : "Não informado",
      bodyFat: bodyFat ? `${bodyFat}%` : "Não informado",
    };
    const updatedEval = [newEval, ...evaluationsHistory];
    try {
      await updatePatientClinicalData({
        data: {
          patient_id: id,
          weight,
          height,
          waist,
          hip,
          abdomen,
          chest,
          rightArm,
          leftArm,
          rightThigh,
          leftThigh,
          bodyFat,
          systolicBP,
          diastolicBP,
          glucoseValue,
          glucoseType,
          evaluationsHistory: updatedEval,
        },
      });
      setEvaluationsHistory(updatedEval);
      toast.success("Triagem de Sinais Vitais e Medidas salvas e registradas no prontuário!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro de conexão";
      toast.error(`Erro ao salvar no banco: ${msg}`);
    }
  };

  // 2. Estados de Anamnese Clínica & Nutricional (iniciam limpos)
  const [clinicalHistory, setClinicalHistory] = useState("");
  const [medications, setMedications] = useState("");
  const [allergies, setAllergies] = useState("");
  const [preferences, setPreferences] = useState("");
  const [aversions, setAversions] = useState("");
  const [physicalActivity, setPhysicalActivity] = useState("");
  const [waterIntake, setWaterIntake] = useState("");
  const [bowelHabits, setBowelHabits] = useState("");
  const [treatmentGoal, setTreatmentGoal] = useState("");

  // Perguntas e Campos Dinâmicos da Anamnese
  const [customAnamnesisQuestions, setCustomAnamnesisQuestions] = useState<
    Array<{ id: string; question: string; answer: string }>
  >([]);

  const [openNewQuestionDialog, setOpenNewQuestionDialog] = useState(false);
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionAnswer, setNewQuestionAnswer] = useState("");

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionTitle.trim()) {
      toast.error("Informe o título da pergunta.");
      return;
    }
    const newQ = {
      id: Date.now().toString(),
      question: newQuestionTitle.trim(),
      answer: newQuestionAnswer.trim(),
    };
    const updatedList = [...customAnamnesisQuestions, newQ];
    try {
      await updatePatientClinicalData({
        data: {
          patient_id: id,
          customAnamnesisQuestions: updatedList,
        },
      });
      setCustomAnamnesisQuestions(updatedList);
      setNewQuestionTitle("");
      setNewQuestionAnswer("");
      setOpenNewQuestionDialog(false);
      toast.success("Nova pergunta salva na Anamnese do banco!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar pergunta";
      toast.error(`Falha ao salvar pergunta no banco: ${msg}`);
    }
  };

  const handleUpdateQuestionTitle = (targetId: string, newTitle: string) => {
    setCustomAnamnesisQuestions((prev) =>
      prev.map((q) => (q.id === targetId ? { ...q, question: newTitle } : q)),
    );
  };

  const handleUpdateQuestionAnswer = (targetId: string, newAnswer: string) => {
    setCustomAnamnesisQuestions((prev) =>
      prev.map((q) => (q.id === targetId ? { ...q, answer: newAnswer } : q)),
    );
  };

  const handleDeleteQuestion = async (targetId: string) => {
    const updatedList = customAnamnesisQuestions.filter((q) => q.id !== targetId);
    try {
      await updatePatientClinicalData({
        data: {
          patient_id: id,
          customAnamnesisQuestions: updatedList,
        },
      });
      setCustomAnamnesisQuestions(updatedList);
      toast.success("Pergunta removida da Anamnese do banco!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao remover pergunta";
      toast.error(`Falha ao remover pergunta no banco: ${msg}`);
    }
  };

  const handleSaveAnamnesis = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePatientClinicalData({
        data: {
          patient_id: id,
          clinicalHistory,
          medications,
          allergies,
          preferences,
          aversions,
          physicalActivity,
          waterIntake,
          bowelHabits,
          treatmentGoal,
          customAnamnesisQuestions,
        },
      });
      toast.success("Anamnese clínica e nutricional salva com sucesso no prontuário Sesc!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar anamnese";
      toast.error(`Falha ao salvar anamnese: ${msg}`);
    }
  };

  // 3. Estados de Receitas & Guias Nutricionais (iniciam limpos)
  const [recipesList, setRecipesList] = useState<
    Array<{
      id: string;
      title: string;
      category: string;
      ingredients: string;
      preparation: string;
      date: string;
    }>
  >([]);
  const [openRecipeDialog, setOpenRecipeDialog] = useState(false);
  const [recipeTitle, setRecipeTitle] = useState("");
  const [recipeCategory, setRecipeCategory] = useState("Café da Manhã");
  const [recipeIngredients, setRecipeIngredients] = useState("");
  const [recipePreparation, setRecipePreparation] = useState("");

  const handleAddRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeTitle || !recipeIngredients) {
      toast.error("Preencha o título e os ingredientes da receita.");
      return;
    }
    const newRec = {
      id: Date.now().toString(),
      title: recipeTitle,
      category: recipeCategory,
      ingredients: recipeIngredients,
      preparation: recipePreparation,
      date: format(new Date(), "dd/MM/yyyy"),
    };
    const updated = [newRec, ...recipesList];
    try {
      await updatePatientClinicalData({
        data: {
          patient_id: id,
          recipesList: updated,
        },
      });
      setRecipesList(updated);
      setRecipeTitle("");
      setRecipeIngredients("");
      setRecipePreparation("");
      setOpenRecipeDialog(false);
      toast.success("Receita prescrita e salva no prontuário!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar receita";
      toast.error(`Falha ao salvar receita: ${msg}`);
    }
  };

  // 4. Estados de Exames Laboratoriais (iniciam limpos)
  const [examsList, setExamsList] = useState<
    Array<{
      id: string;
      name: string;
      value: string;
      unit: string;
      reference: string;
      status: "Normal" | "Alterado";
      date: string;
    }>
  >([]);
  const [openExamDialog, setOpenExamDialog] = useState(false);
  const [examName, setExamName] = useState("");
  const [examValue, setExamValue] = useState("");
  const [examUnit, setExamUnit] = useState("mg/dL");
  const [examReference, setExamReference] = useState("");
  const [examStatus, setExamStatus] = useState<"Normal" | "Alterado">("Normal");

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName || !examValue) {
      toast.error("Preencha o nome e o resultado do exame.");
      return;
    }
    const newEx = {
      id: Date.now().toString(),
      name: examName,
      value: examValue,
      unit: examUnit,
      reference: examReference || "Valores de Referência Sesc",
      status: examStatus,
      date: format(new Date(), "dd/MM/yyyy"),
    };
    const updated = [newEx, ...examsList];
    try {
      await updatePatientClinicalData({
        data: {
          patient_id: id,
          examsList: updated,
        },
      });
      setExamsList(updated);
      setExamName("");
      setExamValue("");
      setExamReference("");
      setOpenExamDialog(false);
      toast.success("Exame laboratorial registrado com sucesso!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar exame";
      toast.error(`Falha ao salvar exame: ${msg}`);
    }
  };

  // 5. Estados de Anotações do Nutricionista (iniciam limpos)
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [notesHistory, setNotesHistory] = useState<
    Array<{
      id: string;
      date: string;
      content: string;
      author: string;
    }>
  >([]);

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicalNotes.trim()) return;
    const newNote = {
      id: Date.now().toString(),
      date: format(new Date(), "dd/MM/yyyy HH:mm"),
      content: clinicalNotes,
      author: "Nutricionista Resp. Sesc",
    };
    const updatedHistory = [newNote, ...notesHistory];
    try {
      await updatePatientClinicalData({
        data: {
          patient_id: id,
          notesHistory: updatedHistory,
        },
      });
      setNotesHistory(updatedHistory);
      setClinicalNotes("");
      toast.success("Anotação de evolução clínica salva e registrada no prontuário!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar anotação";
      toast.error(`Falha ao salvar anotação: ${msg}`);
    }
  };

  // 6. Estados do Plano Alimentar / Refeições
  const [mealName, setMealName] = useState("Café da manhã");
  const [selectedFood, setSelectedFood] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [openMealDialog, setOpenMealDialog] = useState(false);
  const [openPrescriptionDialog, setOpenPrescriptionDialog] = useState(false);
  const [openContractDialog, setOpenContractDialog] = useState(false);
  const [prescriptionNotes] = useState(
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao registrar refeição";
      toast.error(msg);
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao remover refeição";
      toast.error(msg);
    }
  };

  const handleDeletePatientCurrent = async () => {
    if (!confirm(`Tem certeza que deseja excluir o prontuário de ${patientName}?`)) return;
    try {
      await deletePatient({ data: id });
      toast.success("Prontuário excluído com sucesso!");
      navigate({ to: "/app/patients" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao excluir paciente";
      toast.error(msg);
    }
  };

  const totals = meals?.reduce(
    (acc, meal) => {
      meal.items?.forEach(
        (item: {
          calculated_calories?: number;
          calculated_protein?: number;
          calculated_carbs?: number;
          calculated_fat?: number;
        }) => {
          acc.kcal += item.calculated_calories || 0;
          acc.protein += item.calculated_protein || 0;
          acc.carbs += item.calculated_carbs || 0;
          acc.fat += item.calculated_fat || 0;
        },
      );
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Cabeçalho do Prontuário Clínico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          {(() => {
            const rawCat = patient?.category;
            const catBadge =
              rawCat === "dependente"
                ? {
                    text: "Dependente de Comerciário",
                    color: "bg-emerald-100 text-emerald-900 border-emerald-200",
                  }
                : rawCat === "publico_geral"
                  ? {
                      text: "Público Geral",
                      color: "bg-slate-100 text-slate-800 border-slate-200",
                    }
                  : {
                      text: "Comerciário",
                      color: "bg-blue-100 text-[#003366] border-blue-200",
                    };

            return (
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#003366]">{patientName}</h1>
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-2xs ${catBadge.color}`}
                >
                  {catBadge.text}
                </span>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-[#003366] flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  LGPD Protegido (Lei 13.709/18)
                </span>
              </div>
            );
          })()}
          <p className="text-xs text-slate-500 mt-1">
            Meta Calórica Recomendada:{" "}
            <strong>{patient?.daily_calorie_goal || 2000} kcal/dia</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Modal de Conformidade LGPD & Direitos do Titular */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold gap-1.5 rounded-xl"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Conformidade LGPD
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-[#003366] flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  Proteção de Dados Sensíveis (LGPD)
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-xs text-slate-700 pt-2">
                <p className="leading-relaxed">
                  Em conformidade com a{" "}
                  <strong>
                    Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - Art. 5º, II e Art. 11)
                  </strong>
                  , os dados de saúde deste prontuário são classificados como{" "}
                  <strong>dados pessoais sensíveis</strong>.
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <strong className="text-[#003366] block">
                    Direitos do Paciente (Artigo 18):
                  </strong>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                    <li>Confirmação da existência de tratamento dos dados.</li>
                    <li>Acesso rápido ao histórico de consultas e prescrições.</li>
                    <li>Correção de dados incompletos ou desatualizados.</li>
                    <li>Eliminação ou anonimização de dados a pedido do titular.</li>
                    <li>Revogação do consentimento a qualquer momento.</li>
                  </ul>
                </div>
                <p className="text-[11px] text-slate-500 italic border-t border-slate-100 pt-2">
                  Encarregado de Proteção de Dados (DPO Sesc): <strong>dpo@sesc.com.br</strong>
                </p>
              </div>
            </DialogContent>
          </Dialog>

          {/* Termo de Prestação de Serviços Nutricionais & TCLE Sesc */}
          <Dialog open={openContractDialog} onOpenChange={setOpenContractDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold gap-1.5 shadow-sm rounded-xl">
                <FileCheck className="h-4 w-4" />
                Imprimir Termo & TCLE Sesc
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-[#003366] flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-[#003366]" />
                  Termo de Prestação de Serviços Nutricionais & TCLE Sesc
                </DialogTitle>
              </DialogHeader>

              {/* Documento do Termo e Contrato Imprimível */}
              <div className="p-8 border border-slate-300 rounded bg-white space-y-6 text-slate-800 my-2 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <SescLogo className="h-12" />
                  <div className="text-right">
                    <h3 className="font-extrabold text-[#003366] text-sm uppercase">
                      Serviço Social do Comércio – SESC-AR/AP
                    </h3>
                    <p className="text-[11px] text-slate-600 font-semibold">
                      CNPJ: 03.593.251/0001-15
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Centro de Atividades Araxá | Rua Jovino Dinoá, 4311, Beirol - Macapá/AP
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-500 block uppercase tracking-wider text-[10px]">
                      PACIENTE / TITULAR:
                    </span>
                    <span className="text-slate-900 font-extrabold text-sm">{patientName}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 block uppercase tracking-wider text-[10px]">
                      CATEGORIA INSTITUCIONAL:
                    </span>
                    <span className="text-[#003366] font-extrabold">
                      {patient?.category === "dependente"
                        ? "Dependente de Comerciário"
                        : patient?.category === "publico_geral"
                          ? "Público Geral"
                          : "Comerciário (Trabalhador do Comércio)"}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 block uppercase tracking-wider text-[10px]">
                      DATA DA EMISSÃO:
                    </span>
                    <span className="text-slate-900 font-bold">
                      {format(new Date(), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 block uppercase tracking-wider text-[10px]">
                      UNIDADE DE ATENDIMENTO:
                    </span>
                    <span className="text-slate-900 font-bold">Sesc Araxá - Saúde & Nutrição</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                  <div>
                    <h4 className="font-extrabold text-[#003366] uppercase text-[11px] border-b border-slate-200 pb-1 mb-1.5">
                      CLÁUSULA 1ª — DO OBJETO DO ATENDIMENTO
                    </h4>
                    <p>
                      O presente termo tem por objeto a prestação de serviços de assistência
                      nutricional pela equipe técnica do <strong>Sesc</strong>, incluindo anamnese
                      clínica, avaliação antropométrica, triagem de sinais vitais (pressão arterial
                      e glicemia capilar), prescrição e acompanhamento de planos alimentares
                      personalizados.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-[#003366] uppercase text-[11px] border-b border-slate-200 pb-1 mb-1.5">
                      CLÁUSULA 2ª — DAS RESPONSABILIDADES DO PACIENTE
                    </h4>
                    <p>
                      O(a) paciente compromete-se a fornecer informações verídicas e completas sobre
                      seu histórico clínico, diagnósticos médicos, uso de medicamentos, alergias e
                      hábitos alimentares, ciente de que a exatidão dos dados é essencial para a
                      segurança e eficácia das prescrições.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-[#003366] uppercase text-[11px] border-b border-slate-200 pb-1 mb-1.5">
                      CLÁUSULA 3ª — DO SIGILO PROFISSIONAL E ÉTICA (CFN)
                    </h4>
                    <p>
                      A equipe de nutrição do Sesc compromete-se a manter rigoroso sigilo
                      profissional sobre todas as informações coletadas durante o atendimento, em
                      estrita observância ao Código de Ética e Conduta do Nutricionista (Resolução
                      CFN nº 599/2018).
                    </p>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-[#003366] uppercase text-[11px] border-b border-slate-200 pb-1 mb-1.5">
                      CLÁUSULA 4ª — DO TRATAMENTO DE DADOS PESSOAIS (LGPD)
                    </h4>
                    <p>
                      Em conformidade com a{" "}
                      <strong>
                        Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - Art. 5º, II e Art. 11)
                      </strong>
                      , o(a) paciente declara ciência e autoriza expressamente o Sesc a realizar o
                      tratamento de seus <strong>dados pessoais sensíveis de saúde</strong>{" "}
                      exclusivamente para fins de acompanhamento nutricional clínico e estatísticas
                      institucionais anonimizadas.
                    </p>
                  </div>
                </div>

                {/* Bloco de Assinaturas */}
                <div className="pt-12 grid grid-cols-2 gap-8 text-center border-t border-slate-200 mt-8">
                  <div>
                    <div className="border-t border-slate-400 mb-1 mx-4" />
                    <p className="text-xs font-bold text-slate-800">{patientName}</p>
                    <p className="text-[10px] text-slate-400">
                      Assinatura do Paciente / Responsável Legal
                    </p>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 mb-1 mx-4" />
                    <p className="text-xs font-bold text-[#003366]">
                      Equipe de Nutrição Clínica Sesc
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Carimbo e Assinatura do Profissional (CRN)
                    </p>
                  </div>
                </div>

                <div className="text-[9px] text-slate-400 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span>🔒 Documento emitido em conformidade com a LGPD.</span>
                  <span>Via do Prontuário / Paciente</span>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto bg-[#003366] hover:bg-[#002244] text-white font-bold rounded-xl py-2.5 px-6 text-xs gap-1.5 shadow-xs"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir PDF
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Emitir Receita / Prescrição Sesc */}
          <Dialog open={openPrescriptionDialog} onOpenChange={setOpenPrescriptionDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold gap-1.5 shadow-sm rounded-xl">
                <Printer className="h-4 w-4" />
                Imprimir Prescrição
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
                      Serviço Social do Comércio – SESC-AR/AP
                    </h3>
                    <p className="text-[11px] text-slate-600 font-semibold">
                      CNPJ: 03.593.251/0001-15
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Centro de Atividades Araxá | Rua Jovino Dinoá, 4311, Beirol - Macapá/AP
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-600 block">PACIENTE:</span>
                    <span className="text-slate-900 font-semibold">{patientName}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 block">CATEGORIA SESC:</span>
                    <span className="text-[#003366] font-bold">
                      {patient?.category === "dependente"
                        ? "Dependente de Comerciário"
                        : patient?.category === "publico_geral"
                          ? "Público Geral"
                          : "Comerciário (Trabalhador do Comércio)"}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 block">DATA DA EMISSÃO:</span>
                    <span className="text-slate-900">{format(new Date(), "dd/MM/yyyy")}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 block">PESO / ALTURA / IMC:</span>
                    <span className="text-slate-900 font-medium">
                      {weight && height
                        ? `${weight} kg | ${height} cm (IMC: ${imcValue}${imcClass ? ` - ${imcClass.text}` : ""})`
                        : "Não informado"}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 block">META CALÓRICA:</span>
                    <span className="text-slate-900 font-semibold">
                      {patient?.daily_calorie_goal || 2000} kcal/dia
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 block">PRESSÃO ARTERIAL (PA):</span>
                    <span className="text-[#003366] font-bold">
                      {systolicBP && diastolicBP
                        ? `${systolicBP}/${diastolicBP} mmHg (${bpDiag?.status || "Não informado"})`
                        : "Não informado"}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 block">GLICEMIA CAPILAR:</span>
                    <span className="text-[#003366] font-bold">
                      {glucoseValue
                        ? `${glucoseValue} mg/dL (${glucoseDiag?.status || "Não informado"})`
                        : "Não informado"}
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
                            ?.map(
                              (it: { food?: { name?: string }; quantity_grams?: number }) =>
                                `${it.food?.name} (${it.quantity_grams}g)`,
                            )
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

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#003366] uppercase border-b border-slate-200 pb-1">
                    Orientações Nutricionais Finais
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-2.5 rounded border border-slate-100">
                    "{prescriptionNotes}"
                  </p>
                </div>

                <div className="pt-6 flex flex-col items-center justify-center text-center border-t border-slate-200 space-y-3">
                  <div className="w-48 border-t border-slate-400 mb-0.5" />
                  <div>
                    <p className="text-xs font-bold text-[#003366]">
                      Equipe de Nutrição Clínica Sesc
                    </p>
                    <p className="text-[10px] text-slate-400">CRN Região Amapá</p>
                  </div>
                  <div className="text-[9px] text-slate-400 pt-2 border-t border-slate-100 w-full flex items-center justify-between">
                    <span>
                      🔒 Prescrição médica/nutricional emitida em conformidade com a LGPD.
                    </span>
                    <span>Sesc Saúde Nutricional</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto bg-[#003366] hover:bg-[#002244] text-white font-bold rounded-xl py-2.5 px-6 text-xs gap-1.5 shadow-xs"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir PDF
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-rose-700 bg-rose-50/80 hover:bg-rose-600 hover:text-white border border-rose-200/80 font-bold rounded-xl px-3.5 py-2 transition-all duration-200 shadow-2xs flex items-center gap-1.5"
            onClick={handleDeletePatientCurrent}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Excluir Prontuário
          </Button>
        </div>
      </div>

      {/* Menu de Abas do Prontuário Clínico */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar gap-1 pt-1">
        <button
          onClick={() => setActiveTab("anamnesis")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "anamnesis"
              ? "border-[#003366] text-[#003366] bg-blue-50/50 rounded-t-md"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          Anamnese Nutricional
        </button>

        <button
          onClick={() => setActiveTab("anthropometry")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "anthropometry"
              ? "border-[#003366] text-[#003366] bg-blue-50/50 rounded-t-md"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Ruler className="h-4 w-4" />
          Medidas Corporais & IMC
        </button>

        <button
          onClick={() => setActiveTab("diet")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "diet"
              ? "border-[#003366] text-[#003366] bg-blue-50/50 rounded-t-md"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Utensils className="h-4 w-4" />
          Plano Alimentar
        </button>

        <button
          onClick={() => setActiveTab("recipes")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "recipes"
              ? "border-[#003366] text-[#003366] bg-blue-50/50 rounded-t-md"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Receitas Sesc
        </button>

        <button
          onClick={() => setActiveTab("exams")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "exams"
              ? "border-[#003366] text-[#003366] bg-blue-50/50 rounded-t-md"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FlaskConical className="h-4 w-4" />
          Exames Laboratoriais
        </button>

        <button
          onClick={() => setActiveTab("notes")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "notes"
              ? "border-[#003366] text-[#003366] bg-blue-50/50 rounded-t-md"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="h-4 w-4" />
          Anotações do Nutricionista
        </button>
      </div>

      {/* ---------------- ABA 1: MEDIDAS CORPORAIS ---------------- */}
      {activeTab === "anthropometry" && (
        <div className="space-y-6">
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-[#003366] flex items-center gap-2">
                <Ruler className="h-5 w-5 text-[#003366]" />
                Avaliação Antropométrica & Circunferências
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="weight" className="text-xs font-semibold text-slate-700">
                    Peso Atual (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
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

                <div className="space-y-1.5">
                  <Label htmlFor="bodyFat" className="text-xs font-semibold text-slate-700">
                    % Gordura (%BF)
                  </Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
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

                <div className="space-y-1.5">
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

                <div className="space-y-1.5">
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

                <div className="space-y-1.5">
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

                <div className="space-y-1.5">
                  <Label htmlFor="rightArm" className="text-xs font-semibold text-slate-700">
                    Braço Direito (cm)
                  </Label>
                  <Input
                    id="rightArm"
                    type="number"
                    value={rightArm}
                    onChange={(e) => setRightArm(e.target.value)}
                  />
                </div>
              </div>

              {/* Indicadores Calculados (IMC e RCQ) */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-500 block uppercase tracking-wider">
                      Índice de Massa Corporal (IMC)
                    </span>
                    <span className="text-2xl font-black text-[#003366]">{imcValue} kg/m²</span>
                  </div>
                  {imcClass && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${imcClass.color}`}>
                      {imcClass.text}
                    </span>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-500 block uppercase tracking-wider">
                      Relação Cintura / Quadril (RCQ)
                    </span>
                    <span className="text-2xl font-black text-[#003366]">{rcqValue}</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      rcqValue > 0.85
                        ? "text-amber-700 bg-amber-100 border border-amber-200"
                        : "text-emerald-700 bg-emerald-50 border border-emerald-200"
                    }`}
                  >
                    {rcqValue > 0.85 ? "Risco Cardiovascular Elevado" : "Risco Baixo / Adequado"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MÓDULO DE TRIAGEM DE SINAIS VITAIS (PRESSÃO ARTERIAL E GLICEMIA CAPILAR) */}
          <Card className="border border-slate-200/90 shadow-xs bg-white rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-extrabold text-[#003366] flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#003366]" />
                  Triagem de Sinais Vitais (Pressão Arterial & Glicemia)
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Classificação automática baseada nas diretrizes da SBC (Hipertensão) e SBD
                  (Diabetes)
                </p>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-100 text-[#003366] border border-blue-200">
                Classificação em Tempo Real
              </span>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Bloco 1: Aferição de Pressão Arterial */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <h4 className="text-xs font-extrabold text-[#003366] uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-rose-600" />
                    Pressão Arterial (PA)
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-500">Unidade: mmHg</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1.5">
                    <Label htmlFor="systolicBP" className="text-xs font-bold text-slate-700">
                      Sistólica (PAS)
                    </Label>
                    <Input
                      id="systolicBP"
                      type="number"
                      placeholder="120"
                      value={systolicBP}
                      onChange={(e) => setSystolicBP(e.target.value)}
                      className="bg-white border-slate-200 font-extrabold text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="diastolicBP" className="text-xs font-bold text-slate-700">
                      Diastólica (PAD)
                    </Label>
                    <Input
                      id="diastolicBP"
                      type="number"
                      placeholder="80"
                      value={diastolicBP}
                      onChange={(e) => setDiastolicBP(e.target.value)}
                      className="bg-white border-slate-200 font-extrabold text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Resultado da Aferição
                    </span>
                    {bpDiag ? (
                      <div className={`p-2.5 rounded-lg border text-xs font-bold ${bpDiag.color}`}>
                        <div className="flex items-center justify-between">
                          <span>
                            {systolicBP}/{diastolicBP} mmHg
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded uppercase font-black">
                            {bpDiag.status}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-400 italic">
                        Informe PAS e PAD para classificar
                      </div>
                    )}
                  </div>
                </div>

                {bpDiag && (
                  <p className="text-xs text-slate-600 leading-relaxed italic bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <strong>Parecer Clínico:</strong> {bpDiag.description}
                  </p>
                )}
              </div>

              {/* Bloco 2: Aferição de Glicemia Capilar */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <h4 className="text-xs font-extrabold text-[#003366] uppercase tracking-wider flex items-center gap-1.5">
                    <FlaskConical className="h-4 w-4 text-amber-600" />
                    Glicemia Capilar / Teste de Glicose
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-500">Unidade: mg/dL</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1.5">
                    <Label htmlFor="glucoseValue" className="text-xs font-bold text-slate-700">
                      Resultado do Teste (mg/dL)
                    </Label>
                    <Input
                      id="glucoseValue"
                      type="number"
                      placeholder="95"
                      value={glucoseValue}
                      onChange={(e) => setGlucoseValue(e.target.value)}
                      className="bg-white border-slate-200 font-extrabold text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="glucoseType" className="text-xs font-bold text-slate-700">
                      Condição da Coleta
                    </Label>
                    <Select
                      value={glucoseType}
                      onValueChange={(val: "jejum" | "casual") => setGlucoseType(val)}
                    >
                      <SelectTrigger id="glucoseType" className="bg-white border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jejum">Jejum (8h a 12h)</SelectItem>
                        <SelectItem value="casual">Pós-Prandial / Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Situação Diagnóstica
                    </span>
                    {glucoseDiag ? (
                      <div
                        className={`p-2.5 rounded-lg border text-xs font-bold ${glucoseDiag.color}`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{glucoseValue} mg/dL</span>
                          <span className="text-[10px] px-2 py-0.5 rounded uppercase font-black">
                            {glucoseDiag.status}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-400 italic">
                        Informe o valor em mg/dL
                      </div>
                    )}
                  </div>
                </div>

                {glucoseDiag && (
                  <p className="text-xs text-slate-600 leading-relaxed italic bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <strong>Parecer Clínico:</strong> {glucoseDiag.description}
                  </p>
                )}
              </div>

              <Button
                onClick={handleSaveEvaluation}
                className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold gap-2 shadow-sm rounded-xl py-3"
              >
                <Save className="h-4 w-4" />
                Salvar Triagem de Sinais Vitais & Medidas no Prontuário
              </Button>
            </CardContent>
          </Card>

          {/* Tabela de Histórico de Avaliações e Triagem */}
          <Card className="border border-slate-200/90 shadow-xs bg-white rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-extrabold text-[#003366] flex items-center gap-2">
                <History className="h-4 w-4 text-[#003366]" />
                Histórico de Triagem & Evolução Antropométrica
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Descrição</th>
                    <th className="px-4 py-3">Peso / IMC</th>
                    <th className="px-4 py-3">Pressão Arterial</th>
                    <th className="px-4 py-3">Glicemia</th>
                    <th className="px-4 py-3">Cintura</th>
                    <th className="px-4 py-3">RCQ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evaluationsHistory.map(
                    (
                      item: {
                        date: string;
                        label: string;
                        weight: string;
                        height: string;
                        imc: string;
                        pa: string;
                        paStatus: string;
                        glicemia: string;
                        glicemiaStatus: string;
                        waist?: string;
                        rcq?: string;
                        bodyFat?: string;
                      },
                      idx: number,
                    ) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-[#003366]">{item.date}</td>
                        <td className="px-4 py-3 font-semibold">{item.label}</td>
                        <td className="px-4 py-3">
                          <strong className="text-slate-900">{item.weight}</strong>
                          <span className="text-[11px] text-slate-500 block">IMC: {item.imc}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-extrabold text-[#003366]">
                            {item.pa || "Não informado"}
                          </span>
                          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded block w-fit mt-0.5">
                            {item.paStatus || "Não informado"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-extrabold text-[#003366]">
                            {item.glicemia || "Não informado"}
                          </span>
                          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded block w-fit mt-0.5">
                            {item.glicemiaStatus || "Não informado"}
                          </span>
                        </td>
                        <td className="px-4 py-3">{item.waist}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{item.rcq}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ---------------- ABA 2: ANAMNESE NUTRICIONAL ---------------- */}
      {activeTab === "anamnesis" && (
        <form onSubmit={handleSaveAnamnesis} className="space-y-6">
          <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-extrabold text-[#003366] flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-[#003366]" />
                  Anamnese Clínica & Histórico Nutricional
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Preencha as perguntas clínicas padrão ou adicione novas perguntas personalizadas
                </p>
              </div>

              {/* Botão Adicionar Nova Pergunta */}
              <Dialog open={openNewQuestionDialog} onOpenChange={setOpenNewQuestionDialog}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold gap-1.5 rounded-xl shadow-xs shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Nova Pergunta
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-[#003366]">
                      Adicionar Pergunta à Anamnese
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="qTitle" className="text-xs font-bold text-slate-700">
                        Título da Pergunta / Campo
                      </Label>
                      <Input
                        id="qTitle"
                        value={newQuestionTitle}
                        onChange={(e) => setNewQuestionTitle(e.target.value)}
                        placeholder="Ex: Frequência de Consumo de Ultraprocessados"
                        className="bg-white border-slate-200"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="qAnswer" className="text-xs font-bold text-slate-700">
                        Resposta / Observação Inicial
                      </Label>
                      <textarea
                        id="qAnswer"
                        rows={3}
                        value={newQuestionAnswer}
                        onChange={(e) => setNewQuestionAnswer(e.target.value)}
                        placeholder="Digite a resposta do paciente..."
                        className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={handleAddQuestion}
                      className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 rounded-xl"
                    >
                      Inserir Pergunta na Anamnese
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Seção 1: Perguntas Principais da Anamnese */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-bold text-slate-700">
                    Objetivo do Tratamento Nutricional
                  </Label>
                  <Input
                    value={treatmentGoal}
                    onChange={(e) => setTreatmentGoal(e.target.value)}
                    placeholder="Ex: Reeducação alimentar e controle pressórico"
                    className="bg-white border-slate-200 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    Histórico Clínico & Patologias
                  </Label>
                  <textarea
                    rows={3}
                    className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                    value={clinicalHistory}
                    onChange={(e) => setClinicalHistory(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    Medicamentos / Suplementos em Uso
                  </Label>
                  <textarea
                    rows={3}
                    className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    Alergias & Intolerâncias Alimentares
                  </Label>
                  <textarea
                    rows={3}
                    className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    Preferências Alimentares
                  </Label>
                  <textarea
                    rows={3}
                    className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Aversões Alimentares</Label>
                  <textarea
                    rows={2}
                    className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                    value={aversions}
                    onChange={(e) => setAversions(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    Prática de Atividade Física
                  </Label>
                  <textarea
                    rows={2}
                    className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                    value={physicalActivity}
                    onChange={(e) => setPhysicalActivity(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Consumo Hídrico Diário</Label>
                  <Input
                    value={waterIntake}
                    onChange={(e) => setWaterIntake(e.target.value)}
                    className="bg-white border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Hábitos Intestinais</Label>
                  <Input
                    value={bowelHabits}
                    onChange={(e) => setBowelHabits(e.target.value)}
                    className="bg-white border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Seção 2: Perguntas Adicionais Personalizadas pelo Nutricionista */}
              {customAnamnesisQuestions.length > 0 && (
                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-[#003366] uppercase tracking-wider">
                      Perguntas Personalizadas da Anamnese ({customAnamnesisQuestions.length})
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Você pode editar os títulos e as respostas
                    </span>
                  </div>

                  <div className="space-y-4">
                    {customAnamnesisQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2 relative group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Input
                            value={q.question}
                            onChange={(e) => handleUpdateQuestionTitle(q.id, e.target.value)}
                            className="text-xs font-extrabold text-[#003366] bg-white border-slate-200 h-8"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0"
                            onClick={() => handleDeleteQuestion(q.id)}
                            title="Remover pergunta"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <textarea
                          rows={2}
                          value={q.answer}
                          onChange={(e) => handleUpdateQuestionAnswer(q.id, e.target.value)}
                          placeholder="Digite a resposta do paciente..."
                          className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold gap-2 shadow-sm mt-4 rounded-xl py-3"
              >
                <Save className="h-4 w-4" />
                Salvar Anamnese no Prontuário
              </Button>
            </CardContent>
          </Card>
        </form>
      )}

      {/* ---------------- ABA 3: PLANO ALIMENTAR ---------------- */}
      {activeTab === "diet" && (
        <div className="space-y-6">
          {/* Indicador de Meta Calórica Prescrita */}
          {(() => {
            const goalKcal = patient?.daily_calorie_goal || 2000;
            const currentKcal = Math.round(totals?.kcal || 0);
            const caloriePercent = Math.min(100, Math.round((currentKcal / goalKcal) * 100));

            return (
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="font-extrabold text-[#003366] flex items-center gap-1.5 text-sm">
                    <Activity className="h-4 w-4 text-emerald-600" />
                    Balanço Calórico Prescrito
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-500">
                      Meta Recomendada: <strong className="text-slate-900">{goalKcal} kcal</strong>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-extrabold text-[#003366] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {currentKcal} kcal ({caloriePercent}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      caloriePercent > 105
                        ? "bg-rose-500"
                        : caloriePercent >= 80
                          ? "bg-emerald-500"
                          : "bg-[#003366]"
                    }`}
                    style={{ width: `${caloriePercent}%` }}
                  />
                </div>
              </div>
            );
          })()}

          {/* Cards Bento de Macronutrientes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MacroCard
              label="Calorias Prescritas"
              value={`${Math.round(totals?.kcal || 0)} kcal`}
              color="blue"
            />
            <MacroCard
              label="Proteínas Total"
              value={`${Math.round(totals?.protein || 0)} g`}
              color="emerald"
            />
            <MacroCard
              label="Carboidratos Total"
              value={`${Math.round(totals?.carbs || 0)} g`}
              color="amber"
            />
            <MacroCard
              label="Gorduras Total"
              value={`${Math.round(totals?.fat || 0)} g`}
              color="rose"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div>
              <h3 className="text-sm font-extrabold text-[#003366]">
                Plano de Refeições Diárias Sesc
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monte o cardápio fracionado e prescreva porções por horário
              </p>
            </div>

            <Dialog open={openMealDialog} onOpenChange={setOpenMealDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold gap-1.5 rounded-xl shadow-xs">
                  <Plus className="h-4 w-4" />
                  Adicionar Refeição
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-[#003366]">
                    Registrar Refeição
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddMeal} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="date" className="text-xs font-semibold text-slate-700">
                      Data da Prescrição
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
                      Nome / Tipo de Refeição
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
                      Alimento da Tabela TACO
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
                      Porção (gramas)
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
                    {loading ? "Salvando..." : "Salvar Refeição no Plano"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {meals && meals.length > 0 ? (
              meals.map((mealItem) => {
                const mealKcal =
                  mealItem.items?.reduce(
                    (sum: number, it: { calculated_calories?: number }) =>
                      sum + (it.calculated_calories || 0),
                    0,
                  ) || 0;

                return (
                  <Card
                    key={mealItem.id}
                    className="border border-slate-200/90 shadow-xs rounded-2xl overflow-hidden bg-white"
                  >
                    <CardHeader className="flex flex-row items-center justify-between p-4 bg-slate-50/80 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-blue-100 text-[#003366] font-bold flex items-center justify-center shrink-0">
                          <Utensils className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-extrabold text-[#003366]">
                            {mealItem.name}
                          </CardTitle>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {format(new Date(mealItem.meal_date), "dd/MM/yyyy", { locale: ptBR })} •{" "}
                            <strong className="text-[#003366]">{Math.round(mealKcal)} kcal</strong>
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-bold"
                        onClick={() => handleDeleteMeal(mealItem.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remover
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4">
                      {mealItem.items && mealItem.items.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {mealItem.items.map(
                            (item: {
                              id: string;
                              food?: { name?: string };
                              quantity_grams?: number;
                              calculated_calories?: number;
                              calculated_protein?: number;
                              calculated_carbs?: number;
                              calculated_fat?: number;
                            }) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between py-2 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#003366]" />
                                  <span className="font-semibold text-slate-800">
                                    {item.food?.name}
                                  </span>
                                  <span className="text-[11px] font-medium text-slate-400">
                                    ({item.quantity_grams}g)
                                  </span>
                                </div>
                                <span className="font-extrabold text-[#003366] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                  {Math.round(item.calculated_calories || 0)} kcal
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Nenhum alimento registrado para esta refeição.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center bg-white space-y-2">
                <Utensils className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">
                  Nenhuma refeição prescrita na data de hoje.
                </p>
                <button
                  onClick={() => setOpenMealDialog(true)}
                  className="text-xs text-[#003366] font-bold underline inline-block"
                >
                  Adicionar primeira refeição ao plano
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- ABA 4: RECEITAS SESC ---------------- */}
      {activeTab === "recipes" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#003366] flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#003366]" />
                Receitas & Guias de Preparo Nutricional
              </h3>
              <p className="text-xs text-slate-500">
                Cadastre e prescreva receitas práticas aos pacientes Sesc
              </p>
            </div>

            <Dialog open={openRecipeDialog} onOpenChange={setOpenRecipeDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold gap-1.5 shadow-sm">
                  <Plus className="h-4 w-4" />
                  Nova Receita
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-[#003366]">
                    Cadastrar Nova Receita Nutricional
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddRecipe} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="rTitle" className="text-xs font-semibold text-slate-700">
                      Título da Receita
                    </Label>
                    <Input
                      id="rTitle"
                      placeholder="Ex: Suco Detox de Couve e Limão"
                      value={recipeTitle}
                      onChange={(e) => setRecipeTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="rCategory" className="text-xs font-semibold text-slate-700">
                      Categoria / Tipo
                    </Label>
                    <Select value={recipeCategory} onValueChange={setRecipeCategory}>
                      <SelectTrigger id="rCategory">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Café da Manhã">Café da Manhã</SelectItem>
                        <SelectItem value="Almoço / Jantar">Almoço / Jantar</SelectItem>
                        <SelectItem value="Lanche Saudável">Lanche Saudável</SelectItem>
                        <SelectItem value="Suco / Bebida Funcional">
                          Suco / Bebida Funcional
                        </SelectItem>
                        <SelectItem value="Sobremesa Fit">Sobremesa Fit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="rIng" className="text-xs font-semibold text-slate-700">
                      Ingredientes e Quantidades
                    </Label>
                    <textarea
                      id="rIng"
                      rows={3}
                      className="w-full rounded-md border border-slate-200 p-2 text-xs text-slate-800"
                      placeholder="1 folha de couve, 200ml de água..."
                      value={recipeIngredients}
                      onChange={(e) => setRecipeIngredients(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="rPrep" className="text-xs font-semibold text-slate-700">
                      Modo de Preparo
                    </Label>
                    <textarea
                      id="rPrep"
                      rows={3}
                      className="w-full rounded-md border border-slate-200 p-2 text-xs text-slate-800"
                      placeholder="Bater tudo no liquidificador..."
                      value={recipePreparation}
                      onChange={(e) => setRecipePreparation(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold"
                  >
                    Salvar e Prescrever Receita
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {recipesList.map((rec) => (
              <Card
                key={rec.id}
                className="border border-slate-200 shadow-sm bg-white flex flex-col justify-between"
              >
                <CardHeader className="pb-2 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#003366]">
                      {rec.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{rec.date}</span>
                  </div>
                  <CardTitle className="text-sm font-bold text-[#003366] mt-2">
                    {rec.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-2 text-xs text-slate-700">
                  <div>
                    <strong className="text-slate-900 block font-semibold">Ingredientes:</strong>
                    <p className="text-slate-600 leading-relaxed mt-0.5">{rec.ingredients}</p>
                  </div>
                  {rec.preparation && (
                    <div>
                      <strong className="text-slate-900 block font-semibold">
                        Modo de Preparo:
                      </strong>
                      <p className="text-slate-600 leading-relaxed mt-0.5">{rec.preparation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- ABA 5: EXAMES LABORATORIAIS ---------------- */}
      {activeTab === "exams" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#003366] flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-[#003366]" />
                Acompanhamento de Exames Laboratoriais
              </h3>
              <p className="text-xs text-slate-500">
                Exames de sangue, bioquímicos e perfil metabólico
              </p>
            </div>

            <Dialog open={openExamDialog} onOpenChange={setOpenExamDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold gap-1.5 shadow-sm">
                  <Plus className="h-4 w-4" />
                  Registrar Exame
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-[#003366]">
                    Registrar Exame Laboratorial
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddExam} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="exName" className="text-xs font-semibold text-slate-700">
                      Nome do Exame
                    </Label>
                    <Input
                      id="exName"
                      placeholder="Ex: Glicemia de Jejum, Triglicerídeos"
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="exVal" className="text-xs font-semibold text-slate-700">
                        Resultado
                      </Label>
                      <Input
                        id="exVal"
                        placeholder="89"
                        value={examValue}
                        onChange={(e) => setExamValue(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="exUnit" className="text-xs font-semibold text-slate-700">
                        Unidade
                      </Label>
                      <Input
                        id="exUnit"
                        placeholder="mg/dL"
                        value={examUnit}
                        onChange={(e) => setExamUnit(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="exRef" className="text-xs font-semibold text-slate-700">
                      Valor de Referência
                    </Label>
                    <Input
                      id="exRef"
                      placeholder="Ex: 70 a 99 mg/dL"
                      value={examReference}
                      onChange={(e) => setExamReference(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="exStat" className="text-xs font-semibold text-slate-700">
                      Status do Resultado
                    </Label>
                    <Select
                      value={examStatus}
                      onValueChange={(val) => setExamStatus(val as "Normal" | "Alterado")}
                    >
                      <SelectTrigger id="exStat">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Normal">Normal / Adequado</SelectItem>
                        <SelectItem value="Alterado">Alterado / Fora de Faixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold"
                  >
                    Salvar Exame no Prontuário
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Exame</th>
                    <th className="px-4 py-3">Resultado</th>
                    <th className="px-4 py-3">Referência</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {examsList.map((ex) => (
                    <tr key={ex.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-[#003366]">{ex.name}</td>
                      <td className="px-4 py-3 font-extrabold text-slate-900">
                        {ex.value} {ex.unit}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{ex.reference}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            ex.status === "Normal"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {ex.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{ex.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ---------------- ABA 6: ANOTAÇÕES DO NUTRICIONISTA ---------------- */}
      {activeTab === "notes" && (
        <div className="space-y-6">
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-[#003366] flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#003366]" />
                Anotações Clínicas & Diário de Evolução do Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <form onSubmit={handleSaveNotes} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    Escrever Nova Observação / Evolução de Atendimento
                  </Label>
                  <textarea
                    rows={4}
                    className="w-full rounded-md border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                    placeholder="Digite anotacões sobre a consulta, comportamento do paciente, alteração de conduta..."
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs gap-1.5 shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  Salvar Anotação no Diário
                </Button>
              </form>

              {/* Linha do Tempo de Anotações Salvas */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Histórico de Registros Clínicos
                </h4>
                {notesHistory.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#003366] flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 inline" />
                        {n.date}
                      </span>
                      <span className="text-[10px] text-slate-400">{n.author}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed pt-1">{n.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function MacroCard({ label, value }: { label: string; value: string; color?: string }) {
  return (
    <Card className="border border-slate-200 bg-white">
      <CardContent className="p-4">
        <p className="text-[11px] font-semibold text-slate-500 uppercase">{label}</p>
        <p className="mt-1 text-lg font-bold text-[#003366]">{value}</p>
      </CardContent>
    </Card>
  );
}
