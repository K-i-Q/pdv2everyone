import { db } from "@/lib/db";

export const getSaleById = async (id: string) => {
  try {
    const sale = await db.sale.findUnique({
      where: {
        id,
      },
    });

    return sale;
  } catch (error) {
    return null;
  }
};
