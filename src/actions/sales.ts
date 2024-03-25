"use server";
import { getCustomerById } from "@/data/customer";
import { getPaymentMethodById } from "@/data/paymentMethod";
import { getSaleById } from "@/data/sale";
import { db } from "@/lib/db";
import { SalesSchema, SearchPlateSchema } from "@/schemas";
import { Vehicle } from "@prisma/client";
import * as z from "zod";

export const createSale = async (
  values: z.infer<typeof SalesSchema>,
  totalPrice: number
) => {
  const validateFields = SalesSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Campos inválidos" };
  }

  const {
    name,
    phone,
    services,
    time,
    isDeferredPayment,
    model,
    licensePlate,
    note,
    paymentMethod,
  } = validateFields.data;

  if (!name || !phone || !services || !(services.length > 0) || !time || !model || !licensePlate) {
    return { error: "Campos obrigatórios não foram preenchidos. Preencha todos os campos." }
  }

  try {
    const customer = await getOrCreateCustomer(name, phone);

    const statusSale = await db.statusSale.findFirst({
      where: {
        description: "Em atendimento",
      },
    });

    if (!statusSale) {
      return { error: "Erro ao busca status da OS" };
    }

    const payment = await getPaymentMethodById(paymentMethod!);

    if (!payment && !isDeferredPayment) {
      return { error: "Forma de pagamento inválida" };
    }

    const vehicle = await getOrCreateVehicle(licensePlate, model, customer.id);

    const createAt = new Date();
    const sale = await db.$transaction(async (trans) => {
      const createdSale = await trans.sale.create({
        data: {
          createAt,
          grossPrice: 0, // Assumindo que você irá calcular depois ou atualizar
          netPrice: totalPrice, // Assumindo que isso será calculado com base nos serviços
          statusSaleId: statusSale.id,
          customerId: customer.id,
          note,
          pickupTime: time,
          isDeferredPayment,
        },
      });

      // Crie itens da venda dentro da mesma transação
      for (const serviceId of services) {
        await trans.itemSale.create({
          data: {
            saleId: createdSale.id,
            serviceId: serviceId,
            quantity: 1,
            vehicleId: vehicle.id,
          },
        });
      }
      if (!isDeferredPayment) {
        await trans.salePaymentMethod.create({
          data: {
            saleId: createdSale.id,
            paymentMethodId: payment!.id, // Assumindo que `payment` tem o ID da forma de pagamento
            amount: totalPrice, // Ou qualquer lógica específica para determinar o valor
          },
        });
      }

      return createdSale;
    });

    return {
      success: "Veículo Inserido na Lista de Atendimento Pendente",
      saleId: sale.id,
    };
  } catch (error) {
    return { error: (error as any).message };
  }
};

export const searchLicensePlate = async (values: z.infer<typeof SearchPlateSchema>) => {
  const validateFields = SearchPlateSchema.safeParse(values);

  if (!validateFields.success) {
    return { error: "Campo inválido de pesquisa" };
  }

  const { licensePlate } = validateFields.data;

  if (!licensePlate) {
    return { error: "Campo de pesquisa de placa obrigatório" };
  }

  try {
    const existingVehicle = await db.vehicle.findUnique({
      where: {
        licensePlate
      },
      include:{
        customer: true
      }
    });

    if (!existingVehicle) {
      return { error: "Veículo não está cadastrado na base" }
    }

    return { success: "Cliente encontrado", vehicleCustomer: existingVehicle}
  } catch (error) {
    return { error: (error as any).message }
  }
}

export const saveServices = async (
  saleId: string,
  servicesIds: string[],
  model: string,
  plate: string
) => {
  if (!saleId || !servicesIds || servicesIds?.length < 1) {
    return { error: "Dados inválidos" };
  }

  const existingSale = await getSaleById(saleId);

  if (!existingSale) {
    return { error: "Ordem de serviço não foi encontrada" };
  }

  // Primeiro, desvincular todos os serviços atuais da venda
  await db.itemSale.deleteMany({
    where: {
      saleId: saleId,
    },
  });

  const existingVehicle = await db.vehicle.findUnique({
    where: {
      licensePlate: plate,
    },
  });

  if (!existingVehicle) {
    const newVehicle = await db.vehicle.create({
      data: {
        licensePlate: plate,
        model,
        customerId: existingSale.customerId,
      },
    });

    await createItemsOnSale(saleId, servicesIds, newVehicle);
    const prices = await db.service.findMany({
      where: {
        id: {
          in: servicesIds,
        },
      },
      select: {
        salePrice: true,
      },
    });
    return { success: "Inserção de veículo com sucesso", prices };
  }

  const prices = await db.service.findMany({
    where: {
      id: {
        in: servicesIds,
      },
    },
    select: {
      salePrice: true,
    },
  });

  await createItemsOnSale(saleId, servicesIds, existingVehicle);

  return { success: "Inserção de veículo com sucesso", prices };
};
export const saveTime = async (saleId: string, pickupTime: string) => {
  if (!saleId || !pickupTime) {
    return { error: "Dados inválidos" };
  }

  const existingSale = await getSaleById(saleId);

  if (!existingSale) {
    return { error: "Não localizei a Ordem de serviço" };
  }

  await db.sale.update({
    where: {
      id: existingSale.id,
    },
    data: {
      pickupTime,
    },
  });
  return { success: "Horário salvo com sucesso" };
};

export const savePaymentMethod = async (
  saleId: string,
  paymentMethodId: string,
  amount: number
) => {
  if (!saleId || !paymentMethodId || !amount) {
    return { error: "Dados inválidos" };
  }

  const existingSale = await getSaleById(saleId);

  if (!existingSale) {
    return { error: "Ordem de serviço não foi encontrada" };
  }

  const existingPaymentMethod = await getPaymentMethodById(paymentMethodId);

  if (!existingPaymentMethod) {
    return { error: "Forma de pagamento não foi encontrada" };
  }

  await db.salePaymentMethod.create({
    data: {
      saleId: existingSale.id,
      paymentMethodId: existingPaymentMethod.id,
      amount,
    },
  });

  return { success: "Forma de pagamento adicionada com sucesso" };
};

export const getSaleByDate = async (date: Date) => {
  const startOfLocalDay = new Date(date);
  startOfLocalDay.setHours(0, 0, 0, 0);
  const startOfUTC = new Date(
    Date.UTC(
      startOfLocalDay.getFullYear(),
      startOfLocalDay.getMonth(),
      startOfLocalDay.getDate()
    )
  );

  const endOfLocalDay = new Date(date);
  endOfLocalDay.setHours(23, 59, 59, 999);
  const endOfUTC = new Date(
    Date.UTC(
      endOfLocalDay.getFullYear(),
      endOfLocalDay.getMonth(),
      endOfLocalDay.getDate(),
      23,
      59,
      59,
      999
    )
  );

  const sales = await db.sale.findMany({
    where: {
      createAt: {
        gte: startOfUTC,
        lt: endOfUTC,
      },
    },
    include: {
      items: {
        include: {
          vehicle: true,
          service: true,
          product: true,
        },
      },
    },
  });

  if (sales.length === 0) {
    return { error: "Nenhum serviço cadastrado para a data selecionada" };
  }
  return { success: "Serviços encontrados", sales: sales };
};
export const saveContact = async (
  saleId: string,
  phone: string,
  note?: string
) => {
  if (!saleId || !phone) {
    return { error: "Dados inválidos" };
  }

  const existingSale = await getSaleById(saleId);
  if (!existingSale) {
    return { error: "Ordem de serviço não foi encontrada" };
  }

  const existingCustomer = await getCustomerById(existingSale.customerId || "");

  if (!existingCustomer) {
    return {
      error: "Cliente não foi vínculado corretamente à essa ordem de serviço",
    };
  }

  await db.customer.update({
    where: {
      id: existingCustomer.id,
    },
    data: {
      phone,
    },
  });

  if (note) {
    await db.sale.update({
      where: { id: existingSale.id },
      data: { note },
    });
  }

  return { success: "Ordem de serviço finalizada com sucesso" };
};

export const getPendingSales = async (): Promise<any> => {
  const sales = await db.sale.findMany({
    where: {
      pickupTime: {
        not: null,
      },
      statusSale: {
        description: "Em atendimento",
      },
    },
    include: {
      customer: true,
      items: {
        include: {
          vehicle: true,
          service: true,
          product: true,
        },
      },
      deferredPayments: true,
      salePayments: {
        include: {
          paymentMethod: true,
        },
      },
    },
  });

  if (!sales) {
    return { error: "Nenhuma ordem de serviço encontrada" };
  }

  return { success: "Ordens de serviço encontradas", sales };
};

export const cancelSale = async (saleId: string) => {
  const existingSale = await getSaleById(saleId);

  if (!existingSale) {
    return { error: "Ordem de serviço não foi encontrada" };
  }

  const statusSale = await db.statusSale.findFirst({
    where: {
      description: "Cancelada",
    },
  });

  if (!statusSale) {
    return { error: "Não foi possível encontrar o Status pendente" };
  }

  await db.sale.update({
    where: {
      id: existingSale.id,
    },
    data: {
      statusSaleId: statusSale.id,
    },
  });

  return { success: "Ordem de serviço cancelada" };
};

export const finalizeSale = async (saleId: string) => {
  const existingSale = await getSaleById(saleId);

  if (!existingSale) {
    return { error: "Ordem de serviço não foi encontrada" };
  }

  const statusSale = await db.statusSale.findFirst({
    where: {
      description: "Finalizada",
    },
  });

  if (!statusSale) {
    return { error: "Status não encontrado na ordem de serviço" };
  }

  await db.sale.update({
    where: {
      id: existingSale.id,
    },
    data: {
      statusSaleId: statusSale.id,
    },
  });
  return { success: "Ordem de serviço finalizada" };
};
const updateCustomerOnSale = async (saleId: string, customerId: string) => {
  const sale = await db.sale.update({
    where: {
      id: saleId,
    },
    data: {
      customerId: customerId,
    },
  });
};

const createItemsOnSale = async (
  saleId: string,
  servicesIds: string[],
  vehicle: Vehicle
) => {
  for (const serviceId of servicesIds) {
    await db.itemSale.create({
      data: {
        saleId: saleId,
        serviceId: serviceId,
        quantity: 1,
        vehicleId: vehicle.id,
      },
    });
  }
};

const getOrCreateCustomer = async (name: string, phone: string) => {
  const existingCustomer = await db.customer.findFirst({
    where: { phone },
  });

  if (existingCustomer) {
    return existingCustomer;
  }
  if (!name) {
    throw new Error("Para novos clientes é necessário preencher o campo Nome");
  }

  return db.customer.create({
    data: { name, phone },
  });
};

const getOrCreateVehicle = async (
  licensePlate: string,
  model: string,
  customerId: string
) => {
  const existingVehicle = await db.vehicle.findUnique({
    where: { licensePlate },
  });

  if (existingVehicle) {
    return existingVehicle;
  }

  return db.vehicle.create({
    data: { licensePlate, model, customerId },
  });
};
