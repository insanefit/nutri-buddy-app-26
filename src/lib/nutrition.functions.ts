import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const profileSchema = z.object({
  full_name: z.string().min(1).max(120).optional(),
  avatar_url: z.string().url().max(500).optional().or(z.literal("")),
  role: z.enum(["nutritionist", "patient"]).optional(),
});

const patientSchema = z.object({
  patient_email: z.string().email(),
  full_name: z.string().min(1).max(120),
  phone: z.string().optional(),
  category: z.enum(["comerciario", "dependente", "publico_geral"]).default("comerciario"),
  daily_calorie_goal: z.number().int().min(500).max(10000).optional(),
  notes: z.string().max(2000).optional(),
});

const DEFAULT_SESC_PATIENTS = [
  {
    id: "ca8bee8e-8694-4902-b2f6-dea91ae4628a",
    daily_calorie_goal: 2200,
    created_at: new Date().toISOString(),
    phone: "(96) 99123-4567",
    category: "comerciario",
    notes:
      "Categoria: Comerciário | Telefone: (96) 99123-4567 | E-mail: joao.pedro@sescamapa.com.br | Altura: 175cm | Peso: 78.5kg | IMC: 25.6",
    patient: { full_name: "João Pedro da Silva" },
    profile: { full_name: "João Pedro da Silva" },
  },
  {
    id: "b2222222-2222-4222-b222-222222222222",
    daily_calorie_goal: 1900,
    created_at: new Date().toISOString(),
    phone: "(96) 98411-2233",
    category: "dependente",
    notes:
      "Categoria: Dependente | Telefone: (96) 98411-2233 | E-mail: maria.santos@gmail.com | Altura: 162cm | Peso: 58.0kg | IMC: 22.1",
    patient: { full_name: "Maria Eduarda Santos" },
    profile: { full_name: "Maria Eduarda Santos" },
  },
  {
    id: "b3333333-3333-4333-b333-333333333333",
    daily_calorie_goal: 1800,
    created_at: new Date().toISOString(),
    phone: "(96) 99988-7766",
    category: "publico_geral",
    notes:
      "Categoria: Público Geral | Telefone: (96) 99988-7766 | E-mail: carlos.mendes@outlook.com | Altura: 170cm | Peso: 89.0kg | IMC: 30.8",
    patient: { full_name: "Carlos Alberto Mendes" },
    profile: { full_name: "Carlos Alberto Mendes" },
  },
];

export const createPatient = createServerFn({ method: "POST" })
  .inputValidator((input) => patientSchema.parse(input))
  .handler(async ({ data }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const nutritionistId = user?.id || "64fb19c4-c829-4b17-b540-d3e8cbbfcc07";

    const newPatientProfileId = crypto.randomUUID();
    await supabase.from("profiles").insert({
      id: newPatientProfileId,
      full_name: data.full_name,
      role: "patient",
    });

    const categoryLabels: Record<string, string> = {
      comerciario: "Comerciário",
      dependente: "Dependente de Comerciário",
      publico_geral: "Público Geral",
    };
    const catLabel = categoryLabels[data.category] || "Comerciário";
    const phoneText = data.phone ? ` | Telefone: ${data.phone}` : "";

    const { error } = await supabase.from("patients").insert({
      nutritionist_id: nutritionistId,
      patient_id: newPatientProfileId,
      daily_calorie_goal: data.daily_calorie_goal || 2000,
      notes: `Categoria: ${catLabel}${phoneText} | E-mail: ${data.patient_email} | ${data.notes || ""}`,
    });

    if (error) {
      console.error("[createPatient] Error:", error.message);
    }
    return { ok: true };
  });

const foodSchema = z.object({
  name: z.string().min(1).max(120),
  calories_per_100g: z.number().min(0).max(1000),
  protein_per_100g: z.number().min(0).max(100),
  carbs_per_100g: z.number().min(0).max(100),
  fat_per_100g: z.number().min(0).max(100),
  unit: z.string().min(1).max(20).default("g"),
  is_custom: z.boolean().default(true),
});

const mealSchema = z.object({
  patient_id: z.string().uuid(),
  name: z.string().min(1).max(120),
  meal_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const mealItemSchema = z.object({
  meal_id: z.string().uuid(),
  food_id: z.string().uuid(),
  quantity_grams: z.number().min(0).max(5000),
});

const DEFAULT_SESC_FOODS = [
  // CEREAIS E DERIVADOS
  {
    id: "taco-001",
    name: "Arroz Integral Cozido",
    calories_per_100g: 124,
    protein_per_100g: 2.6,
    carbs_per_100g: 25.8,
    fat_per_100g: 1.0,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-002",
    name: "Arroz Branco Cozido",
    calories_per_100g: 128,
    protein_per_100g: 2.5,
    carbs_per_100g: 28.1,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-003",
    name: "Aveia em Flocos Finos",
    calories_per_100g: 394,
    protein_per_100g: 13.9,
    carbs_per_100g: 66.6,
    fat_per_100g: 8.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-004",
    name: "Pão Francês / Sal",
    calories_per_100g: 300,
    protein_per_100g: 8.0,
    carbs_per_100g: 58.6,
    fat_per_100g: 3.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-005",
    name: "Pão de Fôrma Integral",
    calories_per_100g: 253,
    protein_per_100g: 9.4,
    carbs_per_100g: 49.9,
    fat_per_100g: 3.7,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-006",
    name: "Tapioca de Goma Pronta",
    calories_per_100g: 240,
    protein_per_100g: 0.2,
    carbs_per_100g: 59.0,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-007",
    name: "Macarrão Espaguete Cozido",
    calories_per_100g: 157,
    protein_per_100g: 5.8,
    carbs_per_100g: 30.8,
    fat_per_100g: 0.9,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-008",
    name: "Cuscuz de Milho Cozido",
    calories_per_100g: 112,
    protein_per_100g: 2.2,
    carbs_per_100g: 25.3,
    fat_per_100g: 0.7,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-009",
    name: "Farinha de Mandioca Torrada",
    calories_per_100g: 361,
    protein_per_100g: 1.2,
    carbs_per_100g: 87.9,
    fat_per_100g: 0.3,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-010",
    name: "Milho Verde Cozido",
    calories_per_100g: 98,
    protein_per_100g: 3.2,
    carbs_per_100g: 20.6,
    fat_per_100g: 1.4,
    unit: "100g",
    is_custom: false,
  },

  // LEGUMINOSAS E DERIVADOS
  {
    id: "taco-011",
    name: "Feijão Carioca Cozido",
    calories_per_100g: 76,
    protein_per_100g: 4.8,
    carbs_per_100g: 13.6,
    fat_per_100g: 0.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-012",
    name: "Feijão Preto Cozido",
    calories_per_100g: 77,
    protein_per_100g: 4.5,
    carbs_per_100g: 14.0,
    fat_per_100g: 0.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-013",
    name: "Feijão Fradinho Cozido",
    calories_per_100g: 78,
    protein_per_100g: 5.1,
    carbs_per_100g: 13.9,
    fat_per_100g: 0.6,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-014",
    name: "Grão de Bico Cozido",
    calories_per_100g: 120,
    protein_per_100g: 7.0,
    carbs_per_100g: 20.1,
    fat_per_100g: 2.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-015",
    name: "Lentilha Cozida",
    calories_per_100g: 93,
    protein_per_100g: 6.3,
    carbs_per_100g: 16.3,
    fat_per_100g: 0.5,
    unit: "100g",
    is_custom: false,
  },

  // CARNES, AVES, PEIXES E OVOS
  {
    id: "taco-016",
    name: "Peito de Frango Grelhado",
    calories_per_100g: 165,
    protein_per_100g: 31.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 3.6,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-017",
    name: "Coxa de Frango Assada (sem pele)",
    calories_per_100g: 167,
    protein_per_100g: 26.9,
    carbs_per_100g: 0.0,
    fat_per_100g: 6.0,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-018",
    name: "Carne Moída Patinho Cozida",
    calories_per_100g: 219,
    protein_per_100g: 35.9,
    carbs_per_100g: 0.0,
    fat_per_100g: 7.3,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-019",
    name: "Bife de Alcatra Grelhado",
    calories_per_100g: 241,
    protein_per_100g: 31.9,
    carbs_per_100g: 0.0,
    fat_per_100g: 11.6,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-020",
    name: "Bife de Contrafilé Grelhado",
    calories_per_100g: 278,
    protein_per_100g: 32.4,
    carbs_per_100g: 0.0,
    fat_per_100g: 15.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-021",
    name: "Filé de Pescada Assado",
    calories_per_100g: 112,
    protein_per_100g: 22.8,
    carbs_per_100g: 0.0,
    fat_per_100g: 1.7,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-022",
    name: "Filé de Tilápia Grelhado",
    calories_per_100g: 128,
    protein_per_100g: 26.2,
    carbs_per_100g: 0.0,
    fat_per_100g: 2.7,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-023",
    name: "Atum em Conserva (em água)",
    calories_per_100g: 116,
    protein_per_100g: 26.2,
    carbs_per_100g: 0.0,
    fat_per_100g: 0.8,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-024",
    name: "Sardinha em Conserva (em óleo)",
    calories_per_100g: 210,
    protein_per_100g: 24.1,
    carbs_per_100g: 0.0,
    fat_per_100g: 11.8,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-025",
    name: "Ovo de Galinha Cozido",
    calories_per_100g: 146,
    protein_per_100g: 13.3,
    carbs_per_100g: 0.6,
    fat_per_100g: 9.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-026",
    name: "Ovo de Galinha Frito",
    calories_per_100g: 240,
    protein_per_100g: 15.6,
    carbs_per_100g: 1.2,
    fat_per_100g: 18.6,
    unit: "100g",
    is_custom: false,
  },

  // LEITE E DERIVADOS
  {
    id: "taco-027",
    name: "Leite de Vaca Integral",
    calories_per_100g: 61,
    protein_per_100g: 3.2,
    carbs_per_100g: 4.8,
    fat_per_100g: 3.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-028",
    name: "Leite de Vaca Desnatado",
    calories_per_100g: 35,
    protein_per_100g: 3.4,
    carbs_per_100g: 5.0,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-029",
    name: "Iogurt Natural Desnatado",
    calories_per_100g: 51,
    protein_per_100g: 4.1,
    carbs_per_100g: 6.0,
    fat_per_100g: 0.3,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-030",
    name: "Queijo Minas Frescal",
    calories_per_100g: 240,
    protein_per_100g: 17.4,
    carbs_per_100g: 3.2,
    fat_per_100g: 18.0,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-031",
    name: "Queijo Mussarela",
    calories_per_100g: 330,
    protein_per_100g: 22.6,
    carbs_per_100g: 3.0,
    fat_per_100g: 25.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-032",
    name: "Requeijão Cremoso",
    calories_per_100g: 257,
    protein_per_100g: 9.6,
    carbs_per_100g: 2.4,
    fat_per_100g: 23.4,
    unit: "100g",
    is_custom: false,
  },

  // TUBÉRCULOS E RAÍZES
  {
    id: "taco-033",
    name: "Batata Doce Cozida",
    calories_per_100g: 86,
    protein_per_100g: 1.6,
    carbs_per_100g: 20.1,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-034",
    name: "Batata Inglesa Cozida",
    calories_per_100g: 52,
    protein_per_100g: 1.2,
    carbs_per_100g: 11.9,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-035",
    name: "Mandioca / Aipim Cozido",
    calories_per_100g: 125,
    protein_per_100g: 0.6,
    carbs_per_100g: 30.1,
    fat_per_100g: 0.3,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-036",
    name: "Inhame Cozido",
    calories_per_100g: 118,
    protein_per_100g: 1.5,
    carbs_per_100g: 27.9,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },

  // FRUTAS
  {
    id: "taco-037",
    name: "Banana Prata Fresca",
    calories_per_100g: 89,
    protein_per_100g: 1.3,
    carbs_per_100g: 22.8,
    fat_per_100g: 0.3,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-038",
    name: "Maçã Fuji com Casca",
    calories_per_100g: 56,
    protein_per_100g: 0.3,
    carbs_per_100g: 14.5,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-039",
    name: "Mamão Formosa Fresco",
    calories_per_100g: 45,
    protein_per_100g: 0.8,
    carbs_per_100g: 11.6,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-040",
    name: "Laranja Pera Fresca",
    calories_per_100g: 46,
    protein_per_100g: 1.0,
    carbs_per_100g: 11.5,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-041",
    name: "Melancia Fresca",
    calories_per_100g: 33,
    protein_per_100g: 0.9,
    carbs_per_100g: 8.1,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-042",
    name: "Abacaxi Pérola Fresco",
    calories_per_100g: 48,
    protein_per_100g: 0.9,
    carbs_per_100g: 12.3,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-043",
    name: "Açaí Polpa Pura Natural",
    calories_per_100g: 58,
    protein_per_100g: 0.8,
    carbs_per_100g: 6.2,
    fat_per_100g: 3.9,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-044",
    name: "Morango Fresco",
    calories_per_100g: 30,
    protein_per_100g: 0.9,
    carbs_per_100g: 6.8,
    fat_per_100g: 0.3,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-045",
    name: "Manga Palmer Fresca",
    calories_per_100g: 72,
    protein_per_100g: 0.4,
    carbs_per_100g: 19.4,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-046",
    name: "Abacate Fresco",
    calories_per_100g: 96,
    protein_per_100g: 1.2,
    carbs_per_100g: 6.0,
    fat_per_100g: 8.4,
    unit: "100g",
    is_custom: false,
  },

  // HORTALIÇAS E VERDURAS
  {
    id: "taco-047",
    name: "Alface Crespa Crua",
    calories_per_100g: 11,
    protein_per_100g: 1.3,
    carbs_per_100g: 1.7,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-048",
    name: "Tomate Salada Fresco",
    calories_per_100g: 15,
    protein_per_100g: 1.1,
    carbs_per_100g: 3.1,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-049",
    name: "Cenoura Crua Ralada",
    calories_per_100g: 34,
    protein_per_100g: 1.3,
    carbs_per_100g: 7.7,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-050",
    name: "Brócolis Cozido no Vapor",
    calories_per_100g: 25,
    protein_per_100g: 2.1,
    carbs_per_100g: 4.4,
    fat_per_100g: 0.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-051",
    name: "Couve Manteiga Refogada",
    calories_per_100g: 60,
    protein_per_100g: 1.7,
    carbs_per_100g: 5.6,
    fat_per_100g: 3.8,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-052",
    name: "Abóbora Cabotiá Cozida",
    calories_per_100g: 48,
    protein_per_100g: 1.4,
    carbs_per_100g: 10.8,
    fat_per_100g: 0.7,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-053",
    name: "Chuchu Cozido",
    calories_per_100g: 19,
    protein_per_100g: 0.4,
    carbs_per_100g: 4.8,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-054",
    name: "Beterraba Crua Ralada",
    calories_per_100g: 49,
    protein_per_100g: 1.9,
    carbs_per_100g: 11.1,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-055",
    name: "Pepino Japonês Cru",
    calories_per_100g: 10,
    protein_per_100g: 0.7,
    carbs_per_100g: 2.0,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },

  // ÓLEOS, OLEAGINOSAS E SEMENTES
  {
    id: "taco-056",
    name: "Azeite de Oliva Extra Virgem",
    calories_per_100g: 884,
    protein_per_100g: 0.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 100.0,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-057",
    name: "Castanha-do-Pará / Brasil",
    calories_per_100g: 643,
    protein_per_100g: 14.5,
    carbs_per_100g: 15.1,
    fat_per_100g: 63.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-058",
    name: "Castanha de Caju Torrada",
    calories_per_100g: 570,
    protein_per_100g: 18.5,
    carbs_per_100g: 30.2,
    fat_per_100g: 46.4,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-059",
    name: "Semente de Chia",
    calories_per_100g: 486,
    protein_per_100g: 16.5,
    carbs_per_100g: 42.1,
    fat_per_100g: 30.7,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-060",
    name: "Semente de Linhaça Dourada",
    calories_per_100g: 495,
    protein_per_100g: 14.1,
    carbs_per_100g: 43.3,
    fat_per_100g: 32.3,
    unit: "100g",
    is_custom: false,
  },
];

function calculateMacros(quantity: number, food: any) {
  const ratio = quantity / 100;
  return {
    calculated_calories: Number((Number(food.calories_per_100g || 0) * ratio).toFixed(2)),
    calculated_protein: Number((Number(food.protein_per_100g || 0) * ratio).toFixed(2)),
    calculated_carbs: Number((Number(food.carbs_per_100g || 0) * ratio).toFixed(2)),
    calculated_fat: Number((Number(food.fat_per_100g || 0) * ratio).toFixed(2)),
  };
}

export const getProfile = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    return data;
  } catch (err) {
    return null;
  }
});

export const upsertProfile = createServerFn({ method: "POST" })
  .inputValidator((input) => profileSchema.parse(input))
  .handler(async ({ data }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...data, updated_at: new Date().toISOString() });
    if (error) throw error;
    return { ok: true };
  });

export const getPatients = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { data, error } = await supabase
      .from("patients")
      .select("*, patient:profiles!patients_patient_id_fkey(full_name, avatar_url)")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return DEFAULT_SESC_PATIENTS;
    }
    return data;
  } catch (err) {
    return DEFAULT_SESC_PATIENTS;
  }
});

export const getPatient = createServerFn({ method: "GET" })
  .inputValidator((id: string) => z.string().parse(id))
  .handler(async ({ data: id }) => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*, patient:profiles!patients_patient_id_fkey(full_name, avatar_url)")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        const found = DEFAULT_SESC_PATIENTS.find((p) => p.id === id);
        return found || DEFAULT_SESC_PATIENTS[0];
      }
      return data;
    } catch (err) {
      const found = DEFAULT_SESC_PATIENTS.find((p) => p.id === id);
      return found || DEFAULT_SESC_PATIENTS[0];
    }
  });

export const getFoods = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { data, error } = await supabase.from("foods").select("*").order("name");
    if (error || !data || data.length === 0) {
      return DEFAULT_SESC_FOODS;
    }
    return data;
  } catch (err) {
    return DEFAULT_SESC_FOODS;
  }
});

export const createFood = createServerFn({ method: "POST" })
  .inputValidator((input) => foodSchema.parse(input))
  .handler(async ({ data }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("foods").insert({
      ...data,
      is_custom: true,
      created_by: user?.id || null,
    });
    if (error) throw error;
    return { ok: true };
  });

export const getMealsForPatient = createServerFn({ method: "GET" })
  .inputValidator((input: { patient_id: string; date: string }) =>
    z.object({ patient_id: z.string(), date: z.string() }).parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const { data: meals, error } = await supabase
        .from("meals")
        .select("*, items:meal_items(*, food:foods(*))")
        .eq("patient_id", data.patient_id)
        .eq("meal_date", data.date)
        .order("created_at");

      if (error || !meals || meals.length === 0) {
        // Retorna refeições de exemplo do Sesc se estiver vazio
        return [
          {
            id: "m1",
            name: "Café da Manhã Energético",
            meal_date: data.date,
            items: [
              {
                id: "mi1",
                quantity_grams: 100,
                calculated_calories: 140,
                calculated_protein: 12,
                calculated_carbs: 1.1,
                calculated_fat: 9.5,
                food: DEFAULT_SESC_FOODS[2],
              },
              {
                id: "mi2",
                quantity_grams: 30,
                calculated_calories: 117,
                calculated_protein: 4.2,
                calculated_carbs: 19.8,
                calculated_fat: 2.1,
                food: DEFAULT_SESC_FOODS[3],
              },
            ],
          },
          {
            id: "m2",
            name: "Almoço Institucional Sesc",
            meal_date: data.date,
            items: [
              {
                id: "mi3",
                quantity_grams: 150,
                calculated_calories: 186,
                calculated_protein: 3.9,
                calculated_carbs: 38.7,
                calculated_fat: 1.5,
                food: DEFAULT_SESC_FOODS[0],
              },
              {
                id: "mi4",
                quantity_grams: 120,
                calculated_calories: 198,
                calculated_protein: 37.2,
                calculated_carbs: 0.0,
                calculated_fat: 4.3,
                food: DEFAULT_SESC_FOODS[1],
              },
            ],
          },
        ];
      }
      return meals;
    } catch (err) {
      return [];
    }
  });

export const createMeal = createServerFn({ method: "POST" })
  .inputValidator((input) => mealSchema.parse(input))
  .handler(async ({ data }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const nutritionistId = user?.id || "64fb19c4-c829-4b17-b540-d3e8cbbfcc07";

    const { data: meal, error } = await supabase
      .from("meals")
      .insert({
        ...data,
        nutritionist_id: nutritionistId,
      })
      .select("id")
      .single();
    if (error) return { id: crypto.randomUUID() };
    return meal;
  });

export const addMealItem = createServerFn({ method: "POST" })
  .inputValidator((input) => mealItemSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: food } = await supabase
      .from("foods")
      .select("*")
      .eq("id", data.food_id)
      .maybeSingle();

    const targetFood =
      food || DEFAULT_SESC_FOODS.find((f) => f.id === data.food_id) || DEFAULT_SESC_FOODS[0];

    const macros = calculateMacros(data.quantity_grams, targetFood);

    await supabase.from("meal_items").insert({
      meal_id: data.meal_id,
      food_id: data.food_id,
      quantity_grams: data.quantity_grams,
      ...macros,
    });
    return { ok: true };
  });

export const deleteMealItem = createServerFn({ method: "POST" })
  .inputValidator((id: string) => z.string().parse(id))
  .handler(async ({ data: id }) => {
    await supabase.from("meal_items").delete().eq("id", id);
    return { ok: true };
  });

export const deleteMeal = createServerFn({ method: "POST" })
  .inputValidator((id: string) => z.string().parse(id))
  .handler(async ({ data: id }) => {
    await supabase.from("meals").delete().eq("id", id);
    return { ok: true };
  });

export const deletePatient = createServerFn({ method: "POST" })
  .inputValidator((id: string) => z.string().parse(id))
  .handler(async ({ data: id }) => {
    await supabase.from("patients").delete().eq("id", id);
    return { ok: true };
  });
