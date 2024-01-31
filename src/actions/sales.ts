"use server";
import { db } from "@/lib/db";

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

  const customer = await db.customer.create({
    data: {
      document: customerDocument,
    },
  });

  const sale = await db.sale.update({
    where: {
      id: saleId,
    },
    data: {
      customerId: customer.id,
    },
  });

  return { success: "Cliente adicionado" };
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
