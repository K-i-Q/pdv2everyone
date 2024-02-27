"use client"
import { getEmployees } from "@/actions/employees";
import { getPendingSalarys, saveSalaryPaid } from "@/actions/salary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatPriceBRL } from "@/utils/mask";
import { Suspense, useEffect, useLayoutEffect, useState, useTransition } from "react";
import { toast } from "sonner";

type EmployeeSalaryType = {
    id: string;
    name: string;
    salary: number;
}
export default function PaymentPage() {

    const [salarys, setSalarys] = useState<Salary[]>([]);
    const [isPending, startTransition] = useTransition();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeeSalary, setEmployeeSalary] = useState<EmployeeSalaryType[]>();
    const [totalSalarys, setTotalSalarys] = useState<number>(0);

    useLayoutEffect(() => {
        getSalarys();
        getEmployess();
    }, []);

    useEffect(() => {
        if (employees && salarys) {
            calculateSalaries(employees, salarys);
        }
    }, [salarys, employees])

    const getSalarys = () => {
        startTransition(() => {
            getPendingSalarys().then((data) => {
                if (data?.error) {
                    toast.error(data.error);
                }
                if (data?.success) {
                    toast.success(data.success);
                    setSalarys(data.salarys as Salary[]);
                    //TODO: Atualizar estado do componente
                }
            })
        })
    }

    const getEmployess = () => {
        getEmployees().then((data) => {
            if (data?.error) {
                toast.error(data.error);
            }

            if (data?.success) {
                toast.success(data.success);
                setEmployees(data.employees);
            }
        })
    }

    const calculateSalaries = (employees: Employee[], salaries: Salary[]) => {
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

        setTotalSalarys(totalSalary);
        setEmployeeSalary(employeesWithTotalSalaries);
    };

    const handleSave = () => {
        startTransition(() => {
            saveSalaryPaid(salarys).then((data) => {
                if (data?.error) {
                    toast.error(data.error);
                }
                if (data?.success) {
                    toast.success(data.success);
                }
            })
        })
    }

    return (
        <section className="flex flex-col items-center justify-center">
            <Card>
                <CardHeader>
                    Pagamentos Pendentes
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<p className="text-white">Carregando...</p>}>
                        {employeeSalary && employeeSalary.length > 0 && (
                            <div className="flex flex-col space-y-4">
                                {
                                    employeeSalary.map((employeeSalary) => (
                                        <Label className="flex items-center justify-between" key={employeeSalary.id}>
                                            {employeeSalary.name}: <span>{formatPriceBRL(employeeSalary.salary)}</span>
                                        </Label>
                                    ))
                                }
                                <Label className="flex items-center justify-between">Total: <span>{formatPriceBRL(totalSalarys)}</span></Label>
                            </div>
                        )}
                        {(!employeeSalary || employeeSalary.length <= 0) && (
                            <div className="flex flex-col space-y-4">
                                <Label className="flex items-center justify-between">Nenhum pagamento pendente</Label>
                            </div>
                        )}
                    </Suspense>
                </CardContent>
                <CardFooter className="flex item-center justify-end">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className={(!employeeSalary || employeeSalary.length <= 0) ? `hidden` : ''} disabled={isPending}>Pagar</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                Confirmar Pagamento
                            </DialogHeader>
                            <div>
                                Confirmar pagamento de <span>{formatPriceBRL(totalSalarys)}</span>?
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button disabled={isPending} onClick={handleSave}>Confirmar</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </Card>
        </section>
    )
}