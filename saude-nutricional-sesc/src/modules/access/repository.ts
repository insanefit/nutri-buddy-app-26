import "next/dist/compiled/server-only";

import { z } from "zod";
import { createClient } from "../../platform/supabase/server";

const uuidSchema = z.string().uuid();
const databaseDateSchema = z.string().datetime({ offset: true });
const requiredNameSchema = z.string().trim().min(2).max(160);

const accessibleUnitSchema = z.object({
  id: uuidSchema,
  name: requiredNameSchema.max(120),
  active: z.literal(true),
});

const accessGrantRowsSchema = z.array(
  z.object({
    id: uuidSchema,
    profile_id: uuidSchema,
    unit_id: uuidSchema,
    reason: z.string().trim().min(5).max(500),
    granted_by: uuidSchema,
    valid_from: databaseDateSchema,
    valid_until: databaseDateSchema,
    revoked_at: databaseDateSchema.nullable(),
    revocation_reason: z.string().trim().min(5).max(500).nullable(),
    profile: z.object({
      full_name: requiredNameSchema,
    }),
    unit: z.object({
      name: requiredNameSchema.max(120),
    }),
    grantor: z.object({
      full_name: requiredNameSchema,
    }),
  }),
);

const profileOptionsSchema = z.array(
  z.object({
    id: uuidSchema,
    full_name: requiredNameSchema,
    primary_unit_id: uuidSchema,
    role: z.literal("nutritionist"),
    active: z.literal(true),
  }),
);

const unitOptionsSchema = z.array(
  z.object({
    id: uuidSchema,
    name: requiredNameSchema.max(120),
    active: z.literal(true),
  }),
);

export type AccessGrantStatus = "active" | "expired" | "revoked";

export type AccessGrantSummary = Readonly<{
  id: string;
  profileId: string;
  profileName: string;
  unitId: string;
  unitName: string;
  reason: string;
  grantorName: string;
  validFrom: string;
  validUntil: string;
  revokedAt: string | null;
  revocationReason: string | null;
  status: AccessGrantStatus;
}>;

export type AccessProfileOption = Readonly<{
  id: string;
  fullName: string;
  primaryUnitId: string;
}>;

export type AccessUnitOption = Readonly<{
  id: string;
  name: string;
}>;

export type AccessAdministrationOptions = Readonly<{
  profiles: readonly AccessProfileOption[];
  units: readonly AccessUnitOption[];
}>;

function parseData<T>(
  schema: z.ZodType<T>,
  data: unknown,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error("ACCESS_DATA_INVALID", { cause: result.error });
  }

  return result.data;
}

function resolveGrantStatus(
  revokedAt: string | null,
  validUntil: string,
): AccessGrantStatus {
  if (revokedAt) {
    return "revoked";
  }

  return new Date(validUntil).getTime() > Date.now()
    ? "active"
    : "expired";
}

function freezeGrantSummary(
  row: z.infer<typeof accessGrantRowsSchema>[number],
): AccessGrantSummary {
  return Object.freeze({
    id: row.id,
    profileId: row.profile_id,
    profileName: row.profile.full_name,
    unitId: row.unit_id,
    unitName: row.unit.name,
    reason: row.reason,
    grantorName: row.grantor.full_name,
    validFrom: row.valid_from,
    validUntil: row.valid_until,
    revokedAt: row.revoked_at,
    revocationReason: row.revocation_reason,
    status: resolveGrantStatus(row.revoked_at, row.valid_until),
  });
}

export async function getAccessibleUnitName(
  unitId: string,
): Promise<string> {
  const validatedUnitId = uuidSchema.parse(unitId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("units")
    .select("id, name, active")
    .eq("id", validatedUnitId)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw new Error("ACCESSIBLE_UNIT_LOAD_FAILED", { cause: error });
  }
  if (!data) {
    throw new Error("ACCESSIBLE_UNIT_NOT_FOUND");
  }

  const unit = parseData(accessibleUnitSchema, data);
  if (unit.id !== validatedUnitId) {
    throw new Error("ACCESS_DATA_INVALID", {
      cause: new Error("Requested and returned units differ"),
    });
  }

  return unit.name;
}

export async function listAccessGrants(): Promise<
  readonly AccessGrantSummary[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("unit_access_grants")
    .select(
      "id, profile_id, unit_id, reason, granted_by, valid_from, valid_until, revoked_at, revocation_reason, profile:profiles!unit_access_grants_profile_id_fkey(full_name), unit:units!unit_access_grants_unit_id_fkey(name), grantor:profiles!unit_access_grants_granted_by_fkey(full_name)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("ACCESS_GRANTS_LOAD_FAILED", { cause: error });
  }

  const rows = parseData(accessGrantRowsSchema, data);
  return Object.freeze(rows.map(freezeGrantSummary));
}

export async function listAccessAdministrationOptions(): Promise<
  AccessAdministrationOptions
> {
  const supabase = await createClient();
  const [profileResult, unitResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, primary_unit_id, role, active")
      .eq("active", true)
      .eq("role", "nutritionist")
      .order("full_name", { ascending: true }),
    supabase
      .from("units")
      .select("id, active, name")
      .eq("active", true)
      .order("name", { ascending: true }),
  ]);

  if (profileResult.error || unitResult.error) {
    throw new Error("ACCESS_OPTIONS_LOAD_FAILED", {
      cause: profileResult.error ?? unitResult.error,
    });
  }

  const profiles = parseData(profileOptionsSchema, profileResult.data);
  const units = parseData(unitOptionsSchema, unitResult.data);

  return Object.freeze({
    profiles: Object.freeze(
      profiles.map((profile) =>
        Object.freeze({
          id: profile.id,
          fullName: profile.full_name,
          primaryUnitId: profile.primary_unit_id,
        }),
      ),
    ),
    units: Object.freeze(
      units.map((unit) =>
        Object.freeze({
          id: unit.id,
          name: unit.name,
        }),
      ),
    ),
  });
}
