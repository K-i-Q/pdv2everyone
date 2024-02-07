"use server";

import { db } from "@/lib/db";

export const createStatusSales = async () => {
    await db.statusSale.createMany({
      data: [
        {
          description: "Em atendimento",
          createAt: new Date(),
          status: true,
        },
        {
          description: "Cancelada",
          createAt: new Date(),
          status: true,
        },
        {
          description: "Finalizada",
          createAt: new Date(),
          status: true,
        },
      ],
    });
  
    return { success: "Status de vendas criados" };
  };
  