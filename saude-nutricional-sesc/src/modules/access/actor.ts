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

const activeUnitsSchema = z.array(
  z.object({
    id: z.string().uuid(),
  }),
);

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;
type ActiveProfile = z.infer<typeof activeProfileSchema>;

async function loadActiveProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<ActiveProfile> {
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, primary_unit_id, active")
    .eq("id", userId)
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
  if (profileResult.data.id !== userId) {
    throw new Error("ACTOR_DATA_INVALID", {
      cause: new Error("Authenticated user and profile differ"),
    });
  }

  return profileResult.data;
}

async function loadCoordinatorUnitIds(
  supabase: SupabaseClient,
): Promise<readonly string[]> {
  const { data: unitsData, error: unitsError } = await supabase
    .from("units")
    .select("id")
    .eq("active", true);

  if (unitsError) {
    throw new Error("ACTOR_ACCESS_LOAD_FAILED", { cause: unitsError });
  }

  const unitsResult = activeUnitsSchema.safeParse(unitsData);
  if (!unitsResult.success) {
    throw new Error("ACTOR_DATA_INVALID", { cause: unitsResult.error });
  }

  return unitsResult.data.map((unit) => unit.id);
}

async function loadNutritionistUnitIds(
  supabase: SupabaseClient,
  profile: ActiveProfile,
): Promise<readonly string[]> {
  const now = new Date().toISOString();
  const { data: grantsData, error: grantsError } = await supabase
    .from("unit_access_grants")
    .select("unit_id")
    .eq("profile_id", profile.id)
    .is("revoked_at", null)
    .lte("valid_from", now)
    .gt("valid_until", now);

  if (grantsError) {
    throw new Error("ACTOR_ACCESS_LOAD_FAILED", { cause: grantsError });
  }

  const grantsResult = activeGrantsSchema.safeParse(grantsData);
  if (!grantsResult.success) {
    throw new Error("ACTOR_DATA_INVALID", { cause: grantsResult.error });
  }

  return [
    profile.primary_unit_id,
    ...grantsResult.data.map((grant) => grant.unit_id),
  ];
}

async function loadAccessibleUnitIds(
  supabase: SupabaseClient,
  profile: ActiveProfile,
): Promise<readonly string[]> {
  const unitIds =
    profile.role === "coordinator"
      ? await loadCoordinatorUnitIds(supabase)
      : await loadNutritionistUnitIds(supabase, profile);

  return Object.freeze(Array.from(new Set(unitIds)));
}

export async function loadActor(): Promise<ActorContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authenticationError,
  } = await supabase.auth.getUser();

  if (authenticationError || !user) {
    redirect("/login");
  }

  const profile = await loadActiveProfile(supabase, user.id);
  const accessibleUnitIds = await loadAccessibleUnitIds(supabase, profile);

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
