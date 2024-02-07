"use server";

import { db } from "@/lib/db";

export const getPayments = async () => {
  const paymentMethods = await db.paymentMethod.findMany();
  if (!paymentMethods) {
    return { error: "Formas de pagamento não encontradas" };
  }
  return { success: "Pagamentos encontrados", paymentMethods };
};

export const createPaymentMethods = async () => {
  await db.paymentMethod.createMany({
    data: [
      {
        description: "Débito",
        createAt: new Date(),
        status: true,
      },
      {
        description: "Crédito",
        createAt: new Date(),
        status: true,
      },
      {
        description: "Dinheiro",
        createAt: new Date(),
        status: true,
      },
    ],
  });

  return { success: "Formas de pagamento criadas" };
};