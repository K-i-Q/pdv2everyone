import { db } from "@/lib/db";

export const getPaymentMethodById = async (id: string) => {
  try {
    const paymentMethod = await db.paymentMethod.findUnique({
      where: {
        id,
      },
    });

    return paymentMethod;
  } catch (error) {
    return null;
  }
};
