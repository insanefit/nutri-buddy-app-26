import { createFileRoute, Link } from "@tanstack/react-router";
import { Apple, ClipboardList, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NutriAvalia — Avaliação nutricional para profissionais" },
      {
        name: "description",
        content:
          "Acompanhe pacientes, registre diários alimentares e avalie a ingestão nutricional de forma simples e minimalista.",
      },
      { property: "og:title", content: "NutriAvalia — Avaliação nutricional para profissionais" },
      {
        property: "og:description",
        content:
          "Acompanhe pacientes, registre diários alimentares e avalie a ingestão nutricional.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Avaliação nutricional sem complicação
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            NutriAvalia ajuda nutricionistas a acompanhar pacientes, registrar diários alimentares e
            visualizar a ingestão de macronutrientes em um só lugar.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/auth"
              search={{ mode: "signin" }}
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Começar agora
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="inline-flex items-center justify-center rounded-full border border-input bg-background px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Criar conta gratuita
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <FeatureCard
            icon={<Users className="h-6 w-6 text-primary" />}
            title="Gestão de pacientes"
            description="Cadastre e acompanhe seus pacientes com perfis simples e organizados."
          />
          <FeatureCard
            icon={<ClipboardList className="h-6 w-6 text-primary" />}
            title="Diário alimentar"
            description="Registre refeições e alimentos consumidos ao longo do dia com poucos cliques."
          />
          <FeatureCard
            icon={<Apple className="h-6 w-6 text-primary" />}
            title="Banco de alimentos"
            description="Utilize alimentos pré-cadastrados ou crie seus próprios itens personalizados."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-card-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
