"use client"

import { getEmployees } from "@/actions/employees";
import { saveSalary } from "@/actions/salary";
import { getSaleByDate } from "@/actions/sales";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPriceBRL } from "@/utils/mask";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import ServiceSale from "../sales/list/_components/servicesale";
import TotalPriceSale from "../sales/list/_components/totalpricesale";
import EmployeeCommissionSale from "./_components/employeecomissionsale";
import TotalCommissions from "./_components/totalcomissions";
import TotalNetPrice from "./_components/totalnetprice";

export type SalaryEmployee = {
    [key: string]: {
        [key: string]: number;
    };
}

export type EmployeeCommission = {
    [key: string]: number;
}
const DailyClosePage = () => {
    //TODO: fazer filtro de serviços por data
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [sales, setSales] = useState<Sale[] | undefined>();
    const [employees, setEmployees] = useState<Employee[] | undefined>();
    const [billing, setBilling] = useState<number>(0);
    const [totalPayments, setTotalPayments] = useState<number>(0);
    const [isPending, startTransition] = useTransition();
    const [salary, setSalary] = useState<SalaryEmployee>({});
    const [employeCommission, setEmployeeCommission] = useState<EmployeeCommission>();

    const getServices = () => {
        getSaleByDate(selectedDate!).then((data) => {
            if (data?.error) {
                toast.error(data.error)
            }
            if (data?.success) {
                toast.success(data.success)
                setSales(data.sales as Sale[])
            }
        });
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

    useEffect(() => {
        getServices();
        getEmployess();
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setTotalPayments(calculateMatrixSum(salary));
    }, [salary]);

    const calculateMatrixSum = (matrix: SalaryEmployee): number => {
        if (!matrix) return 0;
        let sum = 0;

        Object.keys(matrix).forEach(employeeId => {
            Object.keys(matrix[employeeId]).forEach(saleId => {
                sum += matrix[employeeId][saleId];
            });
        });

        return sum;
    };


    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;
        setSelectedDate(date);
    };

    const handleSaveDailyClose = () => {

        if (!employeCommission || !selectedDate) return;

        startTransition(() => {
            saveSalary(employeCommission, selectedDate).then((data) => {
                if (data?.error) {
                    toast.error(data.error);
                }

                if (data?.success) {
                    toast.success(data.success);
                }
            })
        })
    }

    const calcularTotalComissoes = (salaryEmployee: SalaryEmployee) => {
        const totalComissoesPorEmpregado: EmployeeCommission = {};

        for (const empregadoId in salaryEmployee) {
            const vendas = salaryEmployee[empregadoId];
            let totalComissaoEmpregado = 0;

            for (const vendaId in vendas) {
                const comissao = vendas[vendaId];
                totalComissaoEmpregado += comissao;
            }

            totalComissoesPorEmpregado[empregadoId] = totalComissaoEmpregado;
        }
        setEmployeeCommission(totalComissoesPorEmpregado);
    }

    return (
        <div className="min-h-screen w-full md:px-10 px-5 flex flex-col items-center justify-center">
            <Card className="w-full m-3 md:grid md:grid-cols-2">
                <CardHeader className="flex-col md:flex-row items-center justify-center gap-y-3 md:space-x-2 ">
                    <Dialog>
                        <DialogTrigger className="flex flex-col md:flex-row gap-y-3 w-full outline-none pt-1">
                            <Label className="text-left">Escolha uma data para fechamento:</Label>
                            <Input
                                readOnly
                                className="text-center"
                                value={selectedDate?.toLocaleDateString('pt-BR')}
                            />
                        </DialogTrigger>
                        <DialogContent className="items-center justify-center">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                initialFocus
                            />
                            <DialogClose asChild>
                                <Button variant="ghost" onClick={getServices}>
                                    Confirmar
                                </Button>
                            </DialogClose>
                        </DialogContent>
                    </Dialog>
                    <Button className="w-full md:w-auto">Pesquisar</Button>
                </CardHeader>
                <CardHeader>
                    <TotalNetPrice sales={sales || []} setBilling={setBilling} />
                    <div className="hidden">
                        <TotalCommissions setSalary={setSalary} sales={sales || []} employees={employees || []} />
                    </div>
                    Total comissões: {formatPriceBRL(totalPayments)}
                </CardHeader>
            </Card>
            <ScrollArea className="h-[400px] w-full">
                <Table className="bg-black text-white w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Placa</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>Serviços</TableHead>
                            <TableHead>Preço</TableHead>
                            {employees && employees.length > 0 && (
                                <>
                                    {employees.map((employee) => (
                                        <TableHead className="w-[100px]" key={employee.id}>
                                            {employee.name}
                                        </TableHead>
                                    ))
                                    }
                                </>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales && sales.length > 0 && (
                            <>
                                {sales.map((sale) => (
                                    <TableRow key={sale.id}>
                                        <TableCell>
                                            {sale.items.length > 0 && sale.items[0].vehicle ? sale.items[0].vehicle.licensePlate : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {sale.items.length > 0 && sale.items[0].vehicle ? sale.items[0].vehicle.model : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <ServiceSale sale={sale} showLabel={false} />
                                        </TableCell>
                                        <TableCell>
                                            <TotalPriceSale sale={sale} showLabel={false} />
                                        </TableCell>
                                        {employees && employees.length > 0 && (
                                            <>
                                                {employees.map((employee) => (
                                                    <TableCell key={employee.id}>
                                                        <EmployeeCommissionSale salary={salary} setSalary={setSalary} sale={sale} employee={employee} disabled={isPending} />
                                                    </TableCell>
                                                ))
                                                }
                                            </>
                                        )}
                                    </TableRow>
                                ))}
                            </>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell className="text-right" colSpan={4 + (employees?.length || 0)}>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="secondary" onClick={() => calcularTotalComissoes(salary)}>
                                            Confirmar
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            Resumo do Fechamento
                                        </DialogHeader>
                                        {employeCommission && Object.keys(employeCommission).length > 0 && (
                                            <>
                                                {Object.entries(employeCommission).map(([employeeId, salary]) => {
                                                    const employee = employees!.find(emp => emp.id === employeeId);
                                                    if (employee) {
                                                        return (
                                                            <div key={employeeId}>
                                                                <p>{employee.name}: {formatPriceBRL(salary)}</p>
                                                            </div>
                                                        );
                                                    } else {
                                                        return (
                                                            <div key={employeeId}>
                                                                <p>{employeeId} : {formatPriceBRL(salary)} </p>
                                                            </div>
                                                        );
                                                    }
                                                })}
                                            </>
                                        )}
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button
                                                    variant="secondary"
                                                    disabled={isPending}
                                                    onClick={handleSaveDailyClose}>
                                                    Confirmar
                                                </Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </ScrollArea>
        </div>
    )
}

export default DailyClosePage;
