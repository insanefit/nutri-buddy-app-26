import { r as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import {
  i as createPatient,
  o as deletePatient,
  u as getPatients,
} from "./nutrition.functions-BRebx5zk.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import {
  a as CardHeader,
  n as Card,
  o as CardTitle,
  r as CardContent,
  t as Button,
} from "./card-DEk-bcO6.mjs";
import { n as Label, t as Input } from "./label-BOht4ZNO.mjs";
import { d as FileText, i as User, s as Trash2, u as Plus } from "../_libs/lucide-react.mjs";
import {
  a as DialogTrigger,
  i as DialogTitle,
  n as DialogContent,
  r as DialogHeader,
  t as Dialog,
} from "./dialog-B9RkeSj-.mjs";
import { t as useSuspenseQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/patients-bVba195G.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PatientsPage() {
  const { data: patients, refetch } = useSuspenseQuery({
    queryKey: ["patients"],
    queryFn: () => getPatients({ data: void 0 }),
  });
  const [open, setOpen] = (0, import_react.useState)(false);
  const [name, setName] = (0, import_react.useState)("");
  const [email, setEmail] = (0, import_react.useState)("");
  const [calorieGoal, setCalorieGoal] = (0, import_react.useState)("2000");
  const [loading, setLoading] = (0, import_react.useState)(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPatient({
        data: {
          patient_email: email,
          full_name: name,
          daily_calorie_goal: Number(calorieGoal) || 2e3,
        },
      });
      toast.success("Paciente cadastrado no prontuário Sesc!");
      setName("");
      setEmail("");
      setCalorieGoal("2000");
      setOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message || "Erro ao cadastrar paciente");
    } finally {
      setLoading(false);
    }
  };
  const handleDeletePatient = async (patientId, patientName) => {
    if (!confirm(`Tem certeza que deseja excluir o prontuário de ${patientName}?`)) return;
    try {
      await deletePatient({ data: patientId });
      toast.success("Prontuário do paciente excluído");
      refetch();
    } catch (err) {
      toast.error(err.message || "Erro ao excluir paciente");
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className:
          "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
                className: "text-2xl font-bold text-[#003366]",
                children: "Prontuários dos Pacientes",
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                className: "mt-1 text-xs text-slate-600",
                children:
                  "Cadastre, acompanhe avaliações antropométricas, IMC e prescrições alimentares Sesc",
              }),
            ],
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
            open,
            onOpenChange: setOpen,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
                asChild: true,
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
                  className: "bg-[#003366] hover:bg-[#002244] text-white font-semibold",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
                      className: "h-4 w-4 mr-1.5",
                    }),
                    "Novo Paciente",
                  ],
                }),
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
                className: "max-w-md",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
                      className: "text-lg font-bold text-[#003366]",
                      children: "Cadastrar Novo Paciente Sesc",
                    }),
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
                    onSubmit: handleSubmit,
                    className: "space-y-4 pt-2",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                        className: "space-y-1.5",
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                            htmlFor: "name",
                            className: "text-xs font-semibold text-slate-700",
                            children: "Nome Completo",
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                            id: "name",
                            value: name,
                            onChange: (e) => setName(e.target.value),
                            placeholder: "Maria das Dores Silva",
                            required: true,
                          }),
                        ],
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                        className: "space-y-1.5",
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                            htmlFor: "email",
                            className: "text-xs font-semibold text-slate-700",
                            children: "E-mail de Contato / Cadastro",
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                            id: "email",
                            type: "email",
                            value: email,
                            onChange: (e) => setEmail(e.target.value),
                            placeholder: "paciente@exemplo.com",
                            required: true,
                          }),
                        ],
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                        className: "space-y-1.5",
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                            htmlFor: "calorieGoal",
                            className: "text-xs font-semibold text-slate-700",
                            children: "Meta Calórica Diária (kcal)",
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                            id: "calorieGoal",
                            type: "number",
                            value: calorieGoal,
                            onChange: (e) => setCalorieGoal(e.target.value),
                            placeholder: "2000",
                            required: true,
                          }),
                        ],
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                        type: "submit",
                        className: "w-full bg-[#003366] hover:bg-[#002244] text-white font-bold",
                        disabled: loading,
                        children: loading ? "Salvando..." : "Salvar Prontuário",
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
        children: patients?.map((patientItem) => {
          const patientName = patientItem.patient?.full_name || "Paciente sem nome";
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            Card,
            {
              className:
                "border border-slate-200 hover:border-[#003366] transition-all shadow-sm flex flex-col justify-between",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
                  className:
                    "pb-3 border-b border-slate-100 flex flex-row items-center justify-between",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                      className: "flex items-center gap-2 overflow-hidden",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                          className:
                            "h-9 w-9 rounded-full bg-blue-50 text-[#003366] font-bold flex items-center justify-center text-sm shrink-0",
                          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, {
                            className: "h-4 w-4",
                          }),
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
                          className: "text-sm font-bold text-[#003366] truncate",
                          children: patientName,
                        }),
                      ],
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                      variant: "ghost",
                      size: "icon",
                      className:
                        "h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0",
                      title: "Excluir paciente",
                      onClick: () => handleDeletePatient(patientItem.id, patientName),
                      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
                        className: "h-4 w-4",
                      }),
                    }),
                  ],
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
                  className: "pt-4 space-y-3",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                      className: "text-xs text-slate-600 space-y-1",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                              className: "font-semibold text-slate-700",
                              children: "Meta:",
                            }),
                            " ",
                            patientItem.daily_calorie_goal || 2e3,
                            " kcal/dia",
                          ],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                          className: "text-[11px] text-slate-400",
                          children: [
                            "Cadastrado em: ",
                            new Date(patientItem.created_at).toLocaleDateString("pt-BR"),
                          ],
                        }),
                      ],
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
                      to: "/app/patients/$id",
                      params: { id: patientItem.id },
                      className:
                        "w-full border border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white transition-colors rounded-md py-2 px-3 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm block text-center",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
                          className: "h-3.5 w-3.5 inline",
                        }),
                        "Abrir Prontuário Clínico",
                      ],
                    }),
                  ],
                }),
              ],
            },
            patientItem.id,
          );
        }),
      }),
      (!patients || patients.length === 0) &&
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className:
            "mt-12 rounded-lg border-2 border-dashed border-slate-300 p-12 text-center bg-white space-y-3",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, {
              className: "h-10 w-10 text-slate-300 mx-auto",
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
              className: "text-sm text-slate-600 font-medium",
              children: "Nenhum paciente cadastrado no momento.",
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
              className: "text-xs text-slate-400",
              children: [
                "Clique no botão ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
                  children: '"Novo Paciente"',
                }),
                " acima para criar a primeira ficha clínica.",
              ],
            }),
          ],
        }),
    ],
  });
}
//#endregion
export { PatientsPage as component };
