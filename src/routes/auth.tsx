import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, UserCheck, Building2 } from "lucide-react";
import { toast } from "sonner";
import { SescLogo } from "@/components/SescLogo";

export const Route = createFileRoute("/auth")({
  validateSearch: (search) => ({
    mode: (search.mode as "signin" | "signup") || "signin",
  }),
  head: () => ({
    meta: [
      { title: "Entrar — Saúde Nutricional Sesc" },
      {
        name: "description",
        content:
          "Acesso individual e seguro ao prontuário clínico e sistema de Saúde Nutricional Sesc.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate({ from: "/auth" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"nutritionist" | "coordinator">("nutritionist");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (type: "signin" | "signup") => {
    setLoading(true);
    try {
      if (type === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: fullName,
              role: role,
            },
          },
        });
        if (error) throw error;
        if (data.user) {
          // Salva perfil inicial
          await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: fullName || email.split("@")[0],
            role: role,
          });
        }
        toast.success("Conta cadastrada! Verifique seu e-mail corporativo para confirmar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Acesso autorizado!");
        navigate({ to: "/app" });
      }
    } catch (err: any) {
      toast.error(err.message || "Erro na autenticação. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-slate-50">
      <Card className="w-full max-w-md border-t-8 border-t-[#003366] border-slate-200 shadow-lg bg-white">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-2 flex justify-center">
            <SescLogo className="h-14" />
          </div>
          <CardTitle className="text-xl font-bold text-[#003366] mt-2">Saúde Nutricional</CardTitle>
          <CardDescription className="text-xs text-slate-600 mt-1">
            Prontuário Clínico & Sistema de Gestão
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs
            value={mode}
            onValueChange={(value) =>
              navigate({ to: "/auth", search: { mode: value as "signin" | "signup" } })
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-md mb-4">
              <TabsTrigger
                value="signin"
                className="data-[state=active]:bg-[#003366] data-[state=active]:text-white font-medium text-xs py-2"
              >
                Acessar Conta
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-[#003366] data-[state=active]:text-white font-medium text-xs py-2"
              >
                Novo Profissional
              </TabsTrigger>
            </TabsList>

            {/* Form Entrar */}
            <TabsContent value="signin" className="space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEmailAuth("signin");
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                    E-mail Institucional
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="profissional@sescamapa.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-slate-300 focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-slate-300 focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-2 shadow transition-colors"
                  disabled={loading}
                >
                  {loading ? "Autenticando..." : "Entrar no Sistema"}
                </Button>
              </form>
            </TabsContent>

            {/* Form Cadastrar */}
            <TabsContent value="signup" className="space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEmailAuth("signup");
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="fullname" className="text-xs font-semibold text-slate-700">
                    Nome Completo
                  </Label>
                  <Input
                    id="fullname"
                    type="text"
                    placeholder="Dra. Mariana Silva"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="border-slate-300 focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-xs font-semibold text-slate-700">
                    E-mail Institucional
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="profissional@sescamapa.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-slate-300 focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-xs font-semibold text-slate-700">
                    Senha de Acesso
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-slate-300 focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                  />
                </div>

                {/* Seleção de Perfil Institucional */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Perfil Profissional
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("nutritionist")}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded border text-xs font-medium transition-colors ${
                        role === "nutritionist"
                          ? "border-[#003366] bg-blue-50 text-[#003366] font-bold"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Nutricionista
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("coordinator")}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded border text-xs font-medium transition-colors ${
                        role === "coordinator"
                          ? "border-[#003366] bg-blue-50 text-[#003366] font-bold"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      Coordenador
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-2 shadow transition-colors"
                  disabled={loading}
                >
                  {loading ? "Cadastrando..." : "Cadastrar Profissional"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Rodapé de Suporte Institucional */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
              <Shield className="h-3.5 w-3.5 text-[#003366]" />
              Acesso individual Sesc Amapá
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Em caso de dúvidas sobre credenciamento de acesso, entre em contato com a coordenação:{" "}
              <a
                href="mailto:mtiago@sescamapa.com.br"
                className="font-semibold text-[#003366] hover:underline"
              >
                mtiago@sescamapa.com.br
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
