import { describe, expect, it } from "vitest";
import { signInSchema, unitIdSchema } from "./schemas";

const validCredentialFixture = "senha-segura-123";

describe("access schemas", () => {
  it("accepts an institutional login payload", () => {
    expect(
      signInSchema.parse({
        email: "nutricionista@example.test",
        password: validCredentialFixture,
      }),
    ).toEqual({
      email: "nutricionista@example.test",
      password: validCredentialFixture,
    });
  });

  it("returns the expected validation error for an invalid email", () => {
    const result = signInSchema.safeParse({
      email: "email-invalido",
      password: validCredentialFixture,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Informe um e-mail válido");
  });

  it("requires a password with at least twelve characters", () => {
    const result = signInSchema.safeParse({
      email: "nutricionista@example.test",
      password: "curta",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "A senha deve ter pelo menos 12 caracteres",
    );
  });

  it("rejects malformed unit identifiers", () => {
    expect(unitIdSchema.safeParse("../outra-unidade").success).toBe(false);
  });
});
