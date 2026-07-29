import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { loadActorMock } = vi.hoisted(() => ({
  loadActorMock: vi.fn(),
}));

vi.mock("../../../modules/access/actor", () => ({
  loadActor: loadActorMock,
}));

import InicioPage from "./page";

afterEach(cleanup);

describe("InicioPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadActorMock.mockResolvedValue({
      userId: "00000000-0000-4000-8000-000000000001",
      fullName: "Coordenação Teste",
      role: "coordinator",
      primaryUnitId: "10000000-0000-4000-8000-000000000001",
      accessibleUnitIds: Object.freeze([
        "10000000-0000-4000-8000-000000000001",
        "10000000-0000-4000-8000-000000000002",
      ]),
    });
  });

  it("welcomes the actor and reports the server-authorized unit count", async () => {
    render(await InicioPage());

    expect(
      screen.getByRole("heading", { name: "Bem-vinda, Coordenação Teste" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 unidades acessíveis")).toBeInTheDocument();
    expect(loadActorMock).toHaveBeenCalledOnce();
  });
});
