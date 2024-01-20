"use server";
import { db } from "@/lib/db";

export const getProducts = async () => {
  const products = await db.product.findMany();

  if (!products) {
    return { error: "Nenhum serviço cadastrado" };
  }

  return { success: "Serviços encontrados", services: products };
};
