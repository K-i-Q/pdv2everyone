"use server";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";
import { RegisterSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import * as z from "zod";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validateFields = RegisterSchema.safeParse(values);

  if (!validateFields.success) {
    return { error: "Campos inválidos" };
  }

  const { email, name, password } = validateFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return {
      error: "Email já está sendo utilizado",
    };
  }
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
  return { success: "Usuário criado" };
};
