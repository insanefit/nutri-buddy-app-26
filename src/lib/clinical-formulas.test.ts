// Testes Automatizados de Fórmulas Clínicas Reais (SBC/DBHA 2025 e SBD 2025) e Validação de LGPD
import { describe, it, expect } from "vitest";
import {
  getBloodPressureClassification,
  getGlucoseClassification,
  getImcClassification,
  lgpdValidationSchema,
} from "./clinical-formulas";

describe("Suíte de Testes da Implementação Clínica e LGPD (SBC & SBD 2025)", () => {
  it("deve classificar 120/80 mmHg como Pré-Hipertensão conforme a DBHA/SBC 2025", () => {
    const res = getBloodPressureClassification(120, 80);
    expect(res?.status).toContain("Pré-Hipertensão");
  });

  it("deve aplicar a regra de estágio máximo: 130/110 mmHg como Estágio 3 devido à PAD de 110", () => {
    const res = getBloodPressureClassification(130, 110);
    expect(res?.status).toContain("Estágio 3");
  });

  it("deve classificar 118/78 mmHg como Ótima / Normal", () => {
    const res = getBloodPressureClassification(118, 78);
    expect(res?.status).toContain("Ótima / Normal");
  });

  it("deve classificar 145/88 mmHg como Estágio 1 devido à PAS de 145", () => {
    const res = getBloodPressureClassification(145, 88);
    expect(res?.status).toContain("Estágio 1");
  });

  it("deve classificar Glicemia de Jejum 95 mg/dL como Normoglicemia", () => {
    const res = getGlucoseClassification(95, "jejum");
    expect(res?.status).toContain("Normoglicemia");
  });

  it("deve classificar Glicemia de Jejum 110 mg/dL como Jejum Alterada", () => {
    const res = getGlucoseClassification(110, "jejum");
    expect(res?.status).toContain("Jejum Alterada");
  });

  it("deve classificar Glicemia de Jejum 130 mg/dL como Suspeita de Diabetes", () => {
    const res = getGlucoseClassification(130, "jejum");
    expect(res?.status).toContain("Suspeita de Diabetes");
  });

  it("deve calcular classificação correta de IMC para 26.4 (Sobrepeso)", () => {
    const res = getImcClassification(26.4);
    expect(res.category).toContain("Sobrepeso");
  });

  it("deve rejeitar cadastro sem consentimento LGPD verdadeiro", () => {
    const valid = lgpdValidationSchema.safeParse({ lgpd_consent: true });
    const invalid = lgpdValidationSchema.safeParse({ lgpd_consent: false });
    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });
});
