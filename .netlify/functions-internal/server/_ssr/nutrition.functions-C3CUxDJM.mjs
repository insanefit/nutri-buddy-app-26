import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
import {
  a as objectType,
  i as numberType,
  n as enumType,
  o as stringType,
  r as literalType,
  t as booleanType,
} from "../_libs/zod.mjs";
import { t as supabase } from "./client-Cf7FIzC3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/nutrition.functions-C3CUxDJM.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true,
  });
};
var profileSchema = objectType({
  full_name: stringType().min(1).max(120).optional(),
  avatar_url: stringType().url().max(500).optional().or(literalType("")),
  role: enumType(["nutritionist", "patient"]).optional(),
});
var patientSchema = objectType({
  patient_email: stringType().email(),
  full_name: stringType().min(1).max(120).optional(),
  daily_calorie_goal: numberType().int().min(500).max(1e4).optional(),
  notes: stringType().max(2e3).optional(),
});
var foodSchema = objectType({
  name: stringType().min(1).max(120),
  calories_per_100g: numberType().min(0).max(1e3),
  protein_per_100g: numberType().min(0).max(100),
  carbs_per_100g: numberType().min(0).max(100),
  fat_per_100g: numberType().min(0).max(100),
  unit: stringType().min(1).max(20).default("g"),
  is_custom: booleanType().default(true),
});
var mealSchema = objectType({
  patient_id: stringType().uuid(),
  name: stringType().min(1).max(120),
  meal_date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
});
var mealItemSchema = objectType({
  meal_id: stringType().uuid(),
  food_id: stringType().uuid(),
  quantity_grams: numberType().min(0).max(5e3),
});
function calculateMacros(quantity, food) {
  const ratio = quantity / 100;
  return {
    calculated_calories: Number((Number(food.calories_per_100g || 0) * ratio).toFixed(2)),
    calculated_protein: Number((Number(food.protein_per_100g || 0) * ratio).toFixed(2)),
    calculated_carbs: Number((Number(food.carbs_per_100g || 0) * ratio).toFixed(2)),
    calculated_fat: Number((Number(food.fat_per_100g || 0) * ratio).toFixed(2)),
  };
}
var getProfile_createServerFn_handler = createServerRpc(
  {
    id: "f6dfc449b194afff34d6c9e47d1caf2b30dc7b87bba10e8151b27e0ad4d60f46",
    name: "getProfile",
    filename: "src/lib/nutrition.functions.ts",
  },
  (opts) => getProfile.__executeServer(opts),
);
var getProfile = createServerFn({ method: "GET" }).handler(
  getProfile_createServerFn_handler,
  async () => {
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
  },
);
var upsertProfile_createServerFn_handler = createServerRpc(
  {
    id: "ce79f932e12bcb4d5ad695aa96205fe55f9b0c2eef6f11868e4a783ddcb6f768",
    name: "upsertProfile",
    filename: "src/lib/nutrition.functions.ts",
  },
  (opts) => upsertProfile.__executeServer(opts),
);
var upsertProfile = createServerFn({ method: "POST" })
  .inputValidator((input) => profileSchema.parse(input))
  .handler(upsertProfile_createServerFn_handler, async ({ data }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      ...data,
      updated_at: /* @__PURE__ */ new Date().toISOString(),
    });
    if (error) throw error;
    return { ok: true };
  });
var getPatients_createServerFn_handler = createServerRpc(
  {
    id: "50a83efd11f0ccf49a964190dfa1f63d9b697f2a36c99749fc6f7b0ec84df783",
    name: "getPatients",
    filename: "src/lib/nutrition.functions.ts",
  },
  (opts) => getPatients.__executeServer(opts),
);
var getPatients = createServerFn({ method: "GET" }).handler(
  getPatients_createServerFn_handler,
  async () => {
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
  },
);
var createPatient_createServerFn_handler = createServerRpc(
  {
    id: "8e9390d667d6518d9cc354ff46218905b1f9dc83469f58d82f97d5c36b70ed29",
    name: "createPatient",
    filename: "src/lib/nutrition.functions.ts",
  },
  (opts) => createPatient.__executeServer(opts),
);
var createPatient = createServerFn({ method: "POST" })
  .inputValidator((input) => patientSchema.parse(input))
  .handler(createPatient_createServerFn_handler, async ({ data }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const nutritionistId = user?.id || "00000000-0000-0000-0000-000000000000";
    const { error } = await supabase.from("patients").insert({
      nutritionist_id: nutritionistId,
      patient_id: nutritionistId,
      daily_calorie_goal: data.daily_calorie_goal || 2e3,
      notes: data.notes || "",
    });
    if (error) {
      console.error("[createPatient] Error:", error.message);
      const { error: err2 } = await supabase.from("patients").insert({
        nutritionist_id: nutritionistId,
        patient_id: nutritionistId,
        daily_calorie_goal: data.daily_calorie_goal || 2e3,
      });
      if (err2) throw err2;
    }
    return { ok: true };
  });
var getPatient_createServerFn_handler = createServerRpc(
  {
    id: "32d4ac2596855a2271edd645f87996a675d0ba682251e5a15341b81aed55d63e",
    name: "getPatient",
    filename: "src/lib/nutrition.functions.ts",
  },
  (opts) => getPatient.__executeServer(opts),
);
var getPatient = createServerFn({ method: "GET" })
  .inputValidator((id) => stringType().uuid().parse(id))
  .handler(getPatient_createServerFn_handler, async ({ data: id }) => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*, patient:profiles!patients_patient_id_fkey(full_name, avatar_url)")
        .eq("id", id)
        .maybeSingle();
      if (error) console.error("[getPatient] Error:", error.message);
      return (
        data ?? {
          id,
          daily_calorie_goal: 2e3,
          notes: "",
          patient: { full_name: "Paciente Sesc" },
        }
      );
    } catch (err) {
      return {
        id,
        daily_calorie_goal: 2e3,
        notes: "",
        patient: { full_name: "Paciente Sesc" },
      };
    }
  });
var getFoods_createServerFn_handler = createServerRpc(
  {
    id: "36a74267dada14001e23d27b0926b7296619e5248339fd72e6014c88f63233c4",
    name: "getFoods",
    filename: "src/lib/nutrition.functions.ts",
  },
  (opts) => getFoods.__executeServer(opts),
);
var getFoods = createServerFn({ method: "GET" }).handler(
  getFoods_createServerFn_handler,
  async () => {
    try {
      const { data, error } = await supabase.from("foods").select("*").order("name");
      if (error) console.error("[getFoods] error:", error.message);
      return data ?? [];
    } catch (err) {
      return [];
    }
  },
);
var createFood_createServerFn_handler = createServerRpc(
  {
    id: "054dd66281b01169bacc8b59a6f4af6ba5858a5ae15cda8b4f1f01a9ac03c155",
    name: "createFood",
    filename: "src/lib/nutrition.functions.ts",
  },
  (opts) => createFood.__executeServer(opts),
);
var createFood = createServerFn({ method: "POST" })
  .inputValidator((input) => foodSchema.parse(input))
  .handler(createFood_createServerFn_handler, async ({ data }) => {
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
var getMealsForPatient_createServerFn_handler = createServerRpc(
  {
    id: "b0e76fe5261c3f6452f62aca11d959d6e0cbe52cf96cbb27e361d2c4a546cec0",
    name: "getMealsForPatient",
    filename: "src/lib/nutrition.functions.ts",
  },
  (opts) => getMealsForPatient.__executeServer(opts),
);
var getMealsForPatient = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    objectType({
      patient_id: stringType().uuid(),
      date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
    }).parse(input),
  )
  .handler(getMealsForPatient_createServerFn_handler, async ({ data }) => {
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
var createMeal_createServerFn_handler = createServerRpc(
  {
    id: "0ac0aaedd827f49c1afdda0baf4c566c765f646c0a4c8e1141bbadf764475420",
    name: "createMeal",
    filename: "src/lib/nutrition.functions.ts",
  },
  (opts) => createMeal.__executeServer(opts),
);
var createMeal = createServerFn({ method: "POST" })
  .inputValidator((input) => mealSchema.parse(input))
  .handler(createMeal_createServerFn_handler, async ({ data }) => {
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
var addMealItem_createServerFn_handler = createServerRpc(
  {
    id: "08f72e2e43155a6b3509b93bebd161c9a1b03f94b8f98d8eee575243909ddcbf",
    name: "addMealItem",
    filename: "src/lib/nutrition.functions.ts",
  },
  (opts) => addMealItem.__executeServer(opts),
);
var addMealItem = createServerFn({ method: "POST" })
  .inputValidator((input) => mealItemSchema.parse(input))
  .handler(addMealItem_createServerFn_handler, async ({ data }) => {
    const { data: food } = await supabase
      .from("foods")
      .select("*")
      .eq("id", data.food_id)
      .maybeSingle();
    const macros = food
      ? calculateMacros(data.quantity_grams, food)
      : {
          calculated_calories: 0,
          calculated_protein: 0,
          calculated_carbs: 0,
          calculated_fat: 0,
        };
    const { error } = await supabase.from("meal_items").insert({
      meal_id: data.meal_id,
      food_id: data.food_id,
      quantity_grams: data.quantity_grams,
      ...macros,
    });
    if (error) throw error;
    return { ok: true };
  });
var deleteMealItem_createServerFn_handler = createServerRpc(
  {
    id: "b279a9d147a7201073bd3e87b689488649fecdbebe7c321268b83940ac9f7bd6",
    name: "deleteMealItem",
    filename: "src/lib/nutrition.functions.ts",
  },
  (opts) => deleteMealItem.__executeServer(opts),
);
var deleteMealItem = createServerFn({ method: "POST" })
  .inputValidator((id) => stringType().uuid().parse(id))
  .handler(deleteMealItem_createServerFn_handler, async ({ data: id }) => {
    const { error } = await supabase.from("meal_items").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  });
var deleteMeal_createServerFn_handler = createServerRpc(
  {
    id: "11de879f4c50840b1a738957a015d7c180d6089af757c0b1f7c99fc4cda24097",
    name: "deleteMeal",
    filename: "src/lib/nutrition.functions.ts",
  },
  (opts) => deleteMeal.__executeServer(opts),
);
var deleteMeal = createServerFn({ method: "POST" })
  .inputValidator((id) => stringType().uuid().parse(id))
  .handler(deleteMeal_createServerFn_handler, async ({ data: id }) => {
    const { error } = await supabase.from("meals").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  });
var deletePatient_createServerFn_handler = createServerRpc(
  {
    id: "fc65e5d8f93629c6a1fe712cf6f7f6951f31cc4a70b3d1bc23d71fd3e0c35335",
    name: "deletePatient",
    filename: "src/lib/nutrition.functions.ts",
  },
  (opts) => deletePatient.__executeServer(opts),
);
var deletePatient = createServerFn({ method: "POST" })
  .inputValidator((id) => stringType().uuid().parse(id))
  .handler(deletePatient_createServerFn_handler, async ({ data: id }) => {
    const { error } = await supabase.from("patients").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  });
//#endregion
export {
  addMealItem_createServerFn_handler,
  createFood_createServerFn_handler,
  createMeal_createServerFn_handler,
  createPatient_createServerFn_handler,
  deleteMealItem_createServerFn_handler,
  deleteMeal_createServerFn_handler,
  deletePatient_createServerFn_handler,
  getFoods_createServerFn_handler,
  getMealsForPatient_createServerFn_handler,
  getPatient_createServerFn_handler,
  getPatients_createServerFn_handler,
  getProfile_createServerFn_handler,
  upsertProfile_createServerFn_handler,
};
