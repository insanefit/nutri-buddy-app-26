/**
 * Modelos Reutilizáveis de Orientações Nutricionais Clínicas
 * Baseados no Guia Alimentar para a População Brasileira (Ministério da Saúde)
 */

export interface ClinicalOrientationCategory {
  id: string;
  title: string;
  source: string;
  items: string[];
}

export const OFFICIAL_CLINICAL_ORIENTATIONS: ClinicalOrientationCategory[] = [
  {
    id: "guia-alimentar-habitos",
    title: "Planejamento e Hábitos Alimentares Saudáveis",
    source: "Guia Alimentar para a População Brasileira (Ministério da Saúde)",
    items: [
      "Divida com os membros da família a responsabilidade pelo preparo das refeições.",
      "Faça da preparação das refeições e do ato de comer momentos de convivência e prazer.",
      "Reavalie o uso do tempo e identifique atividades que possam ceder espaço para o cuidado com a alimentação.",
      "Mantenha horários regulares para realizar suas refeições todos os dias.",
      "Evite beliscar nos intervalos entre as refeições principais.",
      "Coma devagar, mastigando bem e sem distrações (desconecte-se de celulares, TV e computadores durante as refeições).",
      "Procure comer em locais limpos, confortáveis e tranquilos.",
      "Sempre que possível, faça suas refeições na companhia de familiares ou amigos.",
      "Desenvolva e compartilhe habilidades culinárias no seu dia a dia.",
    ],
  },
  {
    id: "hidratacao-rotina",
    title: "Hidratação e Consumo de Água",
    source: "Recomendações Nutricionais Sesc",
    items: [
      "Mantenha uma garrafa de água sempre por perto durante a jornada de trabalho ou estudo.",
      "Dê preferência à água pura em vez de sucos industrializados, refrigerantes ou bebidas adoçadas.",
      "Observe a cor da urina ao longo do dia: uma coloração clara indica boa hidratação.",
    ],
  },
];
