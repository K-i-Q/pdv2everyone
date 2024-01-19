"use server";
import { db } from "@/lib/db";
import { SalesSchema } from "@/schemas";
import * as z from "zod";

export const createSale = async (values: z.infer<typeof SalesSchema>) => {
  const validateFields = SalesSchema.safeParse(values);
  console.log('chegou aqui tambem')
  if (!validateFields.success) {
    return { error: "Campos inválidos" };
  }

  const { price, licensePlate, model, services, products } =
    validateFields.data;
  const priceFloat = parseFloat(price);

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
    },
  });

  return { success: "Venda concluída com sucesso" };
};
