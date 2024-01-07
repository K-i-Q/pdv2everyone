import * as z from "zod";

export const ResetSchema = z.object({
  email: z.string().email({
    message: "Email inválido",
  }),
});

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email inválido",
  }),
  password: z.string().min(1, {
    message: "Senha é um campo obrigatório",
  }),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Email inválido",
  }),
  password: z.string().min(6, {
    message: "Mínimo de 6 caracteres obrigatórios",
  }),
  name: z.string().min(1, {
    message: "Nome é obrigatório"
  })
});