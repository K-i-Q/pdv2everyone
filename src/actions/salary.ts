"use server";

import { db } from "@/lib/db";

export const saveSalary = async (employessComissions: any[]) => {
  if (employessComissions.length <= 0) {
    return { error: "Dados inválidos" };
  }

  try {
    // Criar um array de objetos para inserção em lote
    const salariesToCreate: any[] = employessComissions.map(item => ({
      amount: item.comission, // Usando 'comission' como o valor do salário
      createAt: new Date(), // Definindo a data do salário como agora
      employeeId: item.id // Usando 'id' como o id do empregado
    }));

    // Inserir salários na base de dados
    await db.salary.createMany({
      data: salariesToCreate,
    });

    return { success: "Salários salvos com sucesso" };
  } catch (error) {
    return { error: "Erro ao salvar os salários" };
  }
};
