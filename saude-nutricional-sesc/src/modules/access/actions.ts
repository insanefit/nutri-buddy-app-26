"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "../../platform/supabase/server";
import type { Database } from "../../platform/types/database";
import { loadActor } from "./actor";
import { requireCoordinator } from "./authorization";
import { signInSchema } from "./schemas";

export type ActionState = Readonly<{
  error: string | null;
}>;

const invalidCredentialsState: ActionState = Object.freeze({
  error: "Credenciais inválidas",
});

export type AccessActionState = Readonly<{
  status: "success" | "validation_error" | "error";
  message: string;
}>;

const reasonSchema = z
  .string()
  .trim()
  .min(5, "O motivo deve ter entre 5 e 500 caracteres")
  .max(500, "O motivo deve ter entre 5 e 500 caracteres");

const grantAccessSchema = z.object({
  profileId: z.string().uuid("Selecione um profissional válido"),
  unitId: z.string().uuid("Selecione uma unidade válida"),
  reason: reasonSchema,
  validUntil: z.coerce
    .date()
    .refine(
      (value) => value.getTime() > Date.now(),
      "A validade deve estar no futuro",
    ),
});

const revokeAccessSchema = z.object({
  grantId: z.string().uuid("Selecione uma autorização válida"),
  reason: reasonSchema,
});

type GrantAccessArgs =
  Database["public"]["Functions"]["grant_unit_access"]["Args"];
type RevokeAccessArgs =
  Database["public"]["Functions"]["revoke_unit_access"]["Args"];

const genericAccessErrorState: AccessActionState = Object.freeze({
  status: "error",
  message: "Não foi possível alterar o acesso. Tente novamente.",
});

function validationErrorState(error: z.ZodError): AccessActionState {
  return Object.freeze({
    status: "validation_error",
    message:
      error.issues[0]?.message ?? "Revise os campos informados",
  });
}

async function authorizeCoordinator(): Promise<void> {
  const actor = await loadActor();
  requireCoordinator(actor);
}

export async function signIn(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const inputResult = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!inputResult.success) {
    return Object.freeze({
      error:
        inputResult.error.issues[0]?.message ?? "Revise os campos informados",
    });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(inputResult.data);

    if (error) {
      return invalidCredentialsState;
    }
  } catch {
    return invalidCredentialsState;
  }

  redirect("/inicio");
}

export async function grantAccess(
  formData: FormData,
): Promise<AccessActionState> {
  await authorizeCoordinator();

  const inputResult = grantAccessSchema.safeParse({
    profileId: formData.get("profileId"),
    unitId: formData.get("unitId"),
    reason: formData.get("reason"),
    validUntil: formData.get("validUntil"),
  });
  if (!inputResult.success) {
    return validationErrorState(inputResult.error);
  }

  const rpcArguments: GrantAccessArgs = {
    target_profile_id: inputResult.data.profileId,
    target_unit_id: inputResult.data.unitId,
    reason: inputResult.data.reason,
    valid_until: inputResult.data.validUntil.toISOString(),
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc(
      "grant_unit_access",
      rpcArguments,
    );

    if (error || !z.string().uuid().safeParse(data).success) {
      return genericAccessErrorState;
    }
  } catch {
    return genericAccessErrorState;
  }

  revalidatePath("/settings/access");
  return Object.freeze({
    status: "success",
    message: "Acesso autorizado.",
  });
}

export async function revokeAccess(
  formData: FormData,
): Promise<AccessActionState> {
  await authorizeCoordinator();

  const inputResult = revokeAccessSchema.safeParse({
    grantId: formData.get("grantId"),
    reason: formData.get("reason"),
  });
  if (!inputResult.success) {
    return validationErrorState(inputResult.error);
  }

  const rpcArguments: RevokeAccessArgs = {
    grant_id: inputResult.data.grantId,
    reason: inputResult.data.reason,
  };

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc(
      "revoke_unit_access",
      rpcArguments,
    );

    if (error) {
      return genericAccessErrorState;
    }
  } catch {
    return genericAccessErrorState;
  }

  revalidatePath("/settings/access");
  return Object.freeze({
    status: "success",
    message: "Acesso revogado.",
  });
}
