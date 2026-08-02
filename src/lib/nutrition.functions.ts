import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const profileSchema = z.object({
  full_name: z.string().min(1).max(120).optional(),
  avatar_url: z.string().url().max(500).optional().or(z.literal("")),
});

const patientSchema = z.object({
  patient_email: z.string().email(),
  full_name: z.string().min(1).max(120),
  phone: z.string().optional(),
  category: z.enum(["comerciario", "dependente", "publico_geral"]).default("comerciario"),
  daily_calorie_goal: z.number().int().min(500).max(10000).optional(),
  notes: z.string().max(2000).optional(),
  lgpd_consent: z.boolean().refine((val) => val === true, {
    message: "É obrigatório aceitar o termo LGPD para cadastrar o paciente.",
  }),
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

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

async function requireNutritionistUser(context: { supabase: SupabaseClient<Database> }) {
  const {
    data: { user },
    error: userErr,
  } = await context.supabase.auth.getUser();

  if (userErr || !user) {
    throw new Error("Unauthorized: Usuário não autenticado.");
  }

  const { data: profile, error: profileErr } = await context.supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileErr || !profile || profile.role !== "nutritionist") {
    throw new Error("Forbidden: Acesso restrito a nutricionistas credenciados.");
  }

  return user;
}

export const createPatient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => patientSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireNutritionistUser(context);

    // Invocação da RPC transacional atômica
    const { data: insertedPatient, error } = await context.supabase.rpc(
      "create_patient_with_consent",
      {
        p_full_name: data.full_name,
        p_email: data.patient_email || null,
        p_phone: data.phone || null,
        p_category: data.category || "comerciario",
        p_daily_calorie_goal: data.daily_calorie_goal || 2000,
        p_notes: data.notes || "",
        p_lgpd_consent: data.lgpd_consent,
      },
    );

    if (error || !insertedPatient) {
      console.error("[createPatient] Transação RPC falhou:", error?.message);
      throw new Error(`Falha ao cadastrar paciente (Transação LGPD): ${error?.message}`);
    }

    return insertedPatient;
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
    name: "Arroz Parboilizado Cozido",
    calories_per_100g: 123,
    protein_per_100g: 2.5,
    carbs_per_100g: 26.5,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-004",
    name: "Aveia em Flocos Finos",
    calories_per_100g: 394,
    protein_per_100g: 13.9,
    carbs_per_100g: 66.6,
    fat_per_100g: 8.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-005",
    name: "Farinha de Aveia",
    calories_per_100g: 388,
    protein_per_100g: 14.5,
    carbs_per_100g: 64.0,
    fat_per_100g: 7.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-006",
    name: "Pão Francês / Sal",
    calories_per_100g: 300,
    protein_per_100g: 8.0,
    carbs_per_100g: 58.6,
    fat_per_100g: 3.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-007",
    name: "Pão de Fôrma Integral",
    calories_per_100g: 253,
    protein_per_100g: 9.4,
    carbs_per_100g: 49.9,
    fat_per_100g: 3.7,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-008",
    name: "Pão de Fôrma Tradicional",
    calories_per_100g: 274,
    protein_per_100g: 8.4,
    carbs_per_100g: 52.3,
    fat_per_100g: 3.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-009",
    name: "Tapioca de Goma Pronta",
    calories_per_100g: 240,
    protein_per_100g: 0.2,
    carbs_per_100g: 59.0,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-010",
    name: "Macarrão Espaguete Cozido",
    calories_per_100g: 157,
    protein_per_100g: 5.8,
    carbs_per_100g: 30.8,
    fat_per_100g: 0.9,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-011",
    name: "Macarrão Integral Cozido",
    calories_per_100g: 124,
    protein_per_100g: 5.3,
    carbs_per_100g: 26.5,
    fat_per_100g: 0.6,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-012",
    name: "Cuscuz de Milho Cozido",
    calories_per_100g: 112,
    protein_per_100g: 2.2,
    carbs_per_100g: 25.3,
    fat_per_100g: 0.7,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-013",
    name: "Milho Verde Cozido",
    calories_per_100g: 98,
    protein_per_100g: 3.2,
    carbs_per_100g: 20.6,
    fat_per_100g: 1.4,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-014",
    name: "Farinha de Mandioca Torrada",
    calories_per_100g: 361,
    protein_per_100g: 1.2,
    carbs_per_100g: 87.9,
    fat_per_100g: 0.3,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-015",
    name: "Farinha de Milho Amarela",
    calories_per_100g: 361,
    protein_per_100g: 7.2,
    carbs_per_100g: 78.7,
    fat_per_100g: 1.7,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-016",
    name: "Farinha de Trigo Tradicional",
    calories_per_100g: 360,
    protein_per_100g: 9.8,
    carbs_per_100g: 75.1,
    fat_per_100g: 1.4,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-017",
    name: "Biscoito Cream Cracker",
    calories_per_100g: 442,
    protein_per_100g: 10.1,
    carbs_per_100g: 68.7,
    fat_per_100g: 14.4,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-018",
    name: "Biscoito Doce Maisena",
    calories_per_100g: 443,
    protein_per_100g: 8.1,
    carbs_per_100g: 75.2,
    fat_per_100g: 12.0,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-019",
    name: "Torrada Integral",
    calories_per_100g: 375,
    protein_per_100g: 12.0,
    carbs_per_100g: 72.0,
    fat_per_100g: 4.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-020",
    name: "Pipoca de Milho sem Óleo",
    calories_per_100g: 387,
    protein_per_100g: 12.9,
    carbs_per_100g: 77.9,
    fat_per_100g: 4.5,
    unit: "100g",
    is_custom: false,
  },
  // LEGUMINOSAS E DERIVADOS
  {
    id: "taco-021",
    name: "Feijão Carioca Cozido",
    calories_per_100g: 76,
    protein_per_100g: 4.8,
    carbs_per_100g: 13.6,
    fat_per_100g: 0.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-022",
    name: "Feijão Preto Cozido",
    calories_per_100g: 77,
    protein_per_100g: 4.5,
    carbs_per_100g: 14.0,
    fat_per_100g: 0.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-023",
    name: "Feijão Fradinho Cozido",
    calories_per_100g: 78,
    protein_per_100g: 5.1,
    carbs_per_100g: 13.9,
    fat_per_100g: 0.6,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-024",
    name: "Feijão Branco Cozido",
    calories_per_100g: 84,
    protein_per_100g: 6.0,
    carbs_per_100g: 15.1,
    fat_per_100g: 0.4,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-025",
    name: "Feijão de Corda Cozido",
    calories_per_100g: 76,
    protein_per_100g: 5.0,
    carbs_per_100g: 13.5,
    fat_per_100g: 0.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-026",
    name: "Grão-de-Bico Cozido",
    calories_per_100g: 120,
    protein_per_100g: 7.0,
    carbs_per_100g: 20.1,
    fat_per_100g: 2.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-027",
    name: "Lentilha Cozida",
    calories_per_100g: 93,
    protein_per_100g: 6.3,
    carbs_per_100g: 16.3,
    fat_per_100g: 0.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-028",
    name: "Soja Cozida em Grão",
    calories_per_100g: 173,
    protein_per_100g: 16.6,
    carbs_per_100g: 9.9,
    fat_per_100g: 9.0,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-029",
    name: "Ervilha Fresca Cozida",
    calories_per_100g: 81,
    protein_per_100g: 5.4,
    carbs_per_100g: 14.5,
    fat_per_100g: 0.4,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-030",
    name: "Tofu / Queijo de Soja",
    calories_per_100g: 76,
    protein_per_100g: 8.1,
    carbs_per_100g: 1.9,
    fat_per_100g: 4.8,
    unit: "100g",
    is_custom: false,
  },
  // TUBÉRCULOS E RAÍZES
  {
    id: "taco-031",
    name: "Batata Doce Cozida",
    calories_per_100g: 86,
    protein_per_100g: 1.6,
    carbs_per_100g: 20.1,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-032",
    name: "Batata Inglesa Cozida",
    calories_per_100g: 52,
    protein_per_100g: 1.2,
    carbs_per_100g: 11.9,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-033",
    name: "Batata Inglesa Assada",
    calories_per_100g: 85,
    protein_per_100g: 2.1,
    carbs_per_100g: 19.6,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-034",
    name: "Batata Baroa / Mandioquinha Cozida",
    calories_per_100g: 80,
    protein_per_100g: 0.9,
    carbs_per_100g: 18.9,
    fat_per_100g: 0.2,
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
  {
    id: "taco-037",
    name: "Cará Cozido",
    calories_per_100g: 115,
    protein_per_100g: 1.4,
    carbs_per_100g: 27.2,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-038",
    name: "Polvilho Doce",
    calories_per_100g: 349,
    protein_per_100g: 0.4,
    carbs_per_100g: 86.4,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-039",
    name: "Polvilho Azedo",
    calories_per_100g: 351,
    protein_per_100g: 0.4,
    carbs_per_100g: 86.8,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  // CARNES E AVES
  {
    id: "taco-040",
    name: "Peito de Frango Grelhado",
    calories_per_100g: 165,
    protein_per_100g: 31.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 3.6,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-041",
    name: "Peito de Frango Cozido Desfiado",
    calories_per_100g: 163,
    protein_per_100g: 31.5,
    carbs_per_100g: 0.0,
    fat_per_100g: 3.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-042",
    name: "Coxa de Frango Assada (sem pele)",
    calories_per_100g: 167,
    protein_per_100g: 26.9,
    carbs_per_100g: 0.0,
    fat_per_100g: 6.0,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-043",
    name: "Sobrecoxa de Frango Assada (sem pele)",
    calories_per_100g: 184,
    protein_per_100g: 25.1,
    carbs_per_100g: 0.0,
    fat_per_100g: 8.7,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-044",
    name: "Carne Moída Patinho Cozida",
    calories_per_100g: 219,
    protein_per_100g: 35.9,
    carbs_per_100g: 0.0,
    fat_per_100g: 7.3,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-045",
    name: "Bife de Alcatra Grelhado",
    calories_per_100g: 241,
    protein_per_100g: 31.9,
    carbs_per_100g: 0.0,
    fat_per_100g: 11.6,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-046",
    name: "Bife de Contrafilé Grelhado",
    calories_per_100g: 278,
    protein_per_100g: 32.4,
    carbs_per_100g: 0.0,
    fat_per_100g: 15.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-047",
    name: "Filet Mignon Grelhado",
    calories_per_100g: 220,
    protein_per_100g: 32.8,
    carbs_per_100g: 0.0,
    fat_per_100g: 8.8,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-048",
    name: "Bife de Maminha Grelhado",
    calories_per_100g: 235,
    protein_per_100g: 30.5,
    carbs_per_100g: 0.0,
    fat_per_100g: 11.8,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-049",
    name: "Acém Bovino Cozido",
    calories_per_100g: 215,
    protein_per_100g: 27.3,
    carbs_per_100g: 0.0,
    fat_per_100g: 10.9,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-050",
    name: "Coxão Mole Bovino Cozido",
    calories_per_100g: 219,
    protein_per_100g: 32.4,
    carbs_per_100g: 0.0,
    fat_per_100g: 8.9,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-051",
    name: "Carne de Sol Bovina Cozida",
    calories_per_100g: 248,
    protein_per_100g: 31.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 12.8,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-052",
    name: "Pernil Suíno Assado",
    calories_per_100g: 262,
    protein_per_100g: 29.8,
    carbs_per_100g: 0.0,
    fat_per_100g: 14.8,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-053",
    name: "Lombo Suíno Assado",
    calories_per_100g: 210,
    protein_per_100g: 35.7,
    carbs_per_100g: 0.0,
    fat_per_100g: 6.4,
    unit: "100g",
    is_custom: false,
  },
  // PEIXES E FRUTOS DO MAR
  {
    id: "taco-054",
    name: "Filé de Pescada Assado",
    calories_per_100g: 112,
    protein_per_100g: 22.8,
    carbs_per_100g: 0.0,
    fat_per_100g: 1.7,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-055",
    name: "Filé de Tilápia Grelhado",
    calories_per_100g: 128,
    protein_per_100g: 26.2,
    carbs_per_100g: 0.0,
    fat_per_100g: 2.7,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-056",
    name: "Atum em Conserva (em água)",
    calories_per_100g: 116,
    protein_per_100g: 26.2,
    carbs_per_100g: 0.0,
    fat_per_100g: 0.8,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-057",
    name: "Sardinha em Conserva (em óleo)",
    calories_per_100g: 210,
    protein_per_100g: 24.1,
    carbs_per_100g: 0.0,
    fat_per_100g: 11.8,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-058",
    name: "Salmão Grelhado",
    calories_per_100g: 229,
    protein_per_100g: 23.9,
    carbs_per_100g: 0.0,
    fat_per_100g: 14.0,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-059",
    name: "Camarão Cozido no Vapor",
    calories_per_100g: 91,
    protein_per_100g: 19.0,
    carbs_per_100g: 0.2,
    fat_per_100g: 1.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-060",
    name: "Bacalhau Dessalgado Cozido",
    calories_per_100g: 97,
    protein_per_100g: 22.5,
    carbs_per_100g: 0.0,
    fat_per_100g: 0.4,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-061",
    name: "Tambaqui Assado",
    calories_per_100g: 160,
    protein_per_100g: 17.5,
    carbs_per_100g: 0.0,
    fat_per_100g: 9.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-062",
    name: "Pirarucu Cozido / Grelhado",
    calories_per_100g: 135,
    protein_per_100g: 21.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 5.0,
    unit: "100g",
    is_custom: false,
  },
  // OVOS
  {
    id: "taco-063",
    name: "Ovo de Galinha Cozido",
    calories_per_100g: 146,
    protein_per_100g: 13.3,
    carbs_per_100g: 0.6,
    fat_per_100g: 9.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-064",
    name: "Ovo de Galinha Frito",
    calories_per_100g: 240,
    protein_per_100g: 15.6,
    carbs_per_100g: 1.2,
    fat_per_100g: 18.6,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-065",
    name: "Omelete Simples",
    calories_per_100g: 170,
    protein_per_100g: 11.5,
    carbs_per_100g: 0.8,
    fat_per_100g: 13.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-066",
    name: "Ovo de Codorna Cozido",
    calories_per_100g: 158,
    protein_per_100g: 13.1,
    carbs_per_100g: 0.4,
    fat_per_100g: 11.1,
    unit: "100g",
    is_custom: false,
  },
  // LEITE E DERIVADOS
  {
    id: "taco-067",
    name: "Leite de Vaca Integral",
    calories_per_100g: 61,
    protein_per_100g: 3.2,
    carbs_per_100g: 4.8,
    fat_per_100g: 3.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-068",
    name: "Leite de Vaca Desnatado",
    calories_per_100g: 35,
    protein_per_100g: 3.4,
    carbs_per_100g: 5.0,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-069",
    name: "Leite de Vaca Semidesnatado",
    calories_per_100g: 45,
    protein_per_100g: 3.3,
    carbs_per_100g: 4.9,
    fat_per_100g: 1.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-070",
    name: "Leite em Pó Integral",
    calories_per_100g: 497,
    protein_per_100g: 25.5,
    carbs_per_100g: 39.2,
    fat_per_100g: 26.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-071",
    name: "Iogurte Natural Desnatado",
    calories_per_100g: 51,
    protein_per_100g: 4.1,
    carbs_per_100g: 6.0,
    fat_per_100g: 0.3,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-072",
    name: "Iogurte Natural Integral",
    calories_per_100g: 66,
    protein_per_100g: 3.6,
    carbs_per_100g: 5.3,
    fat_per_100g: 3.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-073",
    name: "Queijo Minas Frescal",
    calories_per_100g: 240,
    protein_per_100g: 17.4,
    carbs_per_100g: 3.2,
    fat_per_100g: 18.0,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-074",
    name: "Queijo Mussarela",
    calories_per_100g: 330,
    protein_per_100g: 22.6,
    carbs_per_100g: 3.0,
    fat_per_100g: 25.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-075",
    name: "Queijo Prato",
    calories_per_100g: 360,
    protein_per_100g: 22.7,
    carbs_per_100g: 1.9,
    fat_per_100g: 29.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-076",
    name: "Queijo Ricota",
    calories_per_100g: 140,
    protein_per_100g: 12.6,
    carbs_per_100g: 3.8,
    fat_per_100g: 8.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-077",
    name: "Queijo Cottage",
    calories_per_100g: 98,
    protein_per_100g: 11.1,
    carbs_per_100g: 3.4,
    fat_per_100g: 4.3,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-078",
    name: "Requeijão Cremoso Tradicional",
    calories_per_100g: 257,
    protein_per_100g: 9.6,
    carbs_per_100g: 2.4,
    fat_per_100g: 23.4,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-079",
    name: "Requeijão Light",
    calories_per_100g: 172,
    protein_per_100g: 11.2,
    carbs_per_100g: 4.5,
    fat_per_100g: 12.0,
    unit: "100g",
    is_custom: false,
  },
  // FRUTAS
  {
    id: "taco-080",
    name: "Banana Prata Fresca",
    calories_per_100g: 89,
    protein_per_100g: 1.3,
    carbs_per_100g: 22.8,
    fat_per_100g: 0.3,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-081",
    name: "Banana Nanica / Caturra",
    calories_per_100g: 92,
    protein_per_100g: 1.4,
    carbs_per_100g: 23.8,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-082",
    name: "Maçã Fuji com Casca",
    calories_per_100g: 56,
    protein_per_100g: 0.3,
    carbs_per_100g: 14.5,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-083",
    name: "Maçã Gala com Casca",
    calories_per_100g: 55,
    protein_per_100g: 0.2,
    carbs_per_100g: 14.2,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-084",
    name: "Mamão Formosa Fresco",
    calories_per_100g: 45,
    protein_per_100g: 0.8,
    carbs_per_100g: 11.6,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-085",
    name: "Mamão Papaia Fresco",
    calories_per_100g: 40,
    protein_per_100g: 0.5,
    carbs_per_100g: 10.4,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-086",
    name: "Laranja Pera Fresca",
    calories_per_100g: 46,
    protein_per_100g: 1.0,
    carbs_per_100g: 11.5,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-087",
    name: "Melancia Fresca",
    calories_per_100g: 33,
    protein_per_100g: 0.9,
    carbs_per_100g: 8.1,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-088",
    name: "Abacaxi Pérola Fresco",
    calories_per_100g: 48,
    protein_per_100g: 0.9,
    carbs_per_100g: 12.3,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-089",
    name: "Açaí Polpa Pura Natural",
    calories_per_100g: 58,
    protein_per_100g: 0.8,
    carbs_per_100g: 6.2,
    fat_per_100g: 3.9,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-090",
    name: "Morango Fresco",
    calories_per_100g: 30,
    protein_per_100g: 0.9,
    carbs_per_100g: 6.8,
    fat_per_100g: 0.3,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-091",
    name: "Manga Palmer Fresca",
    calories_per_100g: 72,
    protein_per_100g: 0.4,
    carbs_per_100g: 19.4,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-092",
    name: "Abacate Fresco",
    calories_per_100g: 96,
    protein_per_100g: 1.2,
    carbs_per_100g: 6.0,
    fat_per_100g: 8.4,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-093",
    name: "Uva Itália Fresca",
    calories_per_100g: 68,
    protein_per_100g: 0.7,
    carbs_per_100g: 17.3,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-094",
    name: "Goiaba Vermelha com Casca",
    calories_per_100g: 54,
    protein_per_100g: 1.1,
    carbs_per_100g: 13.0,
    fat_per_100g: 0.4,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-095",
    name: "Kiwi Fresco",
    calories_per_100g: 51,
    protein_per_100g: 1.0,
    carbs_per_100g: 12.4,
    fat_per_100g: 0.4,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-096",
    name: "Maracujá Polpa Natural",
    calories_per_100g: 68,
    protein_per_100g: 2.0,
    carbs_per_100g: 12.3,
    fat_per_100g: 1.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-097",
    name: "Tangerina / Ponkan Fresca",
    calories_per_100g: 38,
    protein_per_100g: 0.8,
    carbs_per_100g: 9.6,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  // HORTALIÇAS E VERDURAS
  {
    id: "taco-098",
    name: "Alface Crespa Crua",
    calories_per_100g: 11,
    protein_per_100g: 1.3,
    carbs_per_100g: 1.7,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-099",
    name: "Alface Americana Crua",
    calories_per_100g: 9,
    protein_per_100g: 0.9,
    carbs_per_100g: 1.7,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-100",
    name: "Tomate Salada Fresco",
    calories_per_100g: 15,
    protein_per_100g: 1.1,
    carbs_per_100g: 3.1,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-101",
    name: "Cenoura Crua Ralada",
    calories_per_100g: 34,
    protein_per_100g: 1.3,
    carbs_per_100g: 7.7,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-102",
    name: "Brócolis Cozido no Vapor",
    calories_per_100g: 25,
    protein_per_100g: 2.1,
    carbs_per_100g: 4.4,
    fat_per_100g: 0.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-103",
    name: "Couve Manteiga Refogada",
    calories_per_100g: 60,
    protein_per_100g: 1.7,
    carbs_per_100g: 5.6,
    fat_per_100g: 3.8,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-104",
    name: "Abóbora Cabotiá Cozida",
    calories_per_100g: 48,
    protein_per_100g: 1.4,
    carbs_per_100g: 10.8,
    fat_per_100g: 0.7,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-105",
    name: "Chuchu Cozido",
    calories_per_100g: 19,
    protein_per_100g: 0.4,
    carbs_per_100g: 4.8,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-106",
    name: "Beterraba Crua Ralada",
    calories_per_100g: 49,
    protein_per_100g: 1.9,
    carbs_per_100g: 11.1,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-107",
    name: "Pepino Japonês Cru",
    calories_per_100g: 10,
    protein_per_100g: 0.7,
    carbs_per_100g: 2.0,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-108",
    name: "Espinafre Cozido",
    calories_per_100g: 23,
    protein_per_100g: 2.7,
    carbs_per_100g: 3.6,
    fat_per_100g: 0.4,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-109",
    name: "Repolho Branco Cru",
    calories_per_100g: 17,
    protein_per_100g: 0.9,
    carbs_per_100g: 3.9,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-110",
    name: "Repolho Roxo Cru",
    calories_per_100g: 31,
    protein_per_100g: 1.4,
    carbs_per_100g: 7.4,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-111",
    name: "Vagem Cozida",
    calories_per_100g: 35,
    protein_per_100g: 1.9,
    carbs_per_100g: 7.9,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-112",
    name: "Abobrinha Italiana Cozida",
    calories_per_100g: 15,
    protein_per_100g: 1.1,
    carbs_per_100g: 3.0,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-113",
    name: "Berinjela Cozida / Grelhada",
    calories_per_100g: 25,
    protein_per_100g: 0.8,
    carbs_per_100g: 5.7,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-114",
    name: "Rúcula Crua",
    calories_per_100g: 13,
    protein_per_100g: 1.8,
    carbs_per_100g: 2.2,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-115",
    name: "Agrião Cru",
    calories_per_100g: 17,
    protein_per_100g: 2.3,
    carbs_per_100g: 2.2,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  // ÓLEOS, OLEAGINOSAS E SEMENTES
  {
    id: "taco-116",
    name: "Azeite de Oliva Extra Virgem",
    calories_per_100g: 884,
    protein_per_100g: 0.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 100.0,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-117",
    name: "Óleo de Soja",
    calories_per_100g: 884,
    protein_per_100g: 0.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 100.0,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-118",
    name: "Manteiga com Sal",
    calories_per_100g: 726,
    protein_per_100g: 0.4,
    carbs_per_100g: 0.1,
    fat_per_100g: 82.0,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-119",
    name: "Margarina Culinária",
    calories_per_100g: 720,
    protein_per_100g: 0.2,
    carbs_per_100g: 0.4,
    fat_per_100g: 80.0,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-120",
    name: "Castanha-do-Pará / Brasil",
    calories_per_100g: 643,
    protein_per_100g: 14.5,
    carbs_per_100g: 15.1,
    fat_per_100g: 63.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-121",
    name: "Castanha de Caju Torrada",
    calories_per_100g: 570,
    protein_per_100g: 18.5,
    carbs_per_100g: 30.2,
    fat_per_100g: 46.4,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-122",
    name: "Amendoim Torrado com Sal",
    calories_per_100g: 606,
    protein_per_100g: 22.5,
    carbs_per_100g: 18.7,
    fat_per_100g: 54.0,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-123",
    name: "Nozes Cruas",
    calories_per_100g: 654,
    protein_per_100g: 15.2,
    carbs_per_100g: 13.7,
    fat_per_100g: 65.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-124",
    name: "Amêndoas Torradas",
    calories_per_100g: 580,
    protein_per_100g: 21.2,
    carbs_per_100g: 21.7,
    fat_per_100g: 49.9,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-125",
    name: "Semente de Chia",
    calories_per_100g: 486,
    protein_per_100g: 16.5,
    carbs_per_100g: 42.1,
    fat_per_100g: 30.7,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-126",
    name: "Semente de Linhaça Dourada",
    calories_per_100g: 495,
    protein_per_100g: 14.1,
    carbs_per_100g: 43.3,
    fat_per_100g: 32.3,
    unit: "100g",
    is_custom: false,
  },
  // DOCES, BEBIDAS E DIVERSOS
  {
    id: "taco-127",
    name: "Mel de Abelha Puro",
    calories_per_100g: 309,
    protein_per_100g: 0.3,
    carbs_per_100g: 82.4,
    fat_per_100g: 0.0,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-128",
    name: "Açúcar Mascavo",
    calories_per_100g: 369,
    protein_per_100g: 0.8,
    carbs_per_100g: 94.5,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-129",
    name: "Açúcar Cristal",
    calories_per_100g: 387,
    protein_per_100g: 0.0,
    carbs_per_100g: 99.9,
    fat_per_100g: 0.0,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-130",
    name: "Cacau em Pó 100% Puro",
    calories_per_100g: 228,
    protein_per_100g: 19.6,
    carbs_per_100g: 57.9,
    fat_per_100g: 13.7,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-131",
    name: "Água de Coco Natural",
    calories_per_100g: 19,
    protein_per_100g: 0.7,
    carbs_per_100g: 3.7,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-132",
    name: "Suco de Laranja Natural",
    calories_per_100g: 45,
    protein_per_100g: 0.7,
    carbs_per_100g: 10.4,
    fat_per_100g: 0.2,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "taco-133",
    name: "Suco de Uva Integral",
    calories_per_100g: 63,
    protein_per_100g: 0.4,
    carbs_per_100g: 15.3,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
];

function calculateMacros(
  quantity: number,
  food: {
    calories_per_100g?: number;
    protein_per_100g?: number;
    carbs_per_100g?: number;
    fat_per_100g?: number;
  },
) {
  const ratio = quantity / 100;
  return {
    calculated_calories: Number((Number(food.calories_per_100g || 0) * ratio).toFixed(2)),
    calculated_protein: Number((Number(food.protein_per_100g || 0) * ratio).toFixed(2)),
    calculated_carbs: Number((Number(food.carbs_per_100g || 0) * ratio).toFixed(2)),
    calculated_fat: Number((Number(food.fat_per_100g || 0) * ratio).toFixed(2)),
  };
}

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      const {
        data: { user },
      } = await context.supabase.auth.getUser();
      if (!user) return null;
      const { data } = await context.supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      return data;
    } catch (err) {
      return null;
    }
  });

export const upsertProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const {
      data: { user },
    } = await context.supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const { error } = await context.supabase
      .from("profiles")
      .upsert({ id: user.id, ...data, updated_at: new Date().toISOString() });
    if (error) throw error;
    return { ok: true };
  });

export const getPatients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getPatients] Error:", error.message);
      return [];
    }
    return data || [];
  });

export const getPatient = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((id: string) => z.string().parse(id))
  .handler(async ({ data: id, context }) => {
    const { data, error } = await context.supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[getPatient] Error:", error.message);
      return null;
    }
    return data;
  });

export const getFoods = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      const { data, error } = await context.supabase.from("foods").select("*").order("name");
      if (error || !data || data.length === 0) {
        return DEFAULT_SESC_FOODS;
      }
      return data;
    } catch (err) {
      return DEFAULT_SESC_FOODS;
    }
  });

export const createFood = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => foodSchema.parse(input))
  .handler(async ({ data, context }) => {
    const {
      data: { user },
    } = await context.supabase.auth.getUser();
    if (!user) throw new Error("Acesso negado.");
    const { error } = await context.supabase.from("foods").insert({
      ...data,
      is_custom: true,
      created_by: user.id,
    });
    if (error) throw error;
    return { ok: true };
  });

export const getMealsForPatient = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { patient_id: string; date: string }) =>
    z.object({ patient_id: z.string(), date: z.string() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: meals, error } = await context.supabase
      .from("meals")
      .select("*, items:meal_items(*, food:foods(*))")
      .eq("patient_id", data.patient_id)
      .eq("meal_date", data.date)
      .order("created_at");

    if (error) {
      console.error("[getMealsForPatient] Error:", error.message);
      return [];
    }
    return meals || [];
  });

export const createMeal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => mealSchema.parse(input))
  .handler(async ({ data, context }) => {
    const user = await requireNutritionistUser(context);

    const { data: meal, error } = await context.supabase
      .from("meals")
      .insert({
        ...data,
        nutritionist_id: user.id,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[createMeal] Error:", error.message);
      throw new Error(`Falha ao registrar refeição no banco de dados: ${error.message}`);
    }
    return meal;
  });

export const addMealItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => mealItemSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireNutritionistUser(context);

    const { data: food } = await context.supabase
      .from("foods")
      .select("*")
      .eq("id", data.food_id)
      .maybeSingle();

    const targetFood =
      food || DEFAULT_SESC_FOODS.find((f) => f.id === data.food_id) || DEFAULT_SESC_FOODS[0];

    const macros = calculateMacros(data.quantity_grams, targetFood);

    const { error } = await context.supabase.from("meal_items").insert({
      meal_id: data.meal_id,
      food_id: data.food_id,
      quantity_grams: data.quantity_grams,
      ...macros,
    });

    if (error) throw new Error(`Falha ao adicionar alimento: ${error.message}`);
    return { ok: true };
  });

export const deleteMealItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((id: string) => z.string().parse(id))
  .handler(async ({ data: id, context }) => {
    await requireNutritionistUser(context);

    const { error } = await context.supabase.from("meal_items").delete().eq("id", id);
    if (error) throw new Error(`Falha ao excluir item: ${error.message}`);
    return { ok: true };
  });

export const deleteMeal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((id: string) => z.string().parse(id))
  .handler(async ({ data: id, context }) => {
    await requireNutritionistUser(context);

    const { error } = await context.supabase.from("meals").delete().eq("id", id);
    if (error) throw new Error(`Falha ao excluir refeição: ${error.message}`);
    return { ok: true };
  });

export const deletePatient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((id: string) => z.string().parse(id))
  .handler(async ({ data: id, context }) => {
    await requireNutritionistUser(context);

    const { error } = await context.supabase.from("patients").delete().eq("id", id);
    if (error) throw new Error(`Falha ao excluir paciente: ${error.message}`);
    return { ok: true };
  });

const clinicalDataSchema = z.object({
  patient_id: z.string(),
  weight: z.string().optional(),
  height: z.string().optional(),
  waist: z.string().optional(),
  hip: z.string().optional(),
  abdomen: z.string().optional(),
  chest: z.string().optional(),
  rightArm: z.string().optional(),
  leftArm: z.string().optional(),
  rightThigh: z.string().optional(),
  leftThigh: z.string().optional(),
  bodyFat: z.string().optional(),
  systolicBP: z.string().optional(),
  diastolicBP: z.string().optional(),
  glucoseValue: z.string().optional(),
  glucoseType: z.enum(["jejum", "casual"]).optional(),
  clinicalHistory: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  preferences: z.string().optional(),
  aversions: z.string().optional(),
  physicalActivity: z.string().optional(),
  waterIntake: z.string().optional(),
  bowelHabits: z.string().optional(),
  treatmentGoal: z.string().optional(),
  customAnamnesisQuestions: z
    .array(z.object({ id: z.string(), question: z.string(), answer: z.string() }))
    .optional(),
  evaluationsHistory: z.array(z.unknown()).optional(),
  recipesList: z.array(z.unknown()).optional(),
  examsList: z.array(z.unknown()).optional(),
  notesHistory: z.array(z.unknown()).optional(),
  clinicalNotes: z.string().optional(),
});

export const updatePatientClinicalData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => clinicalDataSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireNutritionistUser(context);
    const { data: currentPatient, error: fetchErr } = await context.supabase
      .from("patients")
      .select("notes")
      .eq("id", data.patient_id)
      .single();

    if (fetchErr) {
      throw new Error(`Erro ao localizar paciente: ${fetchErr.message}`);
    }

    let existingObj: Record<string, unknown> = {};
    try {
      if (currentPatient.notes && currentPatient.notes.startsWith("{")) {
        existingObj = JSON.parse(currentPatient.notes);
      } else {
        existingObj = { legacyNotes: currentPatient.notes || "" };
      }
    } catch {
      existingObj = { legacyNotes: currentPatient.notes || "" };
    }

    const updatedNotesObj = {
      ...existingObj,
      ...(data.weight !== undefined && { weight: data.weight }),
      ...(data.height !== undefined && { height: data.height }),
      ...(data.waist !== undefined && { waist: data.waist }),
      ...(data.hip !== undefined && { hip: data.hip }),
      ...(data.abdomen !== undefined && { abdomen: data.abdomen }),
      ...(data.chest !== undefined && { chest: data.chest }),
      ...(data.rightArm !== undefined && { rightArm: data.rightArm }),
      ...(data.leftArm !== undefined && { leftArm: data.leftArm }),
      ...(data.rightThigh !== undefined && { rightThigh: data.rightThigh }),
      ...(data.leftThigh !== undefined && { leftThigh: data.leftThigh }),
      ...(data.bodyFat !== undefined && { bodyFat: data.bodyFat }),
      ...(data.systolicBP !== undefined && { systolicBP: data.systolicBP }),
      ...(data.diastolicBP !== undefined && { diastolicBP: data.diastolicBP }),
      ...(data.glucoseValue !== undefined && { glucoseType: data.glucoseType }),
      ...(data.clinicalHistory !== undefined && { clinicalHistory: data.clinicalHistory }),
      ...(data.medications !== undefined && { medications: data.medications }),
      ...(data.allergies !== undefined && { allergies: data.allergies }),
      ...(data.preferences !== undefined && { preferences: data.preferences }),
      ...(data.aversions !== undefined && { aversions: data.aversions }),
      ...(data.physicalActivity !== undefined && { physicalActivity: data.physicalActivity }),
      ...(data.waterIntake !== undefined && { waterIntake: data.waterIntake }),
      ...(data.bowelHabits !== undefined && { bowelHabits: data.bowelHabits }),
      ...(data.treatmentGoal !== undefined && { treatmentGoal: data.treatmentGoal }),
      ...(data.customAnamnesisQuestions !== undefined && {
        customAnamnesisQuestions: data.customAnamnesisQuestions,
      }),
      ...(data.evaluationsHistory !== undefined && { evaluationsHistory: data.evaluationsHistory }),
      ...(data.recipesList !== undefined && { recipesList: data.recipesList }),
      ...(data.examsList !== undefined && { examsList: data.examsList }),
      ...(data.notesHistory !== undefined && { notesHistory: data.notesHistory }),
      ...(data.clinicalNotes !== undefined && { clinicalNotes: data.clinicalNotes }),
      updated_at: new Date().toISOString(),
    };

    const { error: updateErr } = await context.supabase
      .from("patients")
      .update({
        notes: JSON.stringify(updatedNotesObj),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.patient_id);

    if (updateErr) {
      throw new Error(`Erro ao atualizar prontuário: ${updateErr.message}`);
    }
    return { ok: true, notes: updatedNotesObj };
  });
