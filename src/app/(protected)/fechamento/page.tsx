"use client"

import { getEmployees } from "@/actions/employees";
import { saveSalary } from "@/actions/salary";
import { getSaleByDate } from "@/actions/sales";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import ServiceSale from "../sales/list/_components/servicesale";
import TotalPriceSale from "../sales/list/_components/totalpricesale";
import EmployeeCommissionSale from "./_components/employeecomissionsale";
import TotalCommissions from "./_components/totalcomissions";
import TotalNetPrice from "./_components/totalnetprice";

type SalaryEmployee = {
    id: string;
    amount: number;
}
const DailyClosePage = () => {
    //TODO: fazer filtro de serviços por data
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [sales, setSales] = useState<Sale[] | undefined>();
    const [employees, setEmployees] = useState<Employee[] | undefined>();
    const [billing, setBilling] = useState<Number>(0);
    const [totalPaments, setTotalPayments] = useState<Number>(0);
    const [isPending, startTransition] = useTransition();

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


    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;
        setSelectedDate(date);
    };

    const handleSaveDailyClose = () => {
        let arrayemployee:any = [];
        sales?.forEach((sale)=>{
            employees?.forEach((employee)=>{
                arrayemployee.push({
                    id: employee.id,
                    comission: sale.netPrice * employee.commission
                })
            })
        })
        const arrayEmployeeUnique = somarComissoesPorFuncionario(arrayemployee);


        startTransition(()=>{
            saveSalary(arrayEmployeeUnique).then((data)=>{
                if(data?.error){
                    toast.error(data.error);
                }

                if(data?.success){
                    toast.success(data.success);
                }
            })
        })
    }

    const somarComissoesPorFuncionario = (arrayemployee :any[]) => {
        const comissoesPorFuncionario:any = {};
    
        // Calcula as comissões por funcionário
        arrayemployee.forEach((item) => {
            const { id, comission } = item;
            if (comissoesPorFuncionario[id]) {
                comissoesPorFuncionario[id] += comission;
            } else {
                comissoesPorFuncionario[id] = comission;
            }
        });
    
        // Converte o objeto de comissões por funcionário de volta para um array
        const resultado = Object.keys(comissoesPorFuncionario).map((id) => ({
            id: id,
            comission: comissoesPorFuncionario[id],
        }));
    
        return resultado;
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
                    <TotalNetPrice sales={sales || []} />
                    <TotalCommissions sales={sales || []} employees={employees || []} />
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
                                        <TableHead key={employee.id}>
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
                                                        <EmployeeCommissionSale sale={sale} employee={employee} disabled={isPending} />
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
                                <Button
                                    variant="secondary"
                                    disabled={isPending}
                                    onClick={handleSaveDailyClose}>
                                    Confirmar
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </ScrollArea>
        </div>
    )
}

export default DailyClosePage;
