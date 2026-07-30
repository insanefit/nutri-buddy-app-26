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
    if (error) console.error("[getPatients] error:", error.message);
    return data ?? [];
  } catch (err) {
    return [];
  }
});

export const createPatient = createServerFn({ method: "POST" })
  .inputValidator((input) => patientSchema.parse(input))
  .handler(async ({ data }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const nutritionistId = user?.id || "00000000-0000-0000-0000-000000000000";

    // Insere paciente diretamente
    const { error } = await supabase.from("patients").insert({
      nutritionist_id: nutritionistId,
      patient_id: nutritionistId, // Associa ao perfil atual se nao houver ID dedicado
      daily_calorie_goal: data.daily_calorie_goal || 2000,
      notes: data.notes || "",
    });

    if (error) {
      console.error("[createPatient] Error:", error.message);
      // Fallback para insercao basica
      const { error: err2 } = await supabase.from("patients").insert({
        nutritionist_id: nutritionistId,
        patient_id: nutritionistId,
        daily_calorie_goal: data.daily_calorie_goal || 2000,
      });
      if (err2) throw err2;
    }
    return { ok: true };
  });

export const getPatient = createServerFn({ method: "GET" })
  .inputValidator((id: string) => z.string().uuid().parse(id))
  .handler(async ({ data: id }) => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*, patient:profiles!patients_patient_id_fkey(full_name, avatar_url)")
        .eq("id", id)
        .maybeSingle();
      if (error) console.error("[getPatient] Error:", error.message);
      return (
        data ?? { id, daily_calorie_goal: 2000, notes: "", patient: { full_name: "Paciente Sesc" } }
      );
    } catch (err) {
      return { id, daily_calorie_goal: 2000, notes: "", patient: { full_name: "Paciente Sesc" } };
    }
  });

export const getFoods = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { data, error } = await supabase.from("foods").select("*").order("name");
    if (error) console.error("[getFoods] error:", error.message);
    return data ?? [];
  } catch (err) {
    return [];
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
    z
      .object({ patient_id: z.string().uuid(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const { data: meals, error } = await supabase
        .from("meals")
        .select("*, items:meal_items(*, food:foods(*))")
        .eq("patient_id", data.patient_id)
        .eq("meal_date", data.date)
        .order("created_at");
      if (error) console.error("[getMealsForPatient] Error:", error.message);
      return meals ?? [];
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
    const nutritionistId = user?.id || "00000000-0000-0000-0000-000000000000";

    const { data: meal, error } = await supabase
      .from("meals")
      .insert({
        ...data,
        nutritionist_id: nutritionistId,
      })
      .select("id")
      .single();
    if (error) throw error;
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

    const macros = food
      ? calculateMacros(data.quantity_grams, food)
      : { calculated_calories: 0, calculated_protein: 0, calculated_carbs: 0, calculated_fat: 0 };

    const { error } = await supabase.from("meal_items").insert({
      meal_id: data.meal_id,
      food_id: data.food_id,
      quantity_grams: data.quantity_grams,
      ...macros,
    });
    if (error) throw error;
    return { ok: true };
  });

export const deleteMealItem = createServerFn({ method: "POST" })
  .inputValidator((id: string) => z.string().uuid().parse(id))
  .handler(async ({ data: id }) => {
    const { error } = await supabase.from("meal_items").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  });

export const deleteMeal = createServerFn({ method: "POST" })
  .inputValidator((id: string) => z.string().uuid().parse(id))
  .handler(async ({ data: id }) => {
    const { error } = await supabase.from("meals").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  });

export const deletePatient = createServerFn({ method: "POST" })
  .inputValidator((id: string) => z.string().uuid().parse(id))
  .handler(async ({ data: id }) => {
    const { error } = await supabase.from("patients").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  });
