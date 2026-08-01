import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getFoods, createFood } from "@/lib/nutrition.functions";
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
import { toast } from "sonner";

import { Plus, Search, Utensils, Database } from "lucide-react";

export const Route = createFileRoute("/app/foods")({
  head: () => ({
    meta: [
      { title: "Tabela de Alimentos TACO — Saúde Nutricional Sesc" },
      { name: "description", content: "Banco de alimentos e composição nutricional Sesc." },
    ],
  }),
  component: FoodsPage,
});

function FoodsPage() {
  const { data: foods, refetch } = useQuery({
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

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredFoods = foods?.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
      toast.success("Alimento cadastrado no banco Sesc!");
      setName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setOpen(false);
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao cadastrar alimento";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Cabeçalho de Alimentos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#003366]">Tabela de Alimentos TACO</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-[#003366]">
              {foods?.length || 0} alimentos
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Banco de dados nutricional oficial para composição de refeições e prescrições
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#003366] hover:bg-[#002244] text-white font-bold gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              Novo Alimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-[#003366]">
                Cadastrar Alimento na Tabela Sesc
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                  Nome do Alimento
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Arroz Integral Cozido"
                  required
                />
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Composição por 100g de alimento:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="calories" className="text-xs font-semibold text-slate-700">
                    Calorias (kcal)
                  </Label>
                  <Input
                    id="calories"
                    type="number"
                    min={0}
                    step={0.1}
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="protein" className="text-xs font-semibold text-slate-700">
                    Proteína (g)
                  </Label>
                  <Input
                    id="protein"
                    type="number"
                    min={0}
                    step={0.1}
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="carbs" className="text-xs font-semibold text-slate-700">
                    Carboidratos (g)
                  </Label>
                  <Input
                    id="carbs"
                    type="number"
                    min={0}
                    step={0.1}
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fat" className="text-xs font-semibold text-slate-700">
                    Gorduras (g)
                  </Label>
                  <Input
                    id="fat"
                    type="number"
                    min={0}
                    step={0.1}
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold"
                disabled={loading}
              >
                {loading ? "Salvando..." : "Salvar Alimento"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campo de Pesquisa em Tempo Real */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar alimento por nome (ex: Frango, Arroz, Feijão, Banana...)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 text-xs bg-white border-slate-200 shadow-xs focus:ring-1 focus:ring-[#003366]"
        />
      </div>

      {/* Grid de Cards de Alimentos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredFoods?.map((food) => (
          <Card
            key={food.id}
            className="border border-slate-200 hover:border-[#003366] hover:shadow-md transition-all bg-white"
          >
            <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-[#003366]">{food.name}</CardTitle>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Porção de 100g
                </span>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 text-[#003366]">
                <Utensils className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="grid grid-cols-4 gap-1 text-center bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                <div className="border-r border-slate-200 pr-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Kcal</span>
                  <p className="text-xs font-extrabold text-[#003366]">{food.calories_per_100g}</p>
                </div>
                <div className="border-r border-slate-200 pr-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Prot</span>
                  <p className="text-xs font-extrabold text-emerald-700">
                    {food.protein_per_100g}g
                  </p>
                </div>
                <div className="border-r border-slate-200 pr-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Carb</span>
                  <p className="text-xs font-extrabold text-amber-700">{food.carbs_per_100g}g</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Gord</span>
                  <p className="text-xs font-extrabold text-rose-700">{food.fat_per_100g}g</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!filteredFoods || filteredFoods.length === 0) && (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-12 text-center bg-white">
          <Database className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">
            Nenhum alimento encontrado para "{searchTerm}".
          </p>
        </div>
      )}
    </div>
  );
}
