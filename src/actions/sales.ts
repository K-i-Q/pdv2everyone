"use server";
import { db } from "@/lib/db";
import { SalesSchema } from "@/schemas";
import * as z from "zod";

export const createSale = async (values: z.infer<typeof SalesSchema>) => {
  const validateFields = SalesSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Campos inválidos" };
  }

  const { price, licensePlate, model, services, products, note, isDeferredPayment } =
    validateFields.data;

  const priceFloat = parseFloat(price ?? "0");

  const paymentMethod = await db.paymentMethod.findFirst({
    where: {
      description: "Dinheiro",
    },
  });
  if (!paymentMethod) {
    return { error: "Forma de pagamento não encontrada " };
  }

  const createAt = new Date();
  await db.sale.create({
    data: {
      paymentDate: createAt,
      createAt,
      price: priceFloat,
      paymentMethodId: paymentMethod.id,
      note,
      isDeferredPayment
    },
  });

  return { success: "Venda concluída com sucesso" };
};
