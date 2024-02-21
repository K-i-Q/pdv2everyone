"use server";
import { getServiceByName } from "@/data/service";
import { db } from "@/lib/db";
import { ServicesSchema } from "@/schemas";
import * as z from "zod";

export const createService = async (values: z.infer<typeof ServicesSchema>) => {
  const validateFields = ServicesSchema.safeParse(values);

  if (!validateFields.success) {
    return { error: "Campos inválidos" };
  }

  const { name, description, costPrice, salePrice, status } =
    validateFields.data;
  const existingService = await getServiceByName(name);
  const costFloat = parseFloat(costPrice);
  const saleFloat = parseFloat(salePrice);
  if (existingService) {
    return { error: `Já existe um serviço com nome ${existingService.name}` };
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

export const updateService = async (values: z.infer<typeof ServicesSchema>) => {
  const validateFields = ServicesSchema.safeParse(values);

  if (!validateFields.success) {
    return { error: "Campos inválidos" };
  }

  const { id, name, description, costPrice, salePrice, status } =
    validateFields.data;
  const existingService = await getServiceById(id || "");
  //TODO: separar create de update
  if (existingService) {
    const costFloat = parseFloat(costPrice);
    const saleFloat = parseFloat(salePrice);
    await db.service.update({
      where: {
        name,
      },
      data: {
        name,
        description,
        costPrice: costFloat,
        salePrice: saleFloat,
        status,
      },
    });

    return { success: "Serviço atualizado com sucesso" };
  }

  return { error: `Serviço ${name} não foi encontradoF` };
};

export const getServices = async () => {
  const services = await db.service.findMany();

  if (!services) {
    return { error: "Nenhum serviço cadastrado" };
  }

  return { success: "Serviços encontrados", services: services };
};

export const getServicesByDate = async (date: Date) => {
   const startOfLocalDay = new Date(date);
   startOfLocalDay.setHours(0, 0, 0, 0);
   const startOfUTC = new Date(Date.UTC(startOfLocalDay.getFullYear(), startOfLocalDay.getMonth(), startOfLocalDay.getDate()));
 
   const endOfLocalDay = new Date(date);
   endOfLocalDay.setHours(23, 59, 59, 999);
   const endOfUTC = new Date(Date.UTC(endOfLocalDay.getFullYear(), endOfLocalDay.getMonth(), endOfLocalDay.getDate(), 23, 59, 59, 999));
 
  const services = await db.sale.findMany({
    where: {
      createAt: {
        gte: startOfUTC,
        lt: endOfUTC
      }
    }
  });
  
  if (services.length === 0) {
    return { error: "Nenhum serviço cadastrado para a data selecionada" };
  }
  return { success: "Serviços encontrados", services: services };
};


export const getServiceById = async (id: string) => {
  const service = await db.service.findUnique({
    where: {
      id,
    },
  });

  if (!service) {
    return { error: "Nenhum serviço cadastrado" };
  }

  return { success: "Serviço localizado", data: service };
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
    where: {
      id,
    },
    data: {
      status: !service.status,
    },
  });
  return {
    success: `Serviço: ${service.name} atualizado para ${
      !service.status ? "Ativado" : "Desativado"
    }`,
  };
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
