import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

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

function calculateMacros(quantity: number, food: Database["public"]["Tables"]["foods"]["Row"]) {
  const ratio = quantity / 100;
  return {
    calculated_calories: Number((Number(food.calories_per_100g) * ratio).toFixed(2)),
    calculated_protein: Number((Number(food.protein_per_100g) * ratio).toFixed(2)),
    calculated_carbs: Number((Number(food.carbs_per_100g) * ratio).toFixed(2)),
    calculated_fat: Number((Number(food.fat_per_100g) * ratio).toFixed(2)),
  };
}

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  });

export const upsertProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, ...data, updated_at: new Date().toISOString() });
    if (error) throw error;
    return { ok: true };
  });

export const getPatients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("patients")
      .select("*, patient:profiles!patients_patient_id_fkey(full_name, avatar_url)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const createPatient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => patientSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (userError) throw userError;

    const existing = userData.users.find((u) => u.email === data.patient_email);
    let patientId: string;

    if (existing) {
      patientId = existing.id;
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: data.patient_email,
        email_confirm: true,
        user_metadata: { role: "patient" },
      });
      if (createError) throw createError;
      patientId = newUser.user!.id;
    }

    await supabaseAdmin.from("profiles").upsert({
      id: patientId,
      role: "patient",
      full_name: data.full_name || data.patient_email.split("@")[0],
    });

    const { error } = await context.supabase.from("patients").insert({
      nutritionist_id: context.userId,
      patient_id: patientId,
      daily_calorie_goal: data.daily_calorie_goal,
      notes: data.notes,
    });
    if (error) throw error;
    return { ok: true };
  });

export const getPatient = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((id: string) => z.string().uuid().parse(id))
  .handler(async ({ data: id, context }) => {
    const { data, error } = await context.supabase
      .from("patients")
      .select("*, patient:profiles!patients_patient_id_fkey(full_name, avatar_url)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  });

export const getFoods = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("foods").select("*").order("name");
    if (error) throw error;
    return data ?? [];
  });

export const createFood = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => foodSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("foods").insert({
      ...data,
      is_custom: true,
      created_by: context.userId,
    });
    if (error) throw error;
    return { ok: true };
  });

export const getMealsForPatient = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { patient_id: string; date: string }) =>
    z
      .object({ patient_id: z.string().uuid(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: meals, error } = await context.supabase
      .from("meals")
      .select("*, items:meal_items(*, food:foods(*))")
      .eq("patient_id", data.patient_id)
      .eq("meal_date", data.date)
      .order("created_at");
    if (error) throw error;
    return meals ?? [];
  });

export const createMeal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => mealSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: meal, error } = await context.supabase
      .from("meals")
      .insert({
        ...data,
        nutritionist_id: context.userId,
      })
      .select("id")
      .single();
    if (error) throw error;
    return meal;
  });

export const addMealItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => mealItemSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: food, error: foodError } = await context.supabase
      .from("foods")
      .select("*")
      .eq("id", data.food_id)
      .maybeSingle();
    if (foodError) throw foodError;
    if (!food) throw new Error("Alimento não encontrado");

    const macros = calculateMacros(data.quantity_grams, food);

    const { error } = await context.supabase.from("meal_items").insert({
      meal_id: data.meal_id,
      food_id: data.food_id,
      quantity_grams: data.quantity_grams,
      ...macros,
    });
    if (error) throw error;
    return { ok: true };
  });

export const deleteMealItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((id: string) => z.string().uuid().parse(id))
  .handler(async ({ data: id, context }) => {
    const { error } = await context.supabase.from("meal_items").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  });

export const deleteMeal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((id: string) => z.string().uuid().parse(id))
  .handler(async ({ data: id, context }) => {
    const { error } = await context.supabase.from("meals").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  });

export const deletePatient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((id: string) => z.string().uuid().parse(id))
  .handler(async ({ data: id, context }) => {
    const { error } = await context.supabase.from("patients").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  });
