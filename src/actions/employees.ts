"use server";
import { db } from "@/lib/db";

export const getEmployees = async () => {
  const employees = await db.employee.findMany();

  if (!employees) {
    return { error: "Nenhum funcionário encontrado" };
  }

  return { success: "Funcionários encontrados", employees:employees };
};
