"use server";

import { currentRole } from "@/lib/auth";

export const admin = async () => {
  const role = await currentRole();

  // if (role === UserRole.ADMIN) {
  //   return { success: "Acesso Permitido" };
  // }
  return { error: "Acesso Negado" };
};
