import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/orientations")({
  component: OrientationsPage,
});

export const CLINICAL_ORIENTATIONS = [
  {
    number: "01",
    title: "Divisão de Responsabilidades",
    description:
      "Divida com os membros de sua família a responsabilidade por todas as atividades domésticas relacionadas ao preparo de refeições.",
  },
  {
    number: "02",
    title: "Convivência e Prazer",
    description:
      "Faça da preparação de refeições e do ato de comer momentos privilegiados de convivência em família e prazer.",
  },
  {
    number: "03",
    title: "Gestão do Tempo",
    description:
      "Reavalie como você tem usado o seu tempo e identifique quais atividades poderiam ceder espaço para a alimentação.",
  },
  {
    number: "04",
    title: "Regularidade de Horários",
    description: "Procure fazer suas refeições em horários semelhantes todos os dias.",
  },
  {
    number: "05",
    title: "Atenção aos Intervalos",
    description: "Evite 'beliscar' nos intervalos entre as refeições principais.",
  },
  {
    number: "06",
    title: "Alimentação Consciente (Mindful Eating)",
    description:
      "Coma sempre devagar e desfrute o que está comendo, sem se envolver em outra atividade (desconecte-se de celulares, TV e computadores).",
  },
  {
    number: "07",
    title: "Ambiente Confortável",
    description:
      "Procure comer em locais limpos, confortáveis e tranquilos, e onde não haja estímulo para o consumo de quantidades ilimitadas.",
  },
  {
    number: "08",
    title: "Refeições Acompanhadas",
    description: "Sempre que possível, coma na companhia de familiares ou amigos.",
  },
  {
    number: "09",
    title: "Habilidades Culinárias",
    description: "Desenvolva e compartilhe habilidades culinárias no dia a dia com sua família.",
  },
];

function OrientationsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Banner de Cabeçalho Sesc */}
      <div className="rounded-lg bg-[#003366] p-6 text-white shadow-md border-l-8 border-[#FFCC00]">
        <span className="text-xs uppercase tracking-widest font-bold text-amber-300">
          Diretrizes Oficiais — Ministério da Saúde
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold mt-1">
          Orientações para Alimentação Saudável e Atenta
        </h1>
        <p className="text-sm text-blue-100 mt-2 max-w-3xl leading-relaxed">
          Guia prático de hábitos alimentares e planejamento de rotina para nutricionistas
          prescreverem e anexarem aos prontuários dos pacientes do Sesc.
        </p>
      </div>

      {/* Grid de Orientações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CLINICAL_ORIENTATIONS.map((item) => (
          <div
            key={item.number}
            className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 bg-[#003366] text-[#FFCC00] font-black text-xs px-3 py-1 rounded-bl-lg">
              #{item.number}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#003366] mb-2 pr-8">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
              Saúde Nutricional Sesc
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
