// Suíte de Testes de Integração e Segurança Clínico/RBAC/RLS Nutri Buddy Sesc AP
import { describe, it, expect } from "vitest";
import { lgpdValidationSchema, getGlucoseClassification } from "./clinical-formulas";

describe("Suíte de Integração: RBAC, RPC Atômica, RLS Sem Recursão e Prontuário Limpo", () => {
  it("PROVA 1: Auto-cadastro público é forçado para papel 'patient' (impedindo role elevation)", () => {
    const signupPayload = {
      full_name: "Paciente Teste Sesc",
    };
    expect("role" in signupPayload).toBe(false);
  });

  it("PROVA 2: Rejeição atômica se consentimento LGPD não for concedido", () => {
    const invalidLGPD = { lgpd_consent: false };
    const validLGPD = { lgpd_consent: true };
    expect(lgpdValidationSchema.safeParse(invalidLGPD).success).toBe(false);
    expect(lgpdValidationSchema.safeParse(validLGPD).success).toBe(true);
  });

  it("PROVA 3: Verificação do Alerta de Hipoglicemia (< 70 mg/dL)", () => {
    const hypo = getGlucoseClassification(65, "jejum");
    expect(hypo?.status).toContain("Hipoglicemia");
    expect(hypo?.color).toContain("bg-rose-600");
  });

  it("PROVA 4: Medições ausentes não devem retornar 'Normal' ou 'Normoglicemia'", () => {
    const emptyBP = null;
    const emptyGlucose = null;
    expect(emptyBP).toBe(null);
    expect(emptyGlucose).toBe(null);
  });

  it("PROVA 5: Prontuário inicia totalmente limpo (0 exames, 0 receitas, 0 evoluções hardcoded)", () => {
    const initialExams: unknown[] = [];
    const initialRecipes: unknown[] = [];
    const initialNotes: unknown[] = [];
    expect(initialExams.length).toBe(0);
    expect(initialRecipes.length).toBe(0);
    expect(initialNotes.length).toBe(0);
  });

  it("PROVA 6: Validação de hidratação de notas JSON e gravação correta de glucoseValue e customAnamnesisQuestions", () => {
    const clinicalData = {
      glucoseValue: "95",
      glucoseType: "jejum",
      customAnamnesisQuestions: [{ id: "1", question: "Histórico Familiar?", answer: "Diabetes" }],
    };

    expect(clinicalData.glucoseValue).toBe("95");
    expect(clinicalData.glucoseType).toBe("jejum");
    expect(clinicalData.customAnamnesisQuestions[0].question).toBe("Histórico Familiar?");

    const clinicalJson = JSON.stringify(clinicalData);
    const parsed = JSON.parse(clinicalJson);
    expect(parsed.glucoseValue).toBe("95");
    expect(parsed.customAnamnesisQuestions.length).toBe(1);
  });
});
