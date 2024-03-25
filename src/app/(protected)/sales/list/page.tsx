"use client";

import { cancelSale, finalizeSale, getPendingSales } from "@/actions/sales";
import LoadingAnimation from "@/components/custom/LoadingAnimation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { DialogClose } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { FaEye } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { toast } from "sonner";
import PaymentInfoSale from "./_components/paymentinfosale";
import ServiceSale from "./_components/servicesale";
import TotalPriceSale from "./_components/totalpricesale";
import VehicleSale from "./_components/vehiclesale";



const SalesListPage = () => {
    const router = useRouter();
    const [sales, setSales] = useState<Sale[] | undefined>();
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const intervalId = setInterval(() => {
            startTransition(() => {
                getPendingSales().then((data) => {
                    if (data?.error) {
                        toast.error(data.error);
                    }

                    if (data?.success && data?.sales) {
                        const formattedSales: Sale[] = data.sales.map((sale: any) => {
                            return {
                                ...sale,
                                employees: sale.employees || [],
                                salePayments: sale.salePayments || [],
                            };
                        }).sort((a: Sale, b: Sale) => {
                            return a.pickupTime?.localeCompare(b.pickupTime || '');
                        });
                        setSales(formattedSales);
                    }
                });
            });
        }, 3000); 

        return () => clearInterval(intervalId);
    }, []); 

    const handleCancelSale = (saleId: string, index: number) => {
        startTransition(() => {
            cancelSale(saleId).then((data) => {
                if (data?.error) {
                    toast.error(data.error);
                }

                if (data?.success) {
                    toast.success(data.success);
                    closeResumeDialog(index);
                }
            })
        })
    }

    const handleFinalizeSale = (saleId: string, index: number) => {
        startTransition(() => {
            finalizeSale(saleId).then((data) => {
                if (data?.error) {
                    toast.error(data.error);
                }
                if (data?.success) {
                    toast.success(data.success);
                    closeResumeDialog(index);
                }
            })
        })
    }

    const closeResumeDialog = (index: number) => {
        const dialogResume = document.getElementById('close-resume' + index);
        if (dialogResume) dialogResume.click();
    }

    return (
        <div className="min-h-screen flex flex-col px-5 items-center justify-center">
            {sales && (
                <>
                    {sales.length > 0 && (
                        <ScrollArea className="h-[400px] w-full">
                            <Table className="bg-black text-white w-full">
                                <TableHeader>
                                    <TableRow className="text-white">
                                        <TableHead className="w-[100px] text-center">Horário</TableHead>
                                        <TableHead className="w-[100px] text-center">Cliente</TableHead>
                                        <TableHead className="w-[100px] text-center">Placa</TableHead>
                                        <TableHead className="w-[100px] text-center">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="text-center">
                                    {sales.map((sale, index) => (
                                        <TableRow
                                            key={sale.id}
                                        >
                                            <TableCell>
                                                {sale.pickupTime}
                                            </TableCell>
                                            <TableCell>
                                                {sale.customer?.name}
                                            </TableCell>
                                            <TableCell>
                                                {sale.items.length > 0 && sale.items[0].vehicle ? sale.items[0].vehicle.licensePlate : 'N/A'}
                                            </TableCell>
                                            <TableCell className="flex items-center justify-center text-yellow-400">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button aria-label="Visualizar resumo da Ordem de Serviço">
                                                            <FaEye />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="p-0 w-full bg-transparent boder-none">
                                                        <Card className="w-full">
                                                            <CardHeader>
                                                                Resumo
                                                            </CardHeader>
                                                            <CardContent className="flex flex-col md:gap-y-3 space-y-2">
                                                                <Label className="flex items-center justify-between">Cliente: <span>{sale.customer?.name} {sale.customer?.phone}</span></Label>
                                                                <Separator />
                                                                <VehicleSale sale={sale} />
                                                                <Separator />
                                                                <ServiceSale sale={sale} />
                                                                <Separator />
                                                                <Label className="flex items-center justify-between">Horário: <span>{sale.pickupTime}</span></Label>
                                                                <Separator />
                                                                <PaymentInfoSale sale={sale} />
                                                                <Separator />
                                                                <Label>Observações</Label>
                                                                <Textarea disabled={isPending} value={sale?.note || ''}></Textarea>
                                                                <TotalPriceSale sale={sale} />
                                                            </CardContent>
                                                            <CardFooter className="md:flex-row flex-col-reverse items-center justify-between gap-3">
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button
                                                                            className="gap-x-3 w-full"
                                                                            variant="secondary"
                                                                            disabled={isPending}
                                                                        >
                                                                            <MdOutlineCancel />
                                                                            Cancelar Atendimento
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="p-0 w-full bg-transparent boder-none">
                                                                        <Card>
                                                                            <CardHeader>
                                                                                Confirmar Cancelamento
                                                                            </CardHeader>
                                                                            <CardContent className="flex flex-col md:gap-y-3">
                                                                                <Label>Tem certeza que deseja CANCELAR a ordem de servio do João da Silva?</Label>
                                                                            </CardContent>
                                                                            <CardFooter className="items-center justify-between gap-x-3">
                                                                                <DialogClose asChild>
                                                                                    <Button
                                                                                        className="w-full"
                                                                                        variant="outline"
                                                                                        disabled={isPending}
                                                                                    >
                                                                                        Voltar
                                                                                    </Button>
                                                                                </DialogClose>
                                                                                <DialogClose asChild>
                                                                                    <Button
                                                                                        className="w-full"
                                                                                        onClick={() => handleCancelSale(sale.id, index)}
                                                                                        disabled={isPending}
                                                                                    >
                                                                                        Cancelar
                                                                                    </Button>
                                                                                </DialogClose>
                                                                            </CardFooter>
                                                                        </Card>
                                                                    </DialogContent>
                                                                </Dialog>
                                                                <DialogClose asChild>
                                                                    <Button
                                                                        className="w-full"
                                                                        variant="outline"
                                                                        disabled={isPending}
                                                                    >
                                                                        Fechar
                                                                    </Button>
                                                                </DialogClose>
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button
                                                                            className="w-full"
                                                                            disabled={isPending}
                                                                        >Finalizar</Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="p-0 w-full bg-transparent boder-none">
                                                                        <Card>
                                                                            <CardHeader>
                                                                                Confirmar Entrega
                                                                            </CardHeader>
                                                                            <CardContent className="flex flex-col md:gap-y-3">
                                                                                <Label>Tem certeza que deseja FINALIZAR a ordem de servio do João da Silva?</Label>
                                                                            </CardContent>
                                                                            <CardFooter className="items-center justify-between gap-x-3">
                                                                                <DialogClose asChild>
                                                                                    <Button
                                                                                        className="w-full"
                                                                                        variant="outline"
                                                                                        disabled={isPending}
                                                                                    >
                                                                                        Cancelar
                                                                                    </Button>
                                                                                </DialogClose>

                                                                                <Button
                                                                                    className="w-full"
                                                                                    disabled={isPending}
                                                                                    onClick={() => handleFinalizeSale(sale.id, index)}
                                                                                >Confirmar</Button>
                                                                            </CardFooter>
                                                                        </Card>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </CardFooter>
                                                        </Card>
                                                    </DialogContent>
                                                    <DialogClose asChild>
                                                        <Button
                                                            className="hidden"
                                                            id={`close-resume${index}`}
                                                        ></Button>
                                                    </DialogClose>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    )}
                    {sales.length === 0 && (
                        <>
                            Nenhuma Ordem de serviço encontrada
                        </>
                    )}
                </>
            )}
            {
                !sales && (
                    <>
                        <LoadingAnimation />
                    </>
                )
            }
            <Button
                onClick={() => router.push('/sales')}
            >
                Voltar
            </Button>
        </div>
    )
}

export default SalesListPage;