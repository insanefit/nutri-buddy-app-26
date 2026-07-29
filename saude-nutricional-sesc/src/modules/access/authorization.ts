import type { ActorContext } from "./types";

export function canAccessUnit(
  actor: ActorContext,
  unitId: string,
): boolean {
  return actor.accessibleUnitIds.includes(unitId);
}

export function requireCoordinator(actor: ActorContext): ActorContext {
  if (actor.role !== "coordinator") {
    throw new Error("FORBIDDEN");
  }

  return actor;
}

export function requireAccessibleUnit(
  actor: ActorContext,
  unitId: string,
): ActorContext {
  if (!canAccessUnit(actor, unitId)) {
    throw new Error("UNIT_FORBIDDEN");
  }

  return actor;
}
