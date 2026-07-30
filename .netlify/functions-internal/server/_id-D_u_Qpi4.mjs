import { r as __toESM } from "./_runtime.mjs";
import { o as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { t as SescLogo } from "./_ssr/SescLogo-DAaqfixY.mjs";
import { _ as useParams, g as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import {
  a as deleteMeal,
  c as getMealsForPatient,
  l as getPatient,
  o as deletePatient,
  r as createMeal,
  s as getFoods,
  t as addMealItem,
} from "./_ssr/nutrition.functions-BRebx5zk.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import {
  a as CardHeader,
  n as Card,
  o as CardTitle,
  r as CardContent,
  s as cn,
  t as Button,
} from "./_ssr/card-DEk-bcO6.mjs";
import { n as Label, t as Input } from "./_ssr/label-BOht4ZNO.mjs";
import {
  d as FileText,
  f as ChevronUp,
  h as Calculator,
  l as Printer,
  m as Check,
  n as Utensils,
  p as ChevronDown,
  s as Trash2,
  u as Plus,
} from "./_libs/lucide-react.mjs";
import {
  a as DialogTrigger,
  i as DialogTitle,
  n as DialogContent,
  r as DialogHeader,
  t as Dialog,
} from "./_ssr/dialog-B9RkeSj-.mjs";
import { t as useSuspenseQuery } from "./_libs/tanstack__react-query.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { n as format, t as ptBR } from "./_libs/date-fns.mjs";
import {
  a as SelectItemIndicator,
  c as SelectPortal,
  d as SelectSeparator$1,
  f as SelectTrigger$1,
  i as SelectItem$1,
  l as SelectScrollDownButton$1,
  m as SelectViewport,
  n as SelectContent$1,
  o as SelectItemText,
  p as SelectValue$1,
  r as SelectIcon,
  s as SelectLabel$1,
  t as Select$1,
  u as SelectScrollUpButton$1,
} from "./_libs/@radix-ui/react-select+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-D_u_Qpi4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Select = Select$1;
var SelectValue = SelectValue$1;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) =>
  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
    ref,
    className: cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className,
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
        asChild: true,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
          className: "h-4 w-4 opacity-50",
        }),
      }),
    ],
  }),
);
SelectTrigger.displayName = SelectTrigger$1.displayName;
var SelectScrollUpButton = import_react.forwardRef(({ className, ...props }, ref) =>
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton$1, {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" }),
  }),
);
SelectScrollUpButton.displayName = SelectScrollUpButton$1.displayName;
var SelectScrollDownButton = import_react.forwardRef(({ className, ...props }, ref) =>
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton$1, {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" }),
  }),
);
SelectScrollDownButton.displayName = SelectScrollDownButton$1.displayName;
var SelectContent = import_react.forwardRef(
  ({ className, children, position = "popper", ...props }, ref) =>
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, {
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent$1, {
        ref,
        className: cn(
          "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        ),
        position,
        ...props,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
            className: cn(
              "p-1",
              position === "popper" &&
                "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
            ),
            children,
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {}),
        ],
      }),
    }),
);
SelectContent.displayName = SelectContent$1.displayName;
var SelectLabel = import_react.forwardRef(({ className, ...props }, ref) =>
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabel$1, {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", className),
    ...props,
  }),
);
SelectLabel.displayName = SelectLabel$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) =>
  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    ),
    ...props,
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
        className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, {
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }),
        }),
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children }),
    ],
  }),
);
SelectItem.displayName = SelectItem$1.displayName;
var SelectSeparator = import_react.forwardRef(({ className, ...props }, ref) =>
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSeparator$1, {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props,
  }),
);
SelectSeparator.displayName = SelectSeparator$1.displayName;
var MEAL_NAMES = [
  {
    value: "Café da manhã",
    label: "Café da manhã",
  },
  {
    value: "Lanche da manhã",
    label: "Lanche da manhã",
  },
  {
    value: "Almoço",
    label: "Almoço",
  },
  {
    value: "Lanche da tarde",
    label: "Lanche da tarde",
  },
  {
    value: "Jantar",
    label: "Jantar",
  },
  {
    value: "Ceia",
    label: "Ceia",
  },
];
function getImcClassification(imc) {
  if (imc < 18.5)
    return {
      text: "Baixo Peso",
      color: "text-amber-600 bg-amber-50",
    };
  if (imc < 25)
    return {
      text: "Peso Adequado (Eutrofia)",
      color: "text-emerald-700 bg-emerald-50",
    };
  if (imc < 30)
    return {
      text: "Sobrepeso",
      color: "text-amber-700 bg-amber-100",
    };
  if (imc < 35)
    return {
      text: "Obesidade Grau I",
      color: "text-red-600 bg-red-50",
    };
  if (imc < 40)
    return {
      text: "Obesidade Grau II",
      color: "text-red-700 bg-red-100",
    };
  return {
    text: "Obesidade Grau III (Mórbida)",
    color: "text-red-800 bg-red-200",
  };
}
function PatientDetailPage() {
  const { id } = useParams({ from: "/app/patients/$id" });
  const navigate = useNavigate();
  const today = format(/* @__PURE__ */ new Date(), "yyyy-MM-dd");
  const { data: patient } = useSuspenseQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatient({ data: id }),
  });
  const { data: meals, refetch: refetchMeals } = useSuspenseQuery({
    queryKey: ["meals", id, today],
    queryFn: () =>
      getMealsForPatient({
        data: {
          patient_id: id,
          date: today,
        },
      }),
  });
  const { data: foods } = useSuspenseQuery({
    queryKey: ["foods"],
    queryFn: () => getFoods({ data: void 0 }),
  });
  const patientName = patient?.patient?.full_name || "Paciente Sesc";
  const [weight, setWeight] = (0, import_react.useState)("70");
  const [height, setHeight] = (0, import_react.useState)("170");
  const numWeight = Number(weight) || 0;
  const numHeightM = (Number(height) || 0) / 100;
  const imcValue =
    numWeight > 0 && numHeightM > 0
      ? Number((numWeight / (numHeightM * numHeightM)).toFixed(1))
      : 0;
  const imcClass = imcValue > 0 ? getImcClassification(imcValue) : null;
  const [date, setDate] = (0, import_react.useState)(today);
  const [mealName, setMealName] = (0, import_react.useState)("Café da manhã");
  const [selectedFood, setSelectedFood] = (0, import_react.useState)("");
  const [quantity, setQuantity] = (0, import_react.useState)("100");
  const [openMealDialog, setOpenMealDialog] = (0, import_react.useState)(false);
  const [openPrescriptionDialog, setOpenPrescriptionDialog] = (0, import_react.useState)(false);
  const [prescriptionNotes, setPrescriptionNotes] = (0, import_react.useState)(
    "Mastigar devagar. Evitar ingestão de líquidos durante as refeições principais. Seguir orientações do Guia Alimentar para a População Brasileira.",
  );
  const [loading, setLoading] = (0, import_react.useState)(false);
  const handleAddMeal = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const meal = await createMeal({
        data: {
          patient_id: id,
          name: mealName,
          meal_date: date,
        },
      });
      if (selectedFood && quantity)
        await addMealItem({
          data: {
            meal_id: meal.id,
            food_id: selectedFood,
            quantity_grams: Number(quantity),
          },
        });
      toast.success("Refeição registrada!");
      setSelectedFood("");
      setQuantity("100");
      setOpenMealDialog(false);
      refetchMeals();
    } catch (err) {
      toast.error(err.message || "Erro ao registrar refeição");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteMeal = async (mealId) => {
    if (!confirm("Deseja remover esta refeição?")) return;
    try {
      await deleteMeal({ data: mealId });
      toast.success("Refeição removida");
      refetchMeals();
    } catch (err) {
      toast.error(err.message || "Erro ao remover refeição");
    }
  };
  const handleDeletePatientCurrent = async () => {
    if (!confirm(`Tem certeza que deseja excluir o prontuário de ${patientName}?`)) return;
    try {
      await deletePatient({ data: id });
      toast.success("Prontuário excluído com sucesso!");
      navigate({ to: "/app/patients" });
    } catch (err) {
      toast.error(err.message || "Erro ao excluir paciente");
    }
  };
  const totals = meals?.reduce(
    (acc, meal) => {
      meal.items?.forEach((item) => {
        acc.kcal += item.calculated_calories;
        acc.protein += item.calculated_protein;
        acc.carbs += item.calculated_carbs;
        acc.fat += item.calculated_fat;
      });
      return acc;
    },
    {
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className:
          "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                className: "flex items-center gap-2",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
                    className: "text-2xl font-bold text-[#003366]",
                    children: patientName,
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                    className:
                      "text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-[#003366]",
                    children: "Prontuário Ativo",
                  }),
                ],
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                className: "text-xs text-slate-500 mt-1",
                children: [
                  "Meta Calórica Recomendada:",
                  " ",
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
                    children: [patient?.daily_calorie_goal || 2e3, " kcal/dia"],
                  }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            className: "flex items-center gap-2",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
                open: openPrescriptionDialog,
                onOpenChange: setOpenPrescriptionDialog,
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
                    asChild: true,
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
                      className:
                        "bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold gap-1.5",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, {
                          className: "h-4 w-4",
                        }),
                        "Emitir Receita / Prescrição",
                      ],
                    }),
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
                    className: "max-w-2xl max-h-[90vh] overflow-y-auto",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
                        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
                          className: "text-lg font-bold text-[#003366] flex items-center gap-2",
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
                              className: "h-5 w-5 text-[#003366]",
                            }),
                            "Prescrição Nutricional Sesc",
                          ],
                        }),
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                        className:
                          "p-6 border border-slate-300 rounded bg-white space-y-6 text-slate-800 my-2 shadow-sm",
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                            className:
                              "flex items-center justify-between border-b border-slate-200 pb-4",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SescLogo, {
                                className: "h-12",
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                                className: "text-right",
                                children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
                                    className: "font-extrabold text-[#003366] text-sm uppercase",
                                    children: "Saúde Nutricional Sesc",
                                  }),
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                                    className: "text-[11px] text-slate-500",
                                    children: "Unidade de Atendimento Clínico — Amapá",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                            className:
                              "grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded border border-slate-100",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                                children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                                    className: "font-bold text-slate-600 block",
                                    children: "PACIENTE:",
                                  }),
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                                    className: "text-slate-900 font-semibold",
                                    children: patientName,
                                  }),
                                ],
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                                children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                                    className: "font-bold text-slate-600 block",
                                    children: "DATA DA EMISSÃO:",
                                  }),
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                                    className: "text-slate-900",
                                    children: format(/* @__PURE__ */ new Date(), "dd/MM/yyyy"),
                                  }),
                                ],
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                                children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                                    className: "font-bold text-slate-600 block",
                                    children: "PESO / ALTURA:",
                                  }),
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
                                    className: "text-slate-900",
                                    children: [
                                      weight,
                                      " kg | ",
                                      height,
                                      " cm (IMC: ",
                                      imcValue,
                                      " - ",
                                      imcClass?.text,
                                      ")",
                                    ],
                                  }),
                                ],
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                                children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                                    className: "font-bold text-slate-600 block",
                                    children: "META CALÓRICA:",
                                  }),
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
                                    className: "text-slate-900 font-semibold",
                                    children: [patient?.daily_calorie_goal || 2e3, " kcal/dia"],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                            className: "space-y-2",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
                                className:
                                  "text-xs font-bold text-[#003366] uppercase border-b border-slate-200 pb-1",
                                children: "Plano Alimentar Prescrito",
                              }),
                              meals && meals.length > 0
                                ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                                    className: "space-y-2",
                                    children: meals.map((m) =>
                                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                                        "div",
                                        {
                                          className: "text-xs border-b border-slate-100 pb-1",
                                          children: [
                                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
                                              className: "font-bold text-[#003366]",
                                              children: [m.name, ":"],
                                            }),
                                            " ",
                                            m.items
                                              ?.map(
                                                (it) => `${it.food?.name} (${it.quantity_grams}g)`,
                                              )
                                              .join(", ") || "Sem itens registrados",
                                          ],
                                        },
                                        m.id,
                                      ),
                                    ),
                                  })
                                : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                                    className: "text-xs text-slate-500 italic",
                                    children:
                                      "Alimentação fracionada em 4 a 6 refeições diárias respeitando a saciedade.",
                                  }),
                            ],
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                            className: "space-y-1",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                                className: "text-xs font-bold text-[#003366] uppercase",
                                children: "Orientações Nutricionais & Conduta",
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
                                value: prescriptionNotes,
                                onChange: (e) => setPrescriptionNotes(e.target.value),
                                rows: 3,
                                className:
                                  "w-full text-xs p-2 border border-slate-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366]",
                              }),
                            ],
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                            className: "pt-8 border-t border-slate-200 text-center space-y-1",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                                className: "w-48 border-b border-slate-400 mx-auto",
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                                className: "text-xs font-bold text-[#003366]",
                                children: "Equipe de Nutrição Sesc Amapá",
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                                className: "text-[10px] text-slate-400",
                                children: "CRN — Atendimento Clínico Autorizado",
                              }),
                            ],
                          }),
                        ],
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                        className: "flex justify-end gap-2 pt-2",
                        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
                          onClick: () => window.print(),
                          className: "bg-[#003366] hover:bg-[#002244] text-white font-bold",
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, {
                              className: "h-4 w-4 mr-1.5",
                            }),
                            "Imprimir Receita (PDF)",
                          ],
                        }),
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
                variant: "outline",
                size: "sm",
                onClick: handleDeletePatientCurrent,
                className: "border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
                    className: "h-4 w-4 mr-1",
                  }),
                  "Excluir",
                ],
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
        className: "border border-slate-200 shadow-sm bg-white border-t-4 border-t-[#003366]",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
            className: "pb-3 border-b border-slate-100 flex flex-row items-center justify-between",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                className: "flex items-center gap-2",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, {
                    className: "h-5 w-5 text-[#003366]",
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
                    className: "text-base font-bold text-[#003366]",
                    children: "Avaliação Antropométrica & Calculadora de IMC",
                  }),
                ],
              }),
              imcClass &&
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                  className: `text-xs font-bold px-3 py-1 rounded-full ${imcClass.color}`,
                  children: imcClass.text,
                }),
            ],
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
            className: "pt-4",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
              className: "grid grid-cols-1 sm:grid-cols-3 gap-4 items-end",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                  className: "space-y-1",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                      htmlFor: "weight",
                      className: "text-xs font-semibold text-slate-700",
                      children: "Peso Atual (kg)",
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                      id: "weight",
                      type: "number",
                      step: "0.1",
                      value: weight,
                      onChange: (e) => setWeight(e.target.value),
                      placeholder: "70.0",
                    }),
                  ],
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                  className: "space-y-1",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                      htmlFor: "height",
                      className: "text-xs font-semibold text-slate-700",
                      children: "Altura (cm)",
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                      id: "height",
                      type: "number",
                      value: height,
                      onChange: (e) => setHeight(e.target.value),
                      placeholder: "170",
                    }),
                  ],
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                  className: "bg-slate-50 p-3 rounded border border-slate-200 text-center",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                      className: "text-[11px] font-semibold text-slate-500 uppercase block",
                      children: "IMC Calculado",
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                      className: "text-2xl font-black text-[#003366]",
                      children: imcValue > 0 ? imcValue : "—",
                    }),
                  ],
                }),
              ],
            }),
          }),
        ],
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className: "grid gap-4 sm:grid-cols-4",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MacroCard, {
            label: "Calorias Registradas",
            value: `${Math.round(totals?.kcal || 0)} kcal`,
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MacroCard, {
            label: "Proteínas",
            value: `${Math.round(totals?.protein || 0)} g`,
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MacroCard, {
            label: "Carboidratos",
            value: `${Math.round(totals?.carbs || 0)} g`,
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MacroCard, {
            label: "Gorduras",
            value: `${Math.round(totals?.fat || 0)} g`,
          }),
        ],
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className: "space-y-4",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            className: "flex items-center justify-between border-b border-slate-200 pb-3",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                className: "flex items-center gap-2",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Utensils, {
                    className: "h-5 w-5 text-[#003366]",
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
                    className: "text-lg font-bold text-[#003366]",
                    children: "Diário Alimentar",
                  }),
                ],
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
                open: openMealDialog,
                onOpenChange: setOpenMealDialog,
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
                    asChild: true,
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
                      className: "bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
                          className: "h-4 w-4 mr-1",
                        }),
                        "Adicionar Refeição",
                      ],
                    }),
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
                    className: "max-w-md",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
                        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
                          className: "text-base font-bold text-[#003366]",
                          children: "Nova Refeição no Prontuário",
                        }),
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
                        onSubmit: handleAddMeal,
                        className: "space-y-4 pt-2",
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                            className: "space-y-1.5",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                                htmlFor: "date",
                                className: "text-xs font-semibold text-slate-700",
                                children: "Data",
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                                id: "date",
                                type: "date",
                                value: date,
                                onChange: (e) => setDate(e.target.value),
                                required: true,
                              }),
                            ],
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                            className: "space-y-1.5",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                                htmlFor: "mealName",
                                className: "text-xs font-semibold text-slate-700",
                                children: "Refeição",
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
                                value: mealName,
                                onValueChange: setMealName,
                                children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
                                    id: "mealName",
                                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                                      SelectValue,
                                      {},
                                    ),
                                  }),
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
                                    children: MEAL_NAMES.map((t) =>
                                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                                        SelectItem,
                                        {
                                          value: t.value,
                                          children: t.label,
                                        },
                                        t.value,
                                      ),
                                    ),
                                  }),
                                ],
                              }),
                            ],
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                            className: "space-y-1.5",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                                htmlFor: "food",
                                className: "text-xs font-semibold text-slate-700",
                                children: "Alimento",
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
                                value: selectedFood,
                                onValueChange: setSelectedFood,
                                children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
                                    id: "food",
                                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                                      SelectValue,
                                      { placeholder: "Selecione da tabela de alimentos" },
                                    ),
                                  }),
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
                                    children: foods?.map((foodItem) =>
                                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                                        SelectItem,
                                        {
                                          value: foodItem.id,
                                          children: [
                                            foodItem.name,
                                            " (",
                                            foodItem.calories_per_100g,
                                            " kcal/100g)",
                                          ],
                                        },
                                        foodItem.id,
                                      ),
                                    ),
                                  }),
                                ],
                              }),
                            ],
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                            className: "space-y-1.5",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                                htmlFor: "quantity",
                                className: "text-xs font-semibold text-slate-700",
                                children: "Quantidade (gramas)",
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                                id: "quantity",
                                type: "number",
                                min: 1,
                                value: quantity,
                                onChange: (e) => setQuantity(e.target.value),
                                required: true,
                              }),
                            ],
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                            type: "submit",
                            className:
                              "w-full bg-[#003366] hover:bg-[#002244] text-white font-bold",
                            disabled: loading,
                            children: loading ? "Salvando..." : "Salvar Refeição",
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
            className: "space-y-4",
            children:
              meals && meals.length > 0
                ? meals.map((mealItem) =>
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                      Card,
                      {
                        className: "border border-slate-200 shadow-sm",
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
                            className:
                              "flex flex-row items-center justify-between pb-2 bg-slate-50 border-b border-slate-100",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                                children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
                                    className: "text-sm font-bold text-[#003366]",
                                    children: mealItem.name,
                                  }),
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                                    className: "text-[11px] text-slate-500",
                                    children: format(new Date(mealItem.meal_date), "dd/MM/yyyy", {
                                      locale: ptBR,
                                    }),
                                  }),
                                ],
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                                variant: "ghost",
                                size: "sm",
                                className: "text-xs text-red-600 hover:bg-red-50",
                                onClick: () => handleDeleteMeal(mealItem.id),
                                children: "Remover",
                              }),
                            ],
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
                            className: "pt-3",
                            children:
                              mealItem.items && mealItem.items.length > 0
                                ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
                                    className: "space-y-2",
                                    children: mealItem.items.map((item) =>
                                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                                        "li",
                                        {
                                          className:
                                            "flex items-center justify-between text-xs border-b border-slate-100 pb-1",
                                          children: [
                                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
                                              className: "font-medium text-slate-800",
                                              children: [
                                                item.food?.name,
                                                " — ",
                                                item.quantity_grams,
                                                "g",
                                              ],
                                            }),
                                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
                                              className: "font-bold text-[#003366]",
                                              children: [
                                                Math.round(item.calculated_calories),
                                                " kcal",
                                              ],
                                            }),
                                          ],
                                        },
                                        item.id,
                                      ),
                                    ),
                                  })
                                : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                                    className: "text-xs text-slate-400 italic",
                                    children: "Nenhum alimento adicionado.",
                                  }),
                          }),
                        ],
                      },
                      mealItem.id,
                    ),
                  )
                : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                    className:
                      "rounded-lg border border-dashed border-slate-300 p-8 text-center bg-white space-y-2",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Utensils, {
                        className: "h-8 w-8 text-slate-300 mx-auto",
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                        className: "text-xs text-slate-500",
                        children: "Nenhuma refeição registrada na data de hoje.",
                      }),
                    ],
                  }),
          }),
        ],
      }),
    ],
  });
}
function MacroCard({ label, value }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
    className: "border border-slate-200 bg-white",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
      className: "p-4",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
          className: "text-[11px] font-semibold text-slate-500 uppercase",
          children: label,
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
          className: "mt-1 text-lg font-bold text-[#003366]",
          children: value,
        }),
      ],
    }),
  });
}
//#endregion
export { PatientDetailPage as component };
