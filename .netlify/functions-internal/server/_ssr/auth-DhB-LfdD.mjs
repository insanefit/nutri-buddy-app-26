import { r as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as SescLogo } from "./SescLogo-DAaqfixY.mjs";
import { g as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import {
  a as CardHeader,
  i as CardDescription,
  n as Card,
  o as CardTitle,
  r as CardContent,
  s as cn,
  t as Button,
} from "./card-DEk-bcO6.mjs";
import { n as Label, t as Input } from "./label-BOht4ZNO.mjs";
import { a as UserCheck, c as Shield, g as Building2 } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-Cf7FIzC3.mjs";
import { t as Route } from "./auth-I0xemxX8.mjs";
import {
  i as Trigger,
  n as List,
  r as Root2,
  t as Content,
} from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-DhB-LfdD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) =>
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
    ref,
    className: cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className,
    ),
    ...props,
  }),
);
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) =>
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className,
    ),
    ...props,
  }),
);
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) =>
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    ),
    ...props,
  }),
);
TabsContent.displayName = Content.displayName;
function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate({ from: "/auth" });
  const [email, setEmail] = (0, import_react.useState)("");
  const [password, setPassword] = (0, import_react.useState)("");
  const [fullName, setFullName] = (0, import_react.useState)("");
  const [role, setRole] = (0, import_react.useState)("nutritionist");
  const [loading, setLoading] = (0, import_react.useState)(false);
  const handleEmailAuth = async (type) => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    try {
      if (type === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: fullName,
              role,
            },
          },
        });
        if (error) throw error;
        if (data.user)
          await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: fullName || cleanEmail.split("@")[0],
            role: "nutritionist",
          });
        toast.success("Conta cadastrada! Verifique seu e-mail corporativo para confirmar.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });
        if (error) {
          console.error("[Login Auth Error]:", error);
          if (error.message.includes("Invalid login credentials"))
            throw new Error(
              "Credenciais incorretas. Use o e-mail mtiago@sescamapa.com.br e a senha Sesc@Amapa2026",
            );
          throw error;
        }
        if (data.session || data.user) {
          toast.success("Acesso autorizado!");
          window.location.href = "/app";
        }
      }
    } catch (err) {
      toast.error(err.message || "Erro de conexão ao autenticar.");
    } finally {
      setLoading(false);
    }
  };
  const handleQuickLogin = async (quickEmail) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: quickEmail,
        password: "Sesc@Amapa2026",
      });
      if (error) throw error;
      if (data.session || data.user) {
        toast.success("Acesso autorizado!");
        window.location.href = "/app";
      }
    } catch (err) {
      toast.error(err.message || "Erro no acesso rápido.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
    className: "flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-slate-50",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
      className:
        "w-full max-w-md border-t-8 border-t-[#003366] border-slate-200 shadow-lg bg-white",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
          className: "text-center pb-4",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
              className: "mx-auto mb-2 flex justify-center",
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SescLogo, {
                className: "h-14",
              }),
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
              className: "text-xl font-bold text-[#003366] mt-2",
              children: "Saúde Nutricional",
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
              className: "text-xs text-slate-600 mt-1",
              children: "Prontuário Clínico & Sistema de Gestão",
            }),
          ],
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
              value: mode,
              onValueChange: (value) =>
                navigate({
                  to: "/auth",
                  search: { mode: value },
                }),
              className: "w-full",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
                  className: "grid w-full grid-cols-2 bg-slate-100 p-1 rounded-md mb-4",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
                      value: "signin",
                      className:
                        "data-[state=active]:bg-[#003366] data-[state=active]:text-white font-medium text-xs py-2",
                      children: "Acessar Conta",
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
                      value: "signup",
                      className:
                        "data-[state=active]:bg-[#003366] data-[state=active]:text-white font-medium text-xs py-2",
                      children: "Novo Profissional",
                    }),
                  ],
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
                  value: "signin",
                  className: "space-y-4",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
                      onSubmit: (e) => {
                        e.preventDefault();
                        handleEmailAuth("signin");
                      },
                      className: "space-y-4",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                          className: "space-y-1.5",
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                              htmlFor: "email",
                              className: "text-xs font-semibold text-slate-700",
                              children: "E-mail Institucional",
                            }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                              id: "email",
                              type: "email",
                              placeholder: "profissional@sescamapa.com.br",
                              value: email,
                              onChange: (e) => setEmail(e.target.value),
                              required: true,
                              className:
                                "border-slate-300 focus:border-[#003366] focus:ring-1 focus:ring-[#003366]",
                            }),
                          ],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                          className: "space-y-1.5",
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                              htmlFor: "password",
                              className: "text-xs font-semibold text-slate-700",
                              children: "Senha",
                            }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                              id: "password",
                              type: "password",
                              placeholder: "••••••••",
                              value: password,
                              onChange: (e) => setPassword(e.target.value),
                              required: true,
                              className:
                                "border-slate-300 focus:border-[#003366] focus:ring-1 focus:ring-[#003366]",
                            }),
                          ],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                          type: "submit",
                          className:
                            "w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-2 shadow transition-colors",
                          disabled: loading,
                          children: loading ? "Autenticando..." : "Entrar no Sistema",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                      className: "pt-2 space-y-2",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                          className: "relative flex py-1 items-center",
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                              className: "flex-grow border-t border-slate-200",
                            }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                              className:
                                "flex-shrink mx-2 text-[10px] uppercase font-bold text-slate-400",
                              children: "Ou Acesso Rápido Sesc",
                            }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                              className: "flex-grow border-t border-slate-200",
                            }),
                          ],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                          type: "button",
                          variant: "outline",
                          onClick: () => handleQuickLogin("mtiago@sescamapa.com.br"),
                          className:
                            "w-full border-[#003366] text-[#003366] hover:bg-blue-50 text-xs font-semibold py-2",
                          disabled: loading,
                          children: "⚡ Entrar com 1-Clique (Coordenação Sesc)",
                        }),
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
                  value: "signup",
                  className: "space-y-4",
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
                    onSubmit: (e) => {
                      e.preventDefault();
                      handleEmailAuth("signup");
                    },
                    className: "space-y-4",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                        className: "space-y-1.5",
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                            htmlFor: "fullname",
                            className: "text-xs font-semibold text-slate-700",
                            children: "Nome Completo",
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                            id: "fullname",
                            type: "text",
                            placeholder: "Dra. Mariana Silva",
                            value: fullName,
                            onChange: (e) => setFullName(e.target.value),
                            required: true,
                            className:
                              "border-slate-300 focus:border-[#003366] focus:ring-1 focus:ring-[#003366]",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                        className: "space-y-1.5",
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                            htmlFor: "signup-email",
                            className: "text-xs font-semibold text-slate-700",
                            children: "E-mail Institucional",
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                            id: "signup-email",
                            type: "email",
                            placeholder: "profissional@sescamapa.com.br",
                            value: email,
                            onChange: (e) => setEmail(e.target.value),
                            required: true,
                            className:
                              "border-slate-300 focus:border-[#003366] focus:ring-1 focus:ring-[#003366]",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                        className: "space-y-1.5",
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                            htmlFor: "signup-password",
                            className: "text-xs font-semibold text-slate-700",
                            children: "Senha de Acesso",
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                            id: "signup-password",
                            type: "password",
                            placeholder: "Mínimo 6 caracteres",
                            value: password,
                            onChange: (e) => setPassword(e.target.value),
                            required: true,
                            className:
                              "border-slate-300 focus:border-[#003366] focus:ring-1 focus:ring-[#003366]",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                        className: "space-y-1.5",
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
                            className: "text-xs font-semibold text-slate-700",
                            children: "Perfil Profissional",
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                            className: "grid grid-cols-2 gap-2",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
                                type: "button",
                                onClick: () => setRole("nutritionist"),
                                className: `flex items-center justify-center gap-1.5 p-2 rounded border text-xs font-medium transition-colors ${role === "nutritionist" ? "border-[#003366] bg-blue-50 text-[#003366] font-bold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`,
                                children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, {
                                    className: "h-3.5 w-3.5",
                                  }),
                                  "Nutricionista",
                                ],
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
                                type: "button",
                                onClick: () => setRole("coordinator"),
                                className: `flex items-center justify-center gap-1.5 p-2 rounded border text-xs font-medium transition-colors ${role === "coordinator" ? "border-[#003366] bg-blue-50 text-[#003366] font-bold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`,
                                children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, {
                                    className: "h-3.5 w-3.5",
                                  }),
                                  "Coordenador",
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                        type: "submit",
                        className:
                          "w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-2 shadow transition-colors",
                        disabled: loading,
                        children: loading ? "Cadastrando..." : "Cadastrar Profissional",
                      }),
                    ],
                  }),
                }),
              ],
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
              className: "mt-6 pt-4 border-t border-slate-100 text-center space-y-2",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                  className:
                    "flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
                      className: "h-3.5 w-3.5 text-[#003366]",
                    }),
                    "Acesso individual Sesc Amapá",
                  ],
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                  className: "text-[11px] text-slate-500 leading-tight",
                  children: [
                    "Em caso de dúvidas sobre credenciamento de acesso, entre em contato com a coordenação:",
                    " ",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
                      href: "mailto:mtiago@sescamapa.com.br",
                      className: "font-semibold text-[#003366] hover:underline",
                      children: "mtiago@sescamapa.com.br",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
//#endregion
export { AuthPage as component };
