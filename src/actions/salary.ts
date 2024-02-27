"use server";

import { EmployeeCommission } from "@/app/(protected)/fechamento/page";
import { db } from "@/lib/db";

export const saveSalary = async (employeeCommissions: EmployeeCommission) => {
  if (!employeeCommissions || Object.keys(employeeCommissions).length === 0) {
    return { error: "Dados inválidos" };
  }

  try {
    const currentDate = new Date();

    await Promise.all(
      Object.entries(employeeCommissions).map(async ([employeeId, salary]) => {
        const existingSalary = await db.salary.findFirst({
          where: {
            employeeId: employeeId,
            createAt: {
              gte: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate()
              ),
              lt: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate() + 1
              ),
            },
          },
        });

        if (existingSalary) {
          await db.salary.update({
            where: {
              id: existingSalary.id,
            },
            data: {
              amount: salary,
              createAt: currentDate,
            },
          });
        } else {
          await db.salary.create({
            data: {
              amount: salary,
              createAt: currentDate,
              employeeId: employeeId,
            },
          });
        }
      })
    );

    return { success: "Salários salvos com sucesso" };
  } catch (error) {
    return { error: "Erro ao salvar os salários " + error };
  }
};
