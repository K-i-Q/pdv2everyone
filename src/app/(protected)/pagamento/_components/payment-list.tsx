import { getEmployees } from "@/actions/employees";
import { getPendingSalarys, saveSalaryPaid } from "@/actions/salary";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatPriceBRL } from "@/utils/mask";
import { toast } from "sonner";

export default async function PaymentList() {
    const employees = await getEmployees();
    const salarys = await getPendingSalarys();

    if (!salarys.salarys && !employees.employees) return <p className="text-white">Salário e colaboradores não encontrados</p>
    if (!salarys.salarys) return <p className="text-white">Não há salários pendentes</p>
    if (!employees.employees) return <p className="text-white">Colaboradores não encontrados</p>

    const calculateSalaries = (employees: Employee[], salaries: Salary[]) => {
        if (!employees || !salaries) return;

        if (employees.length <= 0 || salaries.length <= 0) return;
        const totalSalaries: Record<string, number> = {};
        let totalSalary = 0;

        salaries.forEach(salary => {
            totalSalary += salary.amount;
        });
        employees.forEach(employee => {
            totalSalaries[employee.id] = 0;
        });

        salaries.forEach(salary => {
            totalSalaries[salary.employeeId] += salary.amount;
        });

        const employeesWithTotalSalaries = employees.map(employee => ({
            ...employee,
            salary: totalSalaries[employee.id]
        }));
        return { totalSalary, employeesWithTotalSalaries };
    };

    const calculo = calculateSalaries(employees.employees as Employee[], salarys.salarys as Salary[]);


    const handleSave = () => {
        saveSalaryPaid(salarys.salarys as Salary[]).then((data) => {
            if (data?.error) {
                toast.error(data.error);
            }
            if (data?.success) {
                toast.success(data.success);
            }
        })
    }

    return (
        <>
            <CardContent>
                {calculo?.employeesWithTotalSalaries && calculo?.employeesWithTotalSalaries.length > 0 && (
                    <div className="flex flex-col space-y-4">
                        {
                            calculo?.employeesWithTotalSalaries.map((employeeSalary) => (
                                <Label className="flex items-center justify-between" key={employeeSalary.id}>
                                    {employeeSalary.name}: <span>{formatPriceBRL(employeeSalary.salary)}</span>
                                </Label>
                            ))
                        }
                        <Label className="flex items-center justify-between">Total: <span>{formatPriceBRL(calculo.totalSalary)}</span></Label>
                    </div>
                )}
                {(!calculo?.employeesWithTotalSalaries || calculo?.employeesWithTotalSalaries.length <= 0) && (
                    <div className="flex flex-col space-y-4">
                        <Label className="flex items-center justify-between">Nenhum pagamento pendente</Label>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex item-center justify-end">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className={(!calculo?.employeesWithTotalSalaries || calculo?.employeesWithTotalSalaries.length <= 0) ? `hidden` : ''}>Pagar</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            Confirmar Pagamento
                        </DialogHeader>
                        <div>
                            Confirmar pagamento de <span>{formatPriceBRL(calculo?.totalSalary || 0)}</span>?
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button onClick={handleSave}>Confirmar</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </>
    )
}