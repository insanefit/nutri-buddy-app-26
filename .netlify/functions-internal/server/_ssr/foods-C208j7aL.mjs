import { r as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as createFood, s as getFoods } from "./nutrition.functions-BRebx5zk.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import {
  a as CardHeader,
  n as Card,
  o as CardTitle,
  r as CardContent,
  t as Button,
} from "./card-DEk-bcO6.mjs";
import { n as Label, t as Input } from "./label-BOht4ZNO.mjs";
import {
  a as DialogTrigger,
  i as DialogTitle,
  n as DialogContent,
  r as DialogHeader,
  t as Dialog,
} from "./dialog-B9RkeSj-.mjs";
import { t as useSuspenseQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/foods-C208j7aL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FoodsPage() {
  const { data: foods, refetch } = useSuspenseQuery({
    queryKey: ["foods"],
    queryFn: () => getFoods({ data: void 0 }),
  });
  const [open, setOpen] = (0, import_react.useState)(false);
  const [name, setName] = (0, import_react.useState)("");
  const [calories, setCalories] = (0, import_react.useState)("");
  const [protein, setProtein] = (0, import_react.useState)("");
  const [carbs, setCarbs] = (0, import_react.useState)("");
  const [fat, setFat] = (0, import_react.useState)("");
  const [loading, setLoading] = (0, import_react.useState)(false);
  const handleSubmit = async (e) => {
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
      toast.success("Alimento cadastrado");
      setName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message || "Erro ao cadastrar alimento");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className: "mb-8 flex items-center justify-between",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
                className: "text-3xl font-semibold tracking-tight text-foreground",
                children: "Alimentos",
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                className: "mt-1 text-muted-foreground",
                children: "Banco de alimentos para montar diários",
              }),
            ],
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
            open,
            onOpenChange: setOpen,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
                asChild: true,
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                  children: "Novo alimento",
                }),
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
                className: "max-w-md",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
                      children: "Cadastrar alimento",
                    }),
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
                    onSubmit: handleSubmit,
                    className: "space-y-4 pt-2",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                        className: "space-y-2",
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                            htmlFor: "name",
                            children: "Nome",
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                            id: "name",
                            value: name,
                            onChange: (e) => setName(e.target.value),
                            placeholder: "Arroz branco cozido",
                            required: true,
                          }),
                        ],
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                        className: "text-xs text-muted-foreground",
                        children: "Valores nutricionais por 100g",
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                        className: "grid grid-cols-2 gap-4",
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                            className: "space-y-2",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                                htmlFor: "calories",
                                children: "Kcal",
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                                id: "calories",
                                type: "number",
                                min: 0,
                                step: 0.1,
                                value: calories,
                                onChange: (e) => setCalories(e.target.value),
                                required: true,
                              }),
                            ],
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                            className: "space-y-2",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                                htmlFor: "protein",
                                children: "Proteína (g)",
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                                id: "protein",
                                type: "number",
                                min: 0,
                                step: 0.1,
                                value: protein,
                                onChange: (e) => setProtein(e.target.value),
                                required: true,
                              }),
                            ],
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                            className: "space-y-2",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                                htmlFor: "carbs",
                                children: "Carbo (g)",
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                                id: "carbs",
                                type: "number",
                                min: 0,
                                step: 0.1,
                                value: carbs,
                                onChange: (e) => setCarbs(e.target.value),
                                required: true,
                              }),
                            ],
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                            className: "space-y-2",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                                htmlFor: "fat",
                                children: "Gordura (g)",
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                                id: "fat",
                                type: "number",
                                min: 0,
                                step: 0.1,
                                value: fat,
                                onChange: (e) => setFat(e.target.value),
                                required: true,
                              }),
                            ],
                          }),
                        ],
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                        type: "submit",
                        className: "w-full",
                        disabled: loading,
                        children: loading ? "Salvando..." : "Salvar alimento",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
        className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        children: foods?.map((food) =>
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            Card,
            {
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
                  className: "pb-2",
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
                    className: "text-base font-medium",
                    children: food.name,
                  }),
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                      className: "text-sm text-muted-foreground",
                      children: "Por 100g",
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                      className: "mt-3 grid grid-cols-2 gap-2 text-sm",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                              className: "text-muted-foreground",
                              children: "Kcal",
                            }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                              className: "font-medium text-foreground",
                              children: food.calories_per_100g,
                            }),
                          ],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                              className: "text-muted-foreground",
                              children: "Proteína",
                            }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                              className: "font-medium text-foreground",
                              children: [food.protein_per_100g, "g"],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                              className: "text-muted-foreground",
                              children: "Carbo",
                            }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                              className: "font-medium text-foreground",
                              children: [food.carbs_per_100g, "g"],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                              className: "text-muted-foreground",
                              children: "Gordura",
                            }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                              className: "font-medium text-foreground",
                              children: [food.fat_per_100g, "g"],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            },
            food.id,
          ),
        ),
      }),
      (!foods || foods.length === 0) &&
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
          className: "mt-12 rounded-2xl border border-dashed border-border p-12 text-center",
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
            className: "text-muted-foreground",
            children: "Nenhum alimento cadastrado.",
          }),
        }),
    ],
  });
}
//#endregion
export { FoodsPage as component };
