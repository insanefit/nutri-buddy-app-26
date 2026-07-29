import { describe, expect, it } from "vitest";
import {
  canAccessUnit,
  requireAccessibleUnit,
  requireCoordinator,
} from "./authorization";
import type { ActorContext } from "./types";

const actor: ActorContext = {
  userId: "00000000-0000-4000-8000-000000000002",
  fullName: "Nutricionista Teste",
  role: "nutritionist",
  primaryUnitId: "10000000-0000-4000-8000-000000000001",
  accessibleUnitIds: ["10000000-0000-4000-8000-000000000001"],
};

const coordinator: ActorContext = {
  ...actor,
  userId: "00000000-0000-4000-8000-000000000001",
  fullName: "Coordenação Teste",
  role: "coordinator",
};

describe("authorization", () => {
  it("allows the primary unit", () => {
    expect(canAccessUnit(actor, actor.primaryUnitId)).toBe(true);
  });

  it("denies a unit absent from accessibleUnitIds", () => {
    expect(
      canAccessUnit(actor, "10000000-0000-4000-8000-000000000002"),
    ).toBe(false);
  });

  it("requires coordinator role", () => {
    expect(() => requireCoordinator(actor)).toThrowError("FORBIDDEN");
  });

  it("returns a coordinator without changing the actor", () => {
    expect(requireCoordinator(coordinator)).toBe(coordinator);
  });

  it("returns an actor with access to the requested unit", () => {
    expect(requireAccessibleUnit(actor, actor.primaryUnitId)).toBe(actor);
  });

  it("rejects an actor without access to the requested unit", () => {
    expect(() =>
      requireAccessibleUnit(
        actor,
        "10000000-0000-4000-8000-000000000002",
      ),
    ).toThrowError("UNIT_FORBIDDEN");
  });
});
