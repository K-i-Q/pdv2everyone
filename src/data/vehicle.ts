import { db } from "@/lib/db";

export const getVehicleById = async (id: string) => {
  try {
    const vehicle = await db.vehicle.findUnique({
      where: {
        id,
      },
    });

    return vehicle;
  } catch (error) {
    return null;
  }
};

export const getVehicleByPlate = async (licensePlate: string) => {
  try {
    const vehicle = await db.vehicle.findFirst({
      where: {
        licensePlate,
      },
    });

    return vehicle;
  } catch (error) {
    return null;
  }
};