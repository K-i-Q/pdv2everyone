"use server";
import { db } from "@/lib/db";

export const getEmployees = async () => {
  const employees = await db.employee.findMany({
    where:{
      status: true
    }
  });

  if (!employees) {
    return { error: "Nenhum funcionário encontrado" };
  }

  return { success: "Funcionários encontrados", employees:employees };
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
