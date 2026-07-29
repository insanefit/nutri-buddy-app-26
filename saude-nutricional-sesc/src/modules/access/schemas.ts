import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(12, "A senha deve ter pelo menos 12 caracteres"),
});

export const unitIdSchema = z.string().uuid("Unidade inválida");
