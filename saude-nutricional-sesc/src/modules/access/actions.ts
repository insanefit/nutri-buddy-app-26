"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../platform/supabase/server";
import { signInSchema } from "./schemas";

export type ActionState = Readonly<{
  error: string | null;
}>;

const invalidCredentialsState: ActionState = Object.freeze({
  error: "Credenciais inválidas",
});

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
