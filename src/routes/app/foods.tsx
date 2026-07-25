import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getFoods, createFood } from "@/lib/nutrition.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/app/foods")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["foods"],
      queryFn: () => getFoods({ data: undefined }),
    });
  },
  head: () => ({
    meta: [
      { title: "Alimentos — NutriAvalia" },
      { name: "description", content: "Banco de alimentos do NutriAvalia." },
    ],
  }),
  component: FoodsPage,
});

function FoodsPage() {
  const { data: foods, refetch } = useSuspenseQuery({
    queryKey: ["foods"],
    queryFn: () => getFoods({ data: undefined }),
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createFood({
        data: {
          name,
          calories_per_100g: Number(calories),
          protein_per_100g: Number(protein),
          carbs_per_100g: Number(carbs),
          fat_per_100g: Number(fat),
        },
      });
      toast.success("Alimento cadastrado");
      setName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar alimento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Alimentos</h1>
          <p className="mt-1 text-muted-foreground">Banco de alimentos para montar diários</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Novo alimento</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar alimento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Arroz branco cozido" required />
              </div>
              <p className="text-xs text-muted-foreground">Valores nutricionais por 100g</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">Kcal</Label>
                  <Input id="calories" type="number" min={0} step={0.1} value={calories} onChange={(e) => setCalories(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein">Proteína (g)</Label>
                  <Input id="protein" type="number" min={0} step={0.1} value={protein} onChange={(e) => setProtein(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbo (g)</Label>
                  <Input id="carbs" type="number" min={0} step={0.1} value={carbs} onChange={(e) => setCarbs(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat">Gordura (g)</Label>
                  <Input id="fat" type="number" min={0} step={0.1} value={fat} onChange={(e) => setFat(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando..." : "Salvar alimento"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {foods?.map((food) => (
          <Card key={food.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">{food.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Por 100g</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Kcal</span>
                  <p className="font-medium text-foreground">{food.calories_per_100g}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Proteína</span>
                  <p className="font-medium text-foreground">{food.protein_per_100g}g</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Carbo</span>
                  <p className="font-medium text-foreground">{food.carbs_per_100g}g</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Gordura</span>
                  <p className="font-medium text-foreground">{food.fat_per_100g}g</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!foods || foods.length === 0) && (
        <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">Nenhum alimento cadastrado.</p>
        </div>
      )}
    </div>
  );
}
