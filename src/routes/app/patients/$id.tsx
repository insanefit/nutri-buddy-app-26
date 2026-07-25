import { createFileRoute, useParams } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
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
} from "@/lib/nutrition.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/app/patients/$id")({
  loader: async ({ context, params }) => {
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
  },
  head: () => ({
    meta: [
      { title: "Paciente — NutriAvalia" },
      { name: "description", content: "Diário alimentar do paciente." },
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
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: patient } = useSuspenseQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatient({ data: id }),
  });
  const { data: meals, refetch: refetchMeals } = useSuspenseQuery({
    queryKey: ["meals", id, today],
    queryFn: () => getMealsForPatient({ data: { patient_id: id, date: today } }),
  });
  const { data: foods } = useSuspenseQuery({
    queryKey: ["foods"],
    queryFn: () => getFoods({ data: undefined }),
  });

  const [date, setDate] = useState(today);
  const [mealName, setMealName] = useState("Café da manhã");
  const [selectedFood, setSelectedFood] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [open, setOpen] = useState(false);
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
      toast.success("Refeição registrada");
      setSelectedFood("");
      setQuantity("100");
      setOpen(false);
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {patient?.patient?.full_name || "Paciente"}
        </h1>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <MacroCard label="Calorias" value={`${Math.round(totals?.kcal || 0)} kcal`} />
        <MacroCard label="Proteínas" value={`${Math.round(totals?.protein || 0)} g`} />
        <MacroCard label="Carboidratos" value={`${Math.round(totals?.carbs || 0)} g`} />
        <MacroCard label="Gorduras" value={`${Math.round(totals?.fat || 0)} g`} />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Diário alimentar</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Adicionar refeição</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nova refeição</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMeal} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mealName">Refeição</Label>
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
              <div className="space-y-2">
                <Label htmlFor="food">Alimento</Label>
                <Select value={selectedFood} onValueChange={setSelectedFood}>
                  <SelectTrigger id="food">
                    <SelectValue placeholder="Selecione um alimento" />
                  </SelectTrigger>
                  <SelectContent>
                    {foods?.map((food) => (
                      <SelectItem key={food.id} value={food.id}>
                        {food.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade (g)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando..." : "Salvar refeição"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {meals && meals.length > 0 ? (
          meals.map((meal) => (
            <Card key={meal.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-medium">{meal.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(meal.meal_date), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteMeal(meal.id)}>
                  Remover
                </Button>
              </CardHeader>
              <CardContent>
                {meal.items && meal.items.length > 0 ? (
                  <ul className="space-y-2">
                    {meal.items.map((item: any) => (
                      <li key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">
                          {item.food?.name} — {item.quantity_grams}g
                        </span>
                        <span className="text-muted-foreground">
                          {Math.round(item.calculated_calories)} kcal
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum item registrado.</p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">Nenhuma refeição registrada.</p>
            <p className="mt-2 text-sm text-muted-foreground">Adicione a primeira refeição do paciente.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MacroCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
