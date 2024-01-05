"use server";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { LoginSchema } from "@/schemas";
import { AuthError } from "next-auth";
import * as z from "zod";
export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validateFields = LoginSchema.safeParse(values);

  if (!validateFields.success) {
    return { error: "Campos inválidos" };
  }

  const { email, password } = validateFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Login ou senha incorreto(s)" };
        default:
          return { error: "Algo deu errado" };
      }
    }
    throw error;
  }
};
