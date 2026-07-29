import { createClient } from "@/platform/supabase/server";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Tabela de Alimentos — Saúde Nutricional Sesc",
  description: "Consulta e cadastro de alimentos e composição nutricional por 100g",
};

async function addCustomFoodAction(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const calories = parseFloat(formData.get("calories") as string || "0");
  const protein = parseFloat(formData.get("protein") as string || "0");
  const carbs = parseFloat(formData.get("carbs") as string || "0");
  const fat = parseFloat(formData.get("fat") as string || "0");

  if (!name || name.trim().length === 0) {
    return;
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) return;

  await supabase.from("foods").insert({
    name: name.trim(),
    calories_per_100g: calories,
    protein_per_100g: protein,
    carbs_per_100g: carbs,
    fat_per_100g: fat,
    is_custom: true,
    created_by: userData.user.id,
  });

  revalidatePath("/alimentos");
}

export default async function AlimentosPage() {
  const supabase = await createClient();
  const { data: foods } = await supabase
    .from("foods")
    .select("*")
    .order("name", { ascending: true });

  const foodList = foods || [];

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header Institucional */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-[#003366]">
          Composição Nutricional de Alimentos
        </h1>
        <p className="text-sm text-slate-600">
          Base de dados oficial de alimentos e tabela nutricional para prescrição clínica Sesc.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulário Novo Alimento Customizado */}
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 h-fit space-y-4">
          <h2 className="text-lg font-semibold text-[#003366] flex items-center gap-2">
            <span>+</span> Adicionar Alimento Customizado
          </h2>
          <form action={addCustomFoodAction} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nome do Alimento *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Ex: Quinoa cozida"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-[#003366] outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Calorias (kcal/100g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="calories"
                  defaultValue="0"
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-[#003366] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Proteínas (g/100g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="protein"
                  defaultValue="0"
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-[#003366] outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Carboidratos (g/100g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="carbs"
                  defaultValue="0"
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-[#003366] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Gorduras (g/100g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="fat"
                  defaultValue="0"
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-[#003366] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#003366] hover:bg-[#002244] text-white text-sm font-medium rounded transition-colors shadow-sm"
            >
              Salvar Alimento
            </button>
          </form>
        </div>

        {/* Tabela de Alimentos */}
        <div className="md:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-800">
              Alimentos Cadastrados ({foodList.length})
            </span>
            <span className="text-xs bg-[#FFCC00] text-slate-900 font-bold px-2 py-0.5 rounded">
              Base por 100g
            </span>
          </div>

          <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-semibold">Alimento</th>
                  <th className="p-3 font-semibold text-right">Calorias (kcal)</th>
                  <th className="p-3 font-semibold text-right">Prot. (g)</th>
                  <th className="p-3 font-semibold text-right">Carb. (g)</th>
                  <th className="p-3 font-semibold text-right">Gord. (g)</th>
                  <th className="p-3 font-semibold text-center">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {foodList.map((food) => (
                  <tr key={food.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-medium text-slate-900">{food.name}</td>
                    <td className="p-3 text-right font-mono">{food.calories_per_100g}</td>
                    <td className="p-3 text-right font-mono text-emerald-700 font-medium">
                      {food.protein_per_100g}
                    </td>
                    <td className="p-3 text-right font-mono text-amber-700 font-medium">
                      {food.carbs_per_100g}
                    </td>
                    <td className="p-3 text-right font-mono text-rose-700 font-medium">
                      {food.fat_per_100g}
                    </td>
                    <td className="p-3 text-center">
                      {food.is_custom ? (
                        <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-semibold">
                          Customizado
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          Padrão Sesc
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
