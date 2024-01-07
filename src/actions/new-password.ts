"use server";
import { getPasswordResetTokenByToken } from "@/data/password-token";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";
import { NewPasswordSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import * as z from "zod";

export const newPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token: string | null
) => {
  if (!token) {
    return { error: "Não possui token" };
  }

  const validateFields = NewPasswordSchema.safeParse(values);

  if (!validateFields.success) {
    return { error: "Campo inválido" };
  }

  const { password } = validateFields.data;

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: "Token inválido" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token expirou" };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: "Email não está cadastrado" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  await db.passwordResetToken.delete({
    where: {
      id: existingToken.id,
    },
  });

  return { success: "Senha alterada" };
};
