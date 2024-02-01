"use server";
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
  customerDocument: string
) => {
  if (!saleId || !customerDocument) {
    return { error: "Campos invalidos" };
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

  const existingSale = await db.sale.findUnique({
    where: {
      id: saleId,
    },
    include: {
      customer: true,
    },
  });

  if (!existingSale) {
    return { error: "Ordem de serviço não foi encontrada" };
  }

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
    return { success: "Inserção de veículo com sucesso" };
  }

  await createItemsOnSale(saleId, servicesIds, existingVehicle);

  return { success: "Inserção de veículo com sucesso" };
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

  const existingSale = await db.sale.findUnique({
    where: {
      id: saleId,
    },
  });

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
