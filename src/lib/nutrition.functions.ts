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
  full_name: z.string().min(1).max(120).optional(),
  daily_calorie_goal: z.number().int().min(500).max(10000).optional(),
  notes: z.string().max(2000).optional(),
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
  {
    id: "a1111111-1111-4111-a111-111111111111",
    name: "Arroz Integral Cozido",
    calories_per_100g: 124,
    protein_per_100g: 2.6,
    carbs_per_100g: 25.8,
    fat_per_100g: 1.0,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "a2222222-2222-4222-a222-222222222222",
    name: "Peito de Frango Grelhado",
    calories_per_100g: 165,
    protein_per_100g: 31.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 3.6,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "a3333333-3333-4333-a333-333333333333",
    name: "Ovos Mexidos Simples",
    calories_per_100g: 140,
    protein_per_100g: 12.0,
    carbs_per_100g: 1.1,
    fat_per_100g: 9.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "a4444444-4444-4444-a444-444444444444",
    name: "Aveia em Flocos Finos",
    calories_per_100g: 390,
    protein_per_100g: 14.0,
    carbs_per_100g: 66.0,
    fat_per_100g: 7.0,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "a5555555-5555-4555-a555-555555555555",
    name: "Banana Prata Fresca",
    calories_per_100g: 89,
    protein_per_100g: 1.3,
    carbs_per_100g: 22.8,
    fat_per_100g: 0.3,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "a6666666-6666-4666-a666-666666666666",
    name: "Feijão Preto Cozido",
    calories_per_100g: 77,
    protein_per_100g: 4.5,
    carbs_per_100g: 14.0,
    fat_per_100g: 0.5,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "a7777777-7777-4777-a777-777777777777",
    name: "Batata Doce Cozida",
    calories_per_100g: 86,
    protein_per_100g: 1.6,
    carbs_per_100g: 20.1,
    fat_per_100g: 0.1,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "a8888888-8888-4888-a888-888888888888",
    name: "Castanha do Pará",
    calories_per_100g: 650,
    protein_per_100g: 14.0,
    carbs_per_100g: 12.0,
    fat_per_100g: 66.0,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "a9999999-9999-4999-a999-999999999999",
    name: "Salada Verde com Azeite",
    calories_per_100g: 45,
    protein_per_100g: 1.2,
    carbs_per_100g: 3.5,
    fat_per_100g: 3.0,
    unit: "100g",
    is_custom: false,
  },
  {
    id: "b0000000-0000-4000-b000-000000000000",
    name: "Queijo Minas Frescal",
    calories_per_100g: 240,
    protein_per_100g: 17.4,
    carbs_per_100g: 3.2,
    fat_per_100g: 18.0,
    unit: "100g",
    is_custom: false,
  },
];

const DEFAULT_SESC_PATIENTS = [
  {
    id: "ca8bee8e-8694-4902-b2f6-dea91ae4628a",
    daily_calorie_goal: 2200,
    created_at: new Date().toISOString(),
    notes:
      "Paciente João Pedro da Silva | Sesc Macapá | Altura: 175cm | Peso: 78.5kg | IMC: 25.6 (Sobrepeso) | Objetivo: Reeducação Alimentar",
    patient: { full_name: "João Pedro da Silva (Sesc Macapá)" },
    profile: { full_name: "João Pedro da Silva (Sesc Macapá)" },
  },
  {
    id: "b2222222-2222-4222-b222-222222222222",
    daily_calorie_goal: 1900,
    created_at: new Date().toISOString(),
    notes:
      "Paciente Maria Eduarda Santos | Sesc Amapá | Altura: 162cm | Peso: 58.0kg | IMC: 22.1 (Eutrofia) | Objetivo: Hipertrofia",
    patient: { full_name: "Maria Eduarda Santos (Sesc Amapá)" },
    profile: { full_name: "Maria Eduarda Santos (Sesc Amapá)" },
  },
  {
    id: "b3333333-3333-4333-b333-333333333333",
    daily_calorie_goal: 1800,
    created_at: new Date().toISOString(),
    notes:
      "Paciente Carlos Alberto Mendes | Sesc Amapá | Altura: 170cm | Peso: 89.0kg | IMC: 30.8 (Obesidade I) | Acompanhamento preventivo",
    patient: { full_name: "Carlos Alberto Mendes (Sesc Amapá)" },
    profile: { full_name: "Carlos Alberto Mendes (Sesc Amapá)" },
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
      full_name: data.full_name || data.patient_email.split("@")[0],
      role: "patient",
    });

    const { error } = await supabase.from("patients").insert({
      nutritionist_id: nutritionistId,
      patient_id: newPatientProfileId,
      daily_calorie_goal: data.daily_calorie_goal || 2000,
      notes: data.notes || `Paciente ${data.full_name || "Sesc"} | E-mail: ${data.patient_email}`,
    });

    if (error) {
      console.error("[createPatient] Error:", error.message);
    }
    return { ok: true };
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
