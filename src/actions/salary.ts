"use server";

import { EmployeeCommission } from "@/app/(protected)/fechamento/page";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const saveSalary = async (
  employeeCommissions: EmployeeCommission,
  salaryDate: Date
) => {
  if (!employeeCommissions || Object.keys(employeeCommissions).length === 0) {
    return { error: "Dados inválidos" };
  }

  try {
    const currentDate = new Date();

    await Promise.all(
      Object.entries(employeeCommissions).map(
        async ([employeeId, salary]: [string, number]) => {
          const existingSalary = await db.salary.findFirst({
            where: {
              employeeId: employeeId,
              salaryDate: {
                gte: new Date(
                  salaryDate.getFullYear(),
                  salaryDate.getMonth(),
                  salaryDate.getDate()
                ),
                lt: new Date(
                  salaryDate.getFullYear(),
                  salaryDate.getMonth(),
                  salaryDate.getDate() + 1
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
                paid: false,
              },
            });
          } else {
            await db.salary.create({
              data: {
                amount: salary,
                createAt: currentDate,
                employeeId: employeeId,
                salaryDate: salaryDate,
              },
            });
          }
        }
      )
    );
    revalidatePath("/pagamento");
    return { success: "Salários salvos com sucesso" };
  } catch (error) {
    return { error: "Erro ao salvar os salários " + error };
  }
};

export const getPendingSalarys = async () => {
  const existingPendingSalarys = await db.salary.findMany({
    where: {
      paid: false,
    },
  });
  revalidatePath("/pagamento");

  if (!existingPendingSalarys || existingPendingSalarys.length === 0) {
    return { error: "Não existe salários pendentes" };
  }
  return {
    success: "Salários pendentes encontrados",
    salarys: existingPendingSalarys,
  };
};

export const saveSalaryPaid = async (salaries: Salary[]) => {
  if (salaries.length <= 0) {
    return { error: "Dados inválidos" };
  }

  try {
    await db.salary.updateMany({
      where: {
        id: {
          in: salaries.map((salary) => salary.id),
        },
      },
      data: {
        paid: true,
      },
    });
    revalidatePath("/pagamento");

    return { success: "Salários atualizados." };
  } catch (error) {
    return { error: "Erro ao atualizar os salários." };
  }
};
