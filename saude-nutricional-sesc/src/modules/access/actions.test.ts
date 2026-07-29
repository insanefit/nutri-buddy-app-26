import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createClientMock,
  redirectMock,
  signInWithPasswordMock,
} = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  redirectMock: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  signInWithPasswordMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("../../platform/supabase/server", () => ({
  createClient: createClientMock,
}));

import { signIn } from "./actions";

const initialState = { error: null };
const validCredentialFixture = "senha-segura-123";

function createLoginForm(email: string, password: string): FormData {
  const formData = new FormData();
  formData.set("email", email);
  formData.set("password", password);
  return formData;
}

describe("signIn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createClientMock.mockResolvedValue({
      auth: {
        signInWithPassword: signInWithPasswordMock,
      },
    });
  });

  it("rejects invalid form data before creating an auth client", async () => {
    const result = await signIn(
      initialState,
      createLoginForm("email-invalido", "curta"),
    );

    expect(result).toEqual({ error: "Informe um e-mail válido" });
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("returns one generic message for a rejected authentication", async () => {
    signInWithPasswordMock.mockResolvedValue({
      data: { user: null, session: null },
      error: new Error("user not found"),
    });

    const result = await signIn(
      initialState,
      createLoginForm(
        "nutricionista@example.test",
        "senha-segura-123",
      ),
    );

    expect(result).toEqual({ error: "Credenciais inválidas" });
  });

  it("returns the same generic message when the provider throws", async () => {
    signInWithPasswordMock.mockRejectedValue(
      new Error("authentication service unavailable"),
    );

    const result = await signIn(
      initialState,
      createLoginForm(
        "nutricionista@example.test",
        "senha-segura-123",
      ),
    );

    expect(result).toEqual({ error: "Credenciais inválidas" });
  });

  it("does not expose client initialization failures", async () => {
    createClientMock.mockRejectedValue(new Error("cookie storage failed"));

    const result = await signIn(
      initialState,
      createLoginForm(
        "nutricionista@example.test",
        "senha-segura-123",
      ),
    );

    expect(result).toEqual({ error: "Credenciais inválidas" });
  });

  it("redirects only after successful password authentication", async () => {
    signInWithPasswordMock.mockResolvedValue({
      data: {
        user: { id: "00000000-0000-4000-8000-000000000002" },
        session: { access_token: "not-inspected" },
      },
      error: null,
    });

    await expect(
      signIn(
        initialState,
        createLoginForm(
          "nutricionista@example.test",
          "senha-segura-123",
        ),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/inicio");
    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: "nutricionista@example.test",
      password: validCredentialFixture,
    });
  });
});
