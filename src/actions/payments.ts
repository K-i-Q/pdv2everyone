"use server";

import { db } from "@/lib/db";

export const getPayments = async () => {
  const paymentMethods = await db.paymentMethod.findMany();
  if (!paymentMethods) {
    return { error: "Formas de pagamento não encontradas" };
  }
  return { success: "Pagamentos encontrados", paymentMethods };
};
