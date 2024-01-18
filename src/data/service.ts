import { db } from "@/lib/db";

export const getServiceByName = async (name: string) => {
  try {
    const service = await db.service.findUnique({
      where: {
        name,
      },
    });

    return service;
  } catch (error) {
    return null;
  }
};

export const getServiceById = async (id: string) => {
  try {
    const service = await db.service.findUnique({
      where: {
        id,
      },
    });

    return service;
  } catch (error) {
    return null;
  }
};
