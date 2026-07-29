import "next/dist/compiled/server-only";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "../../platform/supabase/server";
import { requireAccessibleUnit } from "./authorization";
import { unitIdSchema } from "./schemas";
import type { ActorContext } from "./types";

const activeProfileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(2),
  role: z.enum(["coordinator", "nutritionist"]),
  primary_unit_id: z.string().uuid(),
  active: z.literal(true),
});

const activeGrantsSchema = z.array(
  z.object({
    unit_id: z.string().uuid(),
  }),
);

export async function loadActor(): Promise<ActorContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authenticationError,
  } = await supabase.auth.getUser();

  if (authenticationError || !user) {
    redirect("/login");
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, primary_unit_id, active")
    .eq("id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (profileError) {
    throw new Error("PROFILE_LOAD_FAILED", { cause: profileError });
  }
  if (!profileData) {
    throw new Error("PROFILE_INACTIVE");
  }

  const profileResult = activeProfileSchema.safeParse(profileData);
  if (!profileResult.success) {
    throw new Error("ACTOR_DATA_INVALID", { cause: profileResult.error });
  }
  if (profileResult.data.id !== user.id) {
    throw new Error("ACTOR_DATA_INVALID", {
      cause: new Error("Authenticated user and profile differ"),
    });
  }

  const now = new Date().toISOString();
  const { data: grantsData, error: grantsError } = await supabase
    .from("unit_access_grants")
    .select("unit_id")
    .eq("profile_id", user.id)
    .is("revoked_at", null)
    .lte("valid_from", now)
    .gt("valid_until", now);

  if (grantsError) {
    throw new Error("ACTOR_ACCESS_LOAD_FAILED", { cause: grantsError });
  }

  const grantsResult = activeGrantsSchema.safeParse(grantsData ?? []);
  if (!grantsResult.success) {
    throw new Error("ACTOR_DATA_INVALID", { cause: grantsResult.error });
  }

  const profile = profileResult.data;
  const accessibleUnitIds = Object.freeze(
    Array.from(
      new Set([
        profile.primary_unit_id,
        ...grantsResult.data.map((grant) => grant.unit_id),
      ]),
    ),
  );

  return Object.freeze({
    userId: profile.id,
    fullName: profile.full_name,
    role: profile.role,
    primaryUnitId: profile.primary_unit_id,
    accessibleUnitIds,
  });
}

export async function requireUnitAccess(
  unitId: string,
): Promise<ActorContext> {
  const validatedUnitId = unitIdSchema.parse(unitId);
  const actor = await loadActor();

  return requireAccessibleUnit(actor, validatedUnitId);
}
