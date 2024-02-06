"use server";
import { getCustomerById } from "@/data/customer";
import { getPaymentMethodById } from "@/data/paymentMethod";
import { getSaleById } from "@/data/sale";
import { db } from "@/lib/db";
import { Vehicle } from "@prisma/client";

export const createSale = async (employeeId: string) => {
  if (!employeeId) {
    return { error: "Colaborador não foi selecionado" };
  }

  const createAt = new Date();
  const sale = await db.sale.create({
    data: {
      createAt,
      grossPrice: 0,
      netPrice: 0,
      employees: {
        create: [
          {
            employeeId: employeeId,
            initiatedByEmployee: true,
          },
        ],
      },
    },
  });

  return { success: "Venda concluída com sucesso", saleId: sale.id };
};

export const saveCustomer = async (
  saleId: string,
  customerDocument: string,
  customerName: string
) => {
  if (!saleId || !customerDocument || !customerName) {
    return { error: "Campos invalidos" };
  }
  const existingSale = await getSaleById(saleId);

  if (!existingSale) {
    return { error: "Ordem de serviço não foi encontradas" };
  }

  const existingCustomer = await db.customer.findUnique({
    where: {
      document: customerDocument,
    },
  });
  if (!existingCustomer) {
    const customer = await db.customer.create({
      data: {
        document: customerDocument,
        name: customerName,
      },
    });

    await updateCustomerOnSale(saleId, customer.id);

    return { success: "Cliente adicionado" };
  }

  await updateCustomerOnSale(saleId, existingCustomer.id);

  return { success: "Cliente adicionado" };
};

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

export const createEmployees = async () => {
  await db.employee.createMany({
    data: [
      {
        name: "Alice",
        document: "12345678901",
        gender: "Feminino",
        phone: "11999999999",
        createAt: new Date(),
        birthday: new Date("1990-01-01"),
        status: true,
        commission: 0.1,
      },
      {
        name: "Bob",
        document: "23456789012",
        gender: "Masculino",
        phone: "11888888888",
        createAt: new Date(),
        birthday: new Date("1991-02-02"),
        status: true,
        commission: 0.15,
      },
      {
        name: "Carol",
        document: "34567890123",
        gender: "Feminino",
        phone: "11777777777",
        createAt: new Date(),
        birthday: new Date("1992-03-03"),
        status: true,
        commission: 0.12,
      },
      {
        name: "Dave",
        document: "45678901234",
        gender: "Masculino",
        phone: "11666666666",
        createAt: new Date(),
        birthday: new Date("1993-04-04"),
        status: true,
        commission: 0.1,
      },
    ],
  });

  return { success: "Funcionarios criados" };
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

export const getSales = async (): Promise<any> => {
  const sales = await db.sale.findMany({
    where: {
      pickupTime: {
        not: null,
      },
    },
    include:{
      customer: true,
      items: {
        include: {
          vehicle: true,
          service: true,
          product: true
        }
      }

    }
  });

  if (!sales) {
    return { error: "Nenhuma ordem de serviço encontrada" };
  }

  return { success: "Ordens de serviço encontradas", sales };
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
