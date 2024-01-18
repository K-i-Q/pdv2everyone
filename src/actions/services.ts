"use server";
import { getServiceByName } from "@/data/service";
import { db } from "@/lib/db";
import { ServicesSchema } from "@/schemas";
import * as z from "zod";

export const services = async (values: z.infer<typeof ServicesSchema>) => {
  const validateFields = ServicesSchema.safeParse(values);

  if (!validateFields.success) {
    return { error: "Campos inválidos" };
  }

  const { name, description, costPrice, salePrice } = validateFields.data;

  const existingService = await getServiceByName(name);

  if (existingService) {
    return { error: "Serviço já existe com esse nome" };
  }

  const createAt = new Date();

  await db.service.create({
    data: {
      name,
      description,
      costPrice,
      salePrice,
      createAt,
    },
  });

  return { success: "Serviço criado com sucesso" };
};
