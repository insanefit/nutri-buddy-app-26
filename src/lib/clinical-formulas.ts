import { z } from "zod";

export function getBloodPressureClassification(systolic: number, diastolic: number) {
  if (!systolic || !diastolic || systolic <= 0 || diastolic <= 0) return null;

  const getSystolicGrade = (s: number): number => {
    if (s >= 180) return 4; // Estágio 3 / Crise
    if (s >= 160) return 3; // Estágio 2
    if (s >= 140) return 2; // Estágio 1
    if (s >= 120) return 1; // Pré-hipertensão (PAS 120-139)
    return 0; // Ótima/Normal (PAS < 120)
  };

  const getDiastolicGrade = (d: number): number => {
    if (d >= 110) return 4; // Estágio 3 / Crise
    if (d >= 100) return 3; // Estágio 2
    if (d >= 90) return 2; // Estágio 1
    if (d >= 80) return 1; // Pré-hipertensão (PAD 80-89)
    return 0; // Ótima/Normal (PAD < 80)
  };

  const sysGrade = getSystolicGrade(systolic);
  const diaGrade = getDiastolicGrade(diastolic);
  const finalGrade = Math.max(sysGrade, diaGrade);

  switch (finalGrade) {
    case 4:
      return {
        status: "Hipertensão Estágio 3 / Crise (PAS ≥180 ou PAD ≥110 mmHg)",
        description: "CRISE HIPERTENSIVA. Encaminhar de urgência ao atendimento médico.",
        color: "text-white bg-rose-600 border-rose-700 font-extrabold animate-pulse",
      };
    case 3:
      return {
        status: "Hipertensão Estágio 2 (PAS 160-179 ou PAD 100-109 mmHg)",
        description:
          "Pressão arterial significativamente elevada. Consulta médica e nutricional contínua.",
        color: "text-rose-900 bg-rose-100 border-rose-300 font-bold",
      };
    case 2:
      return {
        status: "Hipertensão Estágio 1 (PAS 140-159 ou PAD 90-99 mmHg)",
        description: "Pressão arterial elevada. Recomenda-se acompanhamento médico e nutricional.",
        color: "text-orange-900 bg-orange-100 border-orange-300 font-bold",
      };
    case 1:
      return {
        status: "Pré-Hipertensão (PAS 120-139 ou PAD 80-89 mmHg)",
        description:
          "Faixa de pré-hipertensão conforme a DBHA/SBC 2025. Orientar hábitos saudáveis e readequação nutricional.",
        color: "text-amber-800 bg-amber-50 border-amber-300 font-semibold",
      };
    case 0:
    default:
      return {
        status: "Ótima / Normal (PAS < 120 e PAD < 80 mmHg)",
        description: "Pressão arterial em nível ideal.",
        color: "text-emerald-700 bg-emerald-50 border-emerald-200 font-semibold",
      };
  }
}

export function getGlucoseClassification(glucose: number, type: "jejum" | "casual") {
  if (!glucose || glucose <= 0) return null;

  if (type === "jejum") {
    if (glucose < 100) {
      return {
        status: "Normoglicemia (Jejum < 100 mg/dL)",
        description: "Glicemia de jejum dentro dos padrões normais de referência (SBD 2025).",
        color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      };
    }
    if (glucose <= 125) {
      return {
        status: "Glicemia de Jejum Alterada (100-125 mg/dL)",
        description:
          "Atenção: Pré-diabetes / Glicemia de jejum alterada. Recomenda-se acompanhamento nutricional.",
        color: "text-amber-800 bg-amber-50 border-amber-300 font-semibold",
      };
    }
    return {
      status: "Hiperglicemia em Jejum (≥ 126 mg/dL - Suspeita de Diabetes)",
      description:
        "Alerta: Nível compativel com suspeita de Diabetes Mellitus. Encaminhar para teste oral de tolerância a glicose.",
      color: "text-rose-900 bg-rose-100 border-rose-300 font-bold",
    };
  } else {
    if (glucose < 140) {
      return {
        status: "Normoglicemia Casual (< 140 mg/dL)",
        description: "Glicemia casual dentro dos limites de tolerância.",
        color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      };
    }
    if (glucose <= 199) {
      return {
        status: "Glicemia Casual Alterada (140-199 mg/dL)",
        description:
          "Atenção: Glicemia casual elevada. Recomenda-se monitoramento e teste confirmatório.",
        color: "text-amber-900 bg-amber-100 border-amber-300 font-bold",
      };
    }
    return {
      status: "Hiperglicemia Casual (≥ 200 mg/dL - Suspeita de Diabetes)",
      description:
        "Alerta: Glicemia casual ≥ 200 mg/dL com sintomas. Necessita controle clínico urgente.",
      color: "text-rose-900 bg-rose-100 border-rose-300 font-bold",
    };
  }
}

export function getImcClassification(imc: number) {
  if (imc < 18.5)
    return {
      category: "Abaixo do peso",
      text: "Baixo Peso",
      color: "text-amber-600 bg-amber-50 border-amber-200",
    };
  if (imc < 25.0)
    return {
      category: "Eutrofia (Peso adequado)",
      text: "Peso Adequado (Eutrofia)",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    };
  if (imc < 30.0)
    return {
      category: "Sobrepeso (Pré-obesidade)",
      text: "Sobrepeso",
      color: "text-amber-700 bg-amber-50 border-amber-200",
    };
  if (imc < 35.0)
    return {
      category: "Obesidade Grau I",
      text: "Obesidade Grau I",
      color: "text-orange-700 bg-orange-50 border-orange-200 font-bold",
    };
  if (imc < 40.0)
    return {
      category: "Obesidade Grau II",
      text: "Obesidade Grau II",
      color: "text-rose-700 bg-rose-50 border-rose-200 font-bold",
    };
  return {
    category: "Obesidade Grau III (Mórbida)",
    text: "Obesidade Grau III",
    color: "text-rose-900 bg-rose-100 border-rose-300 font-extrabold",
  };
}

export const lgpdValidationSchema = z.object({
  lgpd_consent: z.boolean().refine((val) => val === true, {
    message: "É obrigatório aceitar o termo LGPD para cadastrar o paciente.",
  }),
});
