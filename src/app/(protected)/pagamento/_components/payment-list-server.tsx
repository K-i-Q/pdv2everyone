import { getEmployees } from "@/actions/employees";
import { getPendingSalarys } from "@/actions/salary";

export async function getServerData() {
    const employees = await getEmployees();
    const salarys = await getPendingSalarys();

    return { employees, salarys };
}