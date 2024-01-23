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

  const { name, description, costPrice, salePrice, status } =
    validateFields.data;
  const existingService = await getServiceByName(name);
  const costFloat = parseFloat(costPrice);
  const saleFloat = parseFloat(salePrice);
  //TODO: separar create de update
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
      status,
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

export const setStatusService = async (id: string) => {
  if (!id) {
    return { error: "Referência de ID faltando" };
  }
  const service = await db.service.findUnique({
    where: {
      id,
    },
  });

  if (!service) {
    return { error: "Nenhum serviço encontrado com esse ID" };
  }
  await db.service.update({
    where:{
      id
    },
    data:{
      status: !service.status
    }
  })
  return { success: `Serviço: ${service.name} atualizado para ${!service.status ? 'Ativado' : 'Desativado'}` };
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
