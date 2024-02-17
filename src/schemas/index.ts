import * as z from "zod";

export const SalesSchema = z.object({
  licensePlate: z.string({ required_error: "Campo obrigatório" }),
  model: z.string({ required_error: "Campo obrigatório" }),
  services: z.array(z.string()),
  isDeferredPayment: z.boolean(),
  name: z.string({ required_error: "Campo obrigatório" }),
  phone: z.string({ required_error: "Campo obrigatório" }).min(9,{
    message: "Preencha um telefone válido"
  }),
  note: z.optional(z.string()),
  time: z.string({ required_error: "Campo obrigatório" }),
  paymentMethod: z.optional(z.string()),
});

export const ServicesSchema = z.object({
  id: z.optional(z.string({ required_error: "Campo obrigatório" })),
  name: z.string({ required_error: "Campo obrigatório" }),
  description: z.string({ required_error: "Campo obrigatório" }),
  costPrice: z.string({ required_error: "Campo obrigatório" }),
  salePrice: z.string({ required_error: "Campo obrigatório" }),
  status: z.boolean({ required_error: "Campo obrigatório" }),
});

export const SettingsSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    // role: z.enum([UserRole.ADMIN, UserRole.USER]),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }

      return true;
    },
    {
      message: "Nova senha obrigatória",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false;
      }

      return true;
    },
    {
      message: "Senha obrigatória",
      path: ["password"],
    }
  );

export const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Mínimo de 6 caracteres",
  }),
});

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
  code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Email inválido",
  }),
  password: z.string().min(6, {
    message: "Mínimo de 6 caracteres obrigatórios",
  }),
  name: z.string().min(1, {
    message: "Nome é obrigatório",
  }),
});
