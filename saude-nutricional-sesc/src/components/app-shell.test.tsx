import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AppShell } from "./app-shell";
import type { ActorContext } from "../modules/access/types";

const nutritionistUnitIds = Object.freeze([
  "10000000-0000-4000-8000-000000000001",
]);

const nutritionist = Object.freeze({
  userId: "00000000-0000-4000-8000-000000000002",
  fullName: "Ana Nutricionista",
  role: "nutritionist",
  primaryUnitId: "10000000-0000-4000-8000-000000000001",
  accessibleUnitIds: nutritionistUnitIds,
}) satisfies ActorContext;

const coordinator = Object.freeze({
  ...nutritionist,
  userId: "00000000-0000-4000-8000-000000000001",
  fullName: "Coordenação Teste",
  role: "coordinator",
  accessibleUnitIds: Object.freeze([
    "10000000-0000-4000-8000-000000000001",
    "10000000-0000-4000-8000-000000000002",
  ]),
}) satisfies ActorContext;

afterEach(cleanup);

describe("AppShell", () => {
  it("shows the actor and primary unit without exposing settings to nutritionists", () => {
    render(
      <AppShell
        actor={nutritionist}
        primaryUnitName="Unidade Piloto 1"
      >
        <p>Conteúdo protegido</p>
      </AppShell>,
    );

    expect(screen.getByText("Ana Nutricionista")).toBeInTheDocument();
    expect(screen.getByText("Unidade Piloto 1")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Configurações" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
    expect(screen.getByRole("link", { name: "Ir para o conteúdo" })).toHaveAttribute(
      "href",
      "#main-content",
    );
  });

  it("shows settings to coordinators without mutating shared navigation or actor data", () => {
    const actorSnapshot = [...coordinator.accessibleUnitIds];
    const { unmount } = render(
      <AppShell
        actor={coordinator}
        primaryUnitName="Unidade Piloto 1"
      >
        <p>Conteúdo protegido</p>
      </AppShell>,
    );

    expect(
      screen.getByRole("link", { name: "Configurações" }),
    ).toHaveAttribute("href", "/settings/access");
    expect(screen.getAllByRole("link")).toHaveLength(7);
    expect(coordinator.accessibleUnitIds).toEqual(actorSnapshot);

    unmount();
    render(
      <AppShell
        actor={nutritionist}
        primaryUnitName="Unidade Piloto 1"
      >
        <p>Conteúdo protegido</p>
      </AppShell>,
    );

    expect(screen.getAllByRole("link")).toHaveLength(6);
    expect(nutritionist.accessibleUnitIds).toEqual(nutritionistUnitIds);
  });
});
