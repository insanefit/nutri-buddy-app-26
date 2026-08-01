// Testes Automatizados de Fórmulas Clínicas (SBC/DBHA 2025 e SBD 2025) e Validação de LGPD
import { describe, it, expect } from "vitest";
import { z } from "zod";

// Fórmulas Clínicas Extraídas para Testes
function getBloodPressureClassification(systolic: number, diastolic: number) {
  if (!systolic || !diastolic || systolic <= 0 || diastolic <= 0) return null;

  const getSystolicGrade = (s: number): number => {
    if (s >= 180) return 4;
    if (s >= 160) return 3;
    if (s >= 140) return 2;
    if (s >= 120) return 1;
    return 0;
  };

  const getDiastolicGrade = (d: number): number => {
    if (d >= 110) return 4;
    if (d >= 100) return 3;
    if (d >= 90) return 2;
    if (d >= 80) return 1;
    return 0;
  };

  const sysGrade = getSystolicGrade(systolic);
  const diaGrade = getDiastolicGrade(diastolic);
  const finalGrade = Math.max(sysGrade, diaGrade);

  switch (finalGrade) {
    case 4:
      return "Estágio 3 / Crise";
    case 3:
      return "Estágio 2";
    case 2:
      return "Estágio 1";
    case 1:
      return "Pré-Hipertensão";
    case 0:
    default:
      return "Ótima / Normal";
  }
}

function getGlucoseClassification(glucose: number, type: "jejum" | "casual") {
  if (!glucose || glucose <= 0) return null;

  if (type === "jejum") {
    if (glucose < 100) return "Normoglicemia (Jejum < 100 mg/dL)";
    if (glucose <= 125) return "Glicemia de Jejum Alterada (100-125 mg/dL)";
    return "Hiperglicemia em Jejum (≥ 126 mg/dL - Suspeita de Diabetes)";
  } else {
    if (glucose < 140) return "Normoglicemia Casual (< 140 mg/dL)";
    if (glucose <= 199) return "Glicemia Casual Alterada (140-199 mg/dL)";
    return "Hiperglicemia Casual (≥ 200 mg/dL - Suspeita de Diabetes)";
  }
}

const lgpdSchema = z.object({
  lgpd_consent: z.boolean().refine((val) => val === true, {
    message: "É obrigatório aceitar o termo LGPD para cadastrar o paciente.",
  }),
});

describe("Validação de Fórmulas Clínicas e LGPD (Diretrizes SBC/SBD 2025)", () => {
  it("deve classificar 120/80 mmHg como Pré-Hipertensão conforme a DBHA/SBC 2025", () => {
    const res = getBloodPressureClassification(120, 80);
    expect(res).toBe("Pré-Hipertensão");
  });

  it("deve aplicar a regra de estágio máximo: 130/110 mmHg como Estágio 3 devido à PAD de 110", () => {
    const res = getBloodPressureClassification(130, 110);
    expect(res).toBe("Estágio 3 / Crise");
  });

  it("deve classificar 118/78 mmHg como Ótima / Normal", () => {
    const res = getBloodPressureClassification(118, 78);
    expect(res).toBe("Ótima / Normal");
  });

  it("deve classificar 145/88 mmHg como Estágio 1 devido à PAS de 145", () => {
    const res = getBloodPressureClassification(145, 88);
    expect(res).toBe("Estágio 1");
  });

  it("deve classificar Glicemia de Jejum 95 mg/dL como Normoglicemia", () => {
    const res = getGlucoseClassification(95, "jejum");
    expect(res).toContain("Normoglicemia");
  });

  it("deve classificar Glicemia de Jejum 110 mg/dL como Jejum Alterada", () => {
    const res = getGlucoseClassification(110, "jejum");
    expect(res).toContain("Glicemia de Jejum Alterada");
  });

  it("deve classificar Glicemia de Jejum 130 mg/dL como Suspeita de Diabetes", () => {
    const res = getGlucoseClassification(130, "jejum");
    expect(res).toContain("Suspeita de Diabetes");
  });

  it("deve rejeitar cadastro sem consentimento LGPD verdadeiro", () => {
    const valid = lgpdSchema.safeParse({ lgpd_consent: true });
    const invalid = lgpdSchema.safeParse({ lgpd_consent: false });
    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });
});
