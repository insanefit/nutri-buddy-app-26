//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-DmaA90UU.js
var manifest = {
  "054dd66281b01169bacc8b59a6f4af6ba5858a5ae15cda8b4f1f01a9ac03c155": {
    functionName: "createFood_createServerFn_handler",
    importer: () => import("./_ssr/nutrition.functions-C3CUxDJM.mjs"),
  },
  "08f72e2e43155a6b3509b93bebd161c9a1b03f94b8f98d8eee575243909ddcbf": {
    functionName: "addMealItem_createServerFn_handler",
    importer: () => import("./_ssr/nutrition.functions-C3CUxDJM.mjs"),
  },
  "0ac0aaedd827f49c1afdda0baf4c566c765f646c0a4c8e1141bbadf764475420": {
    functionName: "createMeal_createServerFn_handler",
    importer: () => import("./_ssr/nutrition.functions-C3CUxDJM.mjs"),
  },
  "11de879f4c50840b1a738957a015d7c180d6089af757c0b1f7c99fc4cda24097": {
    functionName: "deleteMeal_createServerFn_handler",
    importer: () => import("./_ssr/nutrition.functions-C3CUxDJM.mjs"),
  },
  "32d4ac2596855a2271edd645f87996a675d0ba682251e5a15341b81aed55d63e": {
    functionName: "getPatient_createServerFn_handler",
    importer: () => import("./_ssr/nutrition.functions-C3CUxDJM.mjs"),
  },
  "36a74267dada14001e23d27b0926b7296619e5248339fd72e6014c88f63233c4": {
    functionName: "getFoods_createServerFn_handler",
    importer: () => import("./_ssr/nutrition.functions-C3CUxDJM.mjs"),
  },
  "50a83efd11f0ccf49a964190dfa1f63d9b697f2a36c99749fc6f7b0ec84df783": {
    functionName: "getPatients_createServerFn_handler",
    importer: () => import("./_ssr/nutrition.functions-C3CUxDJM.mjs"),
  },
  "8e9390d667d6518d9cc354ff46218905b1f9dc83469f58d82f97d5c36b70ed29": {
    functionName: "createPatient_createServerFn_handler",
    importer: () => import("./_ssr/nutrition.functions-C3CUxDJM.mjs"),
  },
  b0e76fe5261c3f6452f62aca11d959d6e0cbe52cf96cbb27e361d2c4a546cec0: {
    functionName: "getMealsForPatient_createServerFn_handler",
    importer: () => import("./_ssr/nutrition.functions-C3CUxDJM.mjs"),
  },
  b279a9d147a7201073bd3e87b689488649fecdbebe7c321268b83940ac9f7bd6: {
    functionName: "deleteMealItem_createServerFn_handler",
    importer: () => import("./_ssr/nutrition.functions-C3CUxDJM.mjs"),
  },
  ce79f932e12bcb4d5ad695aa96205fe55f9b0c2eef6f11868e4a783ddcb6f768: {
    functionName: "upsertProfile_createServerFn_handler",
    importer: () => import("./_ssr/nutrition.functions-C3CUxDJM.mjs"),
  },
  f6dfc449b194afff34d6c9e47d1caf2b30dc7b87bba10e8151b27e0ad4d60f46: {
    functionName: "getProfile_createServerFn_handler",
    importer: () => import("./_ssr/nutrition.functions-C3CUxDJM.mjs"),
  },
  fc65e5d8f93629c6a1fe712cf6f7f6951f31cc4a70b3d1bc23d71fd3e0c35335: {
    functionName: "deletePatient_createServerFn_handler",
    importer: () => import("./_ssr/nutrition.functions-C3CUxDJM.mjs"),
  },
};
async function getServerFnById(id, access) {
  const serverFnInfo = manifest[id];
  if (!serverFnInfo) throw new Error("Server function info not found for " + id);
  const fnModule = serverFnInfo.module ?? (await serverFnInfo.importer());
  if (!fnModule) throw new Error("Server function module not resolved for " + id);
  const action = fnModule[serverFnInfo.functionName];
  if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
  return action;
}
//#endregion
export { getServerFnById as t };
