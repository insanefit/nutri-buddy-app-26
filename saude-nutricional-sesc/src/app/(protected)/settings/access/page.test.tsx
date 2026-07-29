import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  grantAccessMock,
  listAccessAdministrationOptionsMock,
  listAccessGrantsMock,
  loadActorMock,
  redirectMock,
  requireCoordinatorMock,
  revokeAccessMock,
} = vi.hoisted(() => ({
  grantAccessMock: vi.fn(),
  listAccessAdministrationOptionsMock: vi.fn(),
  listAccessGrantsMock: vi.fn(),
  loadActorMock: vi.fn(),
  redirectMock: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  requireCoordinatorMock: vi.fn((actor: { role: string }) => {
    if (actor.role !== "coordinator") {
      throw new Error("FORBIDDEN");
    }
    return actor;
  }),
  revokeAccessMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("../../../../modules/access/actions", () => ({
  grantAccess: grantAccessMock,
  revokeAccess: revokeAccessMock,
}));

vi.mock("../../../../modules/access/actor", () => ({
  loadActor: loadActorMock,
}));

vi.mock("../../../../modules/access/authorization", () => ({
  requireCoordinator: requireCoordinatorMock,
}));

vi.mock("../../../../modules/access/repository", () => ({
  listAccessAdministrationOptions:
    listAccessAdministrationOptionsMock,
  listAccessGrants: listAccessGrantsMock,
}));

import SettingsAccessPage from "./page";

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

const grants = Object.freeze([
  Object.freeze({
    id: "20000000-0000-4000-8000-000000000001",
    profileId: "00000000-0000-4000-8000-000000000002",
    profileName: "Nutricionista Teste",
    unitId: "10000000-0000-4000-8000-000000000002",
    unitName: "Unidade Piloto 2",
    reason: "Cobertura temporária do atendimento",
    grantorName: "Coordenação Teste",
    validFrom: "2026-07-28T12:00:00.000Z",
    validUntil: "2026-12-31T23:59:59.000Z",
    revokedAt: null,
    revocationReason: null,
    status: "active",
  }),
  Object.freeze({
    id: "20000000-0000-4000-8000-000000000002",
    profileId: "00000000-0000-4000-8000-000000000002",
    profileName: "Nutricionista Teste",
    unitId: "10000000-0000-4000-8000-000000000002",
    unitName: "Unidade Piloto 2",
    reason: "Apoio durante afastamento profissional",
    grantorName: "Coordenação Teste",
    validFrom: "2026-06-01T12:00:00.000Z",
    validUntil: "2026-07-15T23:59:59.000Z",
    revokedAt: "2026-07-10T12:00:00.000Z",
    revocationReason: "Cobertura temporária encerrada",
    status: "revoked",
  }),
]);

const options = Object.freeze({
  profiles: Object.freeze([
    Object.freeze({
      id: "00000000-0000-4000-8000-000000000002",
      fullName: "Nutricionista Teste",
      primaryUnitId: "10000000-0000-4000-8000-000000000001",
    }),
  ]),
  units: Object.freeze([
    Object.freeze({
      id: "10000000-0000-4000-8000-000000000001",
      name: "Unidade Piloto 1",
    }),
    Object.freeze({
      id: "10000000-0000-4000-8000-000000000002",
      name: "Unidade Piloto 2",
    }),
  ]),
});

afterEach(cleanup);

describe("SettingsAccessPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadActorMock.mockResolvedValue(coordinator);
    listAccessGrantsMock.mockResolvedValue(grants);
    listAccessAdministrationOptionsMock.mockResolvedValue(options);
  });

  it("authorizes the coordinator before listing and renders usable forms and grant states", async () => {
    render(
      await SettingsAccessPage({
        searchParams: Promise.resolve({ feedback: "grant-success" }),
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Administração de acessos" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Acesso autorizado.",
    );
    expect(screen.getByLabelText("Profissional")).toBeRequired();
    expect(screen.getByLabelText("Unidade")).toBeRequired();
    expect(screen.getByLabelText("Motivo")).toHaveAttribute(
      "minlength",
      "5",
    );
    expect(screen.getByLabelText("Válido até")).toBeRequired();
    expect(screen.getByLabelText("Válido até")).toHaveAttribute(
      "type",
      "date",
    );
    expect(
      screen.getByRole("button", { name: "Autorizar acesso" }),
    ).toBeEnabled();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getByText("Revogado")).toBeInTheDocument();
    expect(
      screen.getByText("Cobertura temporária do atendimento"),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Coordenação Teste/),
    ).not.toHaveLength(0);
    expect(
      screen.getByText(/Cobertura temporária encerrada/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Revogar" })).toBeEnabled();

    expect(
      loadActorMock.mock.invocationCallOrder[0],
    ).toBeLessThan(
      requireCoordinatorMock.mock.invocationCallOrder[0]!,
    );
    expect(
      requireCoordinatorMock.mock.invocationCallOrder[0],
    ).toBeLessThan(
      listAccessGrantsMock.mock.invocationCallOrder[0]!,
    );
  });

  it("rejects a nutritionist before listing any administration data", async () => {
    loadActorMock.mockResolvedValue({
      ...coordinator,
      role: "nutritionist",
    });

    await expect(
      SettingsAccessPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("FORBIDDEN");
    expect(listAccessGrantsMock).not.toHaveBeenCalled();
    expect(listAccessAdministrationOptionsMock).not.toHaveBeenCalled();
  });

  it("renders a clear empty state when no grants exist", async () => {
    listAccessGrantsMock.mockResolvedValue(Object.freeze([]));

    render(
      await SettingsAccessPage({
        searchParams: Promise.resolve({ feedback: "valor-desconhecido" }),
      }),
    );

    expect(
      screen.getByText("Nenhuma autorização registrada."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
