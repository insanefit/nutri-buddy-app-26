import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-DmaA90UU.mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
import {
  a as objectType,
  i as numberType,
  n as enumType,
  o as stringType,
  r as literalType,
  t as booleanType,
} from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/nutrition.functions-BRebx5zk.js
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId, { origin: "server" }))(...args);
  };
  return Object.assign(fn, {
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
createServerFn({ method: "GET" }).handler(
  createSsrRpc("f6dfc449b194afff34d6c9e47d1caf2b30dc7b87bba10e8151b27e0ad4d60f46"),
);
createServerFn({ method: "POST" })
  .inputValidator((input) => profileSchema.parse(input))
  .handler(createSsrRpc("ce79f932e12bcb4d5ad695aa96205fe55f9b0c2eef6f11868e4a783ddcb6f768"));
var getPatients = createServerFn({ method: "GET" }).handler(
  createSsrRpc("50a83efd11f0ccf49a964190dfa1f63d9b697f2a36c99749fc6f7b0ec84df783"),
);
var createPatient = createServerFn({ method: "POST" })
  .inputValidator((input) => patientSchema.parse(input))
  .handler(createSsrRpc("8e9390d667d6518d9cc354ff46218905b1f9dc83469f58d82f97d5c36b70ed29"));
var getPatient = createServerFn({ method: "GET" })
  .inputValidator((id) => stringType().uuid().parse(id))
  .handler(createSsrRpc("32d4ac2596855a2271edd645f87996a675d0ba682251e5a15341b81aed55d63e"));
var getFoods = createServerFn({ method: "GET" }).handler(
  createSsrRpc("36a74267dada14001e23d27b0926b7296619e5248339fd72e6014c88f63233c4"),
);
var createFood = createServerFn({ method: "POST" })
  .inputValidator((input) => foodSchema.parse(input))
  .handler(createSsrRpc("054dd66281b01169bacc8b59a6f4af6ba5858a5ae15cda8b4f1f01a9ac03c155"));
var getMealsForPatient = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    objectType({
      patient_id: stringType().uuid(),
      date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
    }).parse(input),
  )
  .handler(createSsrRpc("b0e76fe5261c3f6452f62aca11d959d6e0cbe52cf96cbb27e361d2c4a546cec0"));
var createMeal = createServerFn({ method: "POST" })
  .inputValidator((input) => mealSchema.parse(input))
  .handler(createSsrRpc("0ac0aaedd827f49c1afdda0baf4c566c765f646c0a4c8e1141bbadf764475420"));
var addMealItem = createServerFn({ method: "POST" })
  .inputValidator((input) => mealItemSchema.parse(input))
  .handler(createSsrRpc("08f72e2e43155a6b3509b93bebd161c9a1b03f94b8f98d8eee575243909ddcbf"));
createServerFn({ method: "POST" })
  .inputValidator((id) => stringType().uuid().parse(id))
  .handler(createSsrRpc("b279a9d147a7201073bd3e87b689488649fecdbebe7c321268b83940ac9f7bd6"));
var deleteMeal = createServerFn({ method: "POST" })
  .inputValidator((id) => stringType().uuid().parse(id))
  .handler(createSsrRpc("11de879f4c50840b1a738957a015d7c180d6089af757c0b1f7c99fc4cda24097"));
var deletePatient = createServerFn({ method: "POST" })
  .inputValidator((id) => stringType().uuid().parse(id))
  .handler(createSsrRpc("fc65e5d8f93629c6a1fe712cf6f7f6951f31cc4a70b3d1bc23d71fd3e0c35335"));
//#endregion
export {
  deleteMeal as a,
  getMealsForPatient as c,
  createPatient as i,
  getPatient as l,
  createFood as n,
  deletePatient as o,
  createMeal as r,
  getFoods as s,
  addMealItem as t,
  getPatients as u,
};
