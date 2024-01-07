"use server";

import { getUserByEmail } from "@/data/user";
import { sendPasswordResetTokenEmail } from "@/lib/mail";
import { generatePasswordResetToken } from "@/lib/tokens";
import { ResetSchema } from "@/schemas";
import * as z from "zod";

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validateFields = ResetSchema.safeParse(values);

  if (!validateFields.success) {
    return { error: "Email inválido" };
  }

  const { email } = validateFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "Email não encontrado" };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetTokenEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  return { success: "Email enviado para resetar sua senha" };
};
