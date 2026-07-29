import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAccessibleUnitNameMock,
  loadActorMock,
} = vi.hoisted(() => ({
  getAccessibleUnitNameMock: vi.fn(),
  loadActorMock: vi.fn(),
}));

vi.mock("../../modules/access/actor", () => ({
  loadActor: loadActorMock,
}));

vi.mock("../../modules/access/repository", () => ({
  getAccessibleUnitName: getAccessibleUnitNameMock,
}));

import ProtectedLayout from "./layout";

const actor = Object.freeze({
  userId: "00000000-0000-4000-8000-000000000002",
  fullName: "Nutricionista Teste",
  role: "nutritionist",
  primaryUnitId: "10000000-0000-4000-8000-000000000001",
  accessibleUnitIds: Object.freeze([
    "10000000-0000-4000-8000-000000000001",
  ]),
});

afterEach(cleanup);

describe("ProtectedLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadActorMock.mockResolvedValue(actor);
    getAccessibleUnitNameMock.mockResolvedValue("Unidade Piloto 1");
  });

  it("loads the actor before resolving the validated primary unit name", async () => {
    const element = await ProtectedLayout({
      children: <h1>Página protegida</h1>,
    });
    render(element);

    expect(screen.getByRole("heading", { name: "Página protegida" })).toBeInTheDocument();
    expect(screen.getByText("Unidade Piloto 1")).toBeInTheDocument();
    expect(getAccessibleUnitNameMock).toHaveBeenCalledWith(
      actor.primaryUnitId,
    );
    expect(
      loadActorMock.mock.invocationCallOrder[0],
    ).toBeLessThan(
      getAccessibleUnitNameMock.mock.invocationCallOrder[0]!,
    );
  });

  it("propagates unit lookup failures instead of rendering an unverified name", async () => {
    getAccessibleUnitNameMock.mockRejectedValue(
      new Error("ACCESSIBLE_UNIT_NOT_FOUND"),
    );

    await expect(
      ProtectedLayout({ children: <p>Não deve renderizar</p> }),
    ).rejects.toThrow("ACCESSIBLE_UNIT_NOT_FOUND");
  });
});
