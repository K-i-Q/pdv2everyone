"use server";
import { db } from "@/lib/db";

export const createSale = async (employeeId:string) => {
  if (!employeeId) {
    return { error: "Colaborador não foi selecionado" };
  }


  const createAt = new Date();
  await db.sale.create({
    data: {
      createAt,
      grossPrice: 0,
      netPrice: 0,
      employees: {
        create: [{
          employeeId: employeeId,
          initiatedByEmployee: true
        }]
      }
    },
  });

  return { success: "Venda concluída com sucesso" };
};
