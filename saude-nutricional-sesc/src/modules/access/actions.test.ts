import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createClientMock,
  loadActorMock,
  revalidatePathMock,
  requireCoordinatorMock,
  redirectMock,
  rpcMock,
  signInWithPasswordMock,
} = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  loadActorMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  requireCoordinatorMock: vi.fn((actor: { role: string }) => {
    if (actor.role !== "coordinator") {
      throw new Error("FORBIDDEN");
    }
    return actor;
  }),
  redirectMock: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  rpcMock: vi.fn(),
  signInWithPasswordMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("../../platform/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("./actor", () => ({
  loadActor: loadActorMock,
}));

vi.mock("./authorization", () => ({
  requireCoordinator: requireCoordinatorMock,
}));

import { grantAccess, revokeAccess, signIn } from "./actions";

const initialState = { error: null };
const validCredentialFixture = "senha-segura-123";
const coordinator = Object.freeze({
  userId: "00000000-0000-4000-8000-000000000001",
  fullName: "Coordenação Teste",
  role: "coordinator",
  primaryUnitId: "10000000-0000-4000-8000-000000000001",
  accessibleUnitIds: Object.freeze([
    "10000000-0000-4000-8000-000000000001",
    "10000000-0000-4000-8000-000000000002",
  ]),
});
const nutritionist = Object.freeze({
  ...coordinator,
  userId: "00000000-0000-4000-8000-000000000002",
  fullName: "Nutricionista Teste",
  role: "nutritionist",
});
const profileId = "00000000-0000-4000-8000-000000000002";
const unitId = "10000000-0000-4000-8000-000000000002";
const grantId = "20000000-0000-4000-8000-000000000001";

function createLoginForm(email: string, password: string): FormData {
  const formData = new FormData();
  formData.set("email", email);
  formData.set("password", password);
  return formData;
}

function createGrantForm(
  overrides: Partial<Record<"profileId" | "unitId" | "reason" | "validUntil", string>> = {},
): FormData {
  const values = {
    profileId,
    unitId,
    reason: "  Cobertura temporária do atendimento  ",
    validUntil: "2026-12-31T18:00:00.000Z",
    ...overrides,
  };
  const formData = new FormData();
  Object.entries(values).forEach(([name, value]) => {
    formData.set(name, value);
  });
  return formData;
}

function createRevokeForm(
  overrides: Partial<Record<"grantId" | "reason", string>> = {},
): FormData {
  const values = {
    grantId,
    reason: "  Cobertura temporária encerrada  ",
    ...overrides,
  };
  const formData = new FormData();
  Object.entries(values).forEach(([name, value]) => {
    formData.set(name, value);
  });
  return formData;
}

describe("signIn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createClientMock.mockResolvedValue({
      auth: {
        signInWithPassword: signInWithPasswordMock,
      },
      rpc: rpcMock,
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

describe("access administration actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-30T12:00:00.000Z"));
    loadActorMock.mockResolvedValue(coordinator);
    createClientMock.mockResolvedValue({
      auth: {
        signInWithPassword: signInWithPasswordMock,
      },
      rpc: rpcMock,
    });
    rpcMock.mockResolvedValue({ data: grantId, error: null });
  });

  it("rejects a nutritionist before validation, client creation or RPC", async () => {
    loadActorMock.mockResolvedValue(nutritionist);

    await expect(
      grantAccess(createGrantForm({ profileId: "perfil-invalido" })),
    ).rejects.toThrow("FORBIDDEN");

    expect(loadActorMock).toHaveBeenCalledOnce();
    expect(requireCoordinatorMock).toHaveBeenCalledWith(nutritionist);
    expect(createClientMock).not.toHaveBeenCalled();
    expect(rpcMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("authenticates and authorizes before rejecting invalid grant input", async () => {
    const result = await grantAccess(
      createGrantForm({
        reason: "curt",
        validUntil: "2026-07-29T12:00:00.000Z",
      }),
    );

    expect(result).toEqual({
      status: "validation_error",
      message: "O motivo deve ter entre 5 e 500 caracteres",
    });
    expect(
      loadActorMock.mock.invocationCallOrder[0],
    ).toBeLessThan(requireCoordinatorMock.mock.invocationCallOrder[0]!);
    expect(createClientMock).not.toHaveBeenCalled();
    expect(rpcMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("rejects a grant whose validity is not in the server future", async () => {
    const result = await grantAccess(
      createGrantForm({ validUntil: "2026-07-30T12:00:00.000Z" }),
    );

    expect(result).toEqual({
      status: "validation_error",
      message: "A validade deve estar no futuro",
    });
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("calls the typed grant RPC with normalized exact arguments and revalidates on success", async () => {
    const result = await grantAccess(createGrantForm());

    expect(rpcMock).toHaveBeenCalledWith("grant_unit_access", {
      target_profile_id: profileId,
      target_unit_id: unitId,
      reason: "Cobertura temporária do atendimento",
      valid_until: "2026-12-31T18:00:00.000Z",
    });
    expect(revalidatePathMock).toHaveBeenCalledOnce();
    expect(revalidatePathMock).toHaveBeenCalledWith("/settings/access");
    expect(result).toEqual({
      status: "success",
      message: "Acesso autorizado.",
    });
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("returns a generic grant failure without SQL details or revalidation", async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: new Error(
        'duplicate key violates unique constraint "one_active_grant"',
      ),
    });

    const result = await grantAccess(createGrantForm());

    expect(result).toEqual({
      status: "error",
      message: "Não foi possível alterar o acesso. Tente novamente.",
    });
    expect(JSON.stringify(result)).not.toContain("duplicate");
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("returns the same generic state when grant client initialization throws", async () => {
    createClientMock.mockRejectedValue(
      new Error("cookie or database initialization failed"),
    );

    await expect(grantAccess(createGrantForm())).resolves.toEqual({
      status: "error",
      message: "Não foi possível alterar o acesso. Tente novamente.",
    });
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("validates revocation before creating a client", async () => {
    const result = await revokeAccess(
      createRevokeForm({ grantId: "grant-invalido", reason: "curt" }),
    );

    expect(result.status).toBe("validation_error");
    expect(createClientMock).not.toHaveBeenCalled();
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("calls the typed revoke RPC with normalized arguments and revalidates only on success", async () => {
    rpcMock.mockResolvedValue({ data: undefined, error: null });

    const result = await revokeAccess(createRevokeForm());

    expect(rpcMock).toHaveBeenCalledWith("revoke_unit_access", {
      grant_id: grantId,
      reason: "Cobertura temporária encerrada",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/settings/access");
    expect(result).toEqual({
      status: "success",
      message: "Acesso revogado.",
    });
  });

  it("returns a generic revoke failure and never revalidates failed RPCs", async () => {
    rpcMock.mockRejectedValue(
      new Error("P0002 Active unit access grant not found"),
    );

    const result = await revokeAccess(createRevokeForm());

    expect(result).toEqual({
      status: "error",
      message: "Não foi possível alterar o acesso. Tente novamente.",
    });
    expect(JSON.stringify(result)).not.toContain("P0002");
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
