import { db } from "@/lib/db";

export const getCustomerById = async (id: string) => {
  try {
    const customer = await db.customer.findUnique({
      where: {
        id,
      },
    });

    return customer;
  } catch (error) {
    return null;
  }
};

export const getCustomerByPhone = async (phone: string) => {
  try {
    const customer = await db.customer.findFirst({
      where: {
        phone,
      },
    });

    return customer;
  } catch (error) {
    return null;
  }
};