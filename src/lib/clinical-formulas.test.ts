// Testes Automatizados das Fórmulas Clínicas Reais (SBC/DBHA 2025 e SBD 2025) e Validação LGPD
import { describe, it, expect } from "vitest";
import {
  getBloodPressureClassification,
  getGlucoseClassification,
  getImcClassification,
  lgpdValidationSchema,
} from "./clinical-formulas";

describe("Suíte de Testes Clínicos SBD 2025 e SBC 2025 (Limites exatos de Glicemia e PA)", () => {
  it("69 mg/dL -> Hipoglicemia (< 70 mg/dL)", () => {
    const res = getGlucoseClassification(69, "jejum");
    expect(res?.status).toContain("Hipoglicemia");
  });

  it("70 mg/dL -> Normoglicemia em Jejum (70-99 mg/dL)", () => {
    const res = getGlucoseClassification(70, "jejum");
    expect(res?.status).toContain("Normoglicemia");
  });

  it("99 mg/dL -> Normoglicemia em Jejum (70-99 mg/dL)", () => {
    const res = getGlucoseClassification(99, "jejum");
    expect(res?.status).toContain("Normoglicemia");
  });

  it("100 mg/dL -> Glicemia de Jejum Alterada (100-125 mg/dL)", () => {
    const res = getGlucoseClassification(100, "jejum");
    expect(res?.status).toContain("Glicemia de Jejum Alterada");
  });

  it("125 mg/dL -> Glicemia de Jejum Alterada (100-125 mg/dL)", () => {
    const res = getGlucoseClassification(125, "jejum");
    expect(res?.status).toContain("Glicemia de Jejum Alterada");
  });

  it("126 mg/dL -> Hiperglicemia em Jejum (≥ 126 mg/dL - Suspeita de Diabetes)", () => {
    const res = getGlucoseClassification(126, "jejum");
    expect(res?.status).toContain("Hiperglicemia em Jejum");
  });

  it("139 mg/dL -> Normoglicemia Casual (70-139 mg/dL)", () => {
    const res = getGlucoseClassification(139, "casual");
    expect(res?.status).toContain("Normoglicemia Casual");
  });

  it("140 mg/dL -> Glicemia Casual Alterada (140-199 mg/dL)", () => {
    const res = getGlucoseClassification(140, "casual");
    expect(res?.status).toContain("Glicemia Casual Alterada");
  });

  it("199 mg/dL -> Glicemia Casual Alterada (140-199 mg/dL)", () => {
    const res = getGlucoseClassification(199, "casual");
    expect(res?.status).toContain("Glicemia Casual Alterada");
  });

  it("200 mg/dL -> Hiperglicemia Casual (≥ 200 mg/dL - Suspeita de Diabetes)", () => {
    const res = getGlucoseClassification(200, "casual");
    expect(res?.status).toContain("Hiperglicemia Casual");
  });

  it("deve classificar 120/80 mmHg como Pré-Hipertensão conforme a DBHA/SBC 2025", () => {
    const res = getBloodPressureClassification(120, 80);
    expect(res?.status).toContain("Pré-Hipertensão");
  });

  it("deve aplicar a regra de estágio máximo: 130/110 mmHg como Estágio 3 devido à PAD de 110", () => {
    const res = getBloodPressureClassification(130, 110);
    expect(res?.status).toContain("Estágio 3");
  });

  it("deve calcular classificação de IMC para 26.4 como Sobrepeso", () => {
    const res = getImcClassification(26.4);
    expect(res.text).toContain("Sobrepeso");
  });

  it("deve validar consentimento LGPD obrigatório no schema", () => {
    expect(lgpdValidationSchema.safeParse({ lgpd_consent: true }).success).toBe(true);
    expect(lgpdValidationSchema.safeParse({ lgpd_consent: false }).success).toBe(false);
  });
});
