"use server";
import { getServiceByName } from "@/data/service";
import { db } from "@/lib/db";
import { ServicesSchema } from "@/schemas";
import * as z from "zod";

export const createUpdateServices = async (
  values: z.infer<typeof ServicesSchema>
) => {
  const validateFields = ServicesSchema.safeParse(values);

  if (!validateFields.success) {
    return { error: "Campos inválidos" };
  }

  const { name, description, costPrice, salePrice } = validateFields.data;
  const existingService = await getServiceByName(name);
  const costFloat = parseFloat(costPrice);
  const saleFloat = parseFloat(salePrice);
  if (existingService) {
    await db.service.update({
      where: {
        name,
      },
      data: {
        description,
        costPrice: costFloat,
        salePrice: saleFloat,
      },
    });

    return { success: "Serviço atualizado com sucesso" };
  }

  const createAt = new Date();
  await db.service.create({
    data: {
      name,
      description,
      costPrice: costFloat,
      salePrice: saleFloat,
      createAt,
    },
  });

  return { success: "Serviço criado com sucesso" };
};

export const getServices = async () => {
  const services = await db.service.findMany();

  if (!services) {
    return { error: "Nenhum serviço cadastrado" };
  }

  return { success: "Serviços encontrados", services: services };
};

export const deleteService = async (serviceId: any) => {
  const service = await db.service.findUnique({
    where: {
      id: serviceId,
    },
  });

  if (!service) {
    return { error: "Serviço não foi encontrado" };
  }

  await db.service.delete({
    where: {
      id: serviceId,
    },
  });

  return { success: "Serviço excluído com sucesso" };
};
