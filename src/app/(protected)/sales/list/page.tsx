"use client";

import { cancelSale, getPendingSales } from "@/actions/sales";
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
                            // Assegure-se de incluir as propriedades faltantes com valores padrão ou mapeados
                            return {
                                ...sale,
                                employees: sale.employees || [],
                                salePayments: sale.salePayments || [],
                                // Outras propriedades conforme necessário
                            };
                        }).sort((a: Sale, b: Sale) => {
                            // Comparando as strings de pickupTime diretamente
                            return a.pickupTime?.localeCompare(b.pickupTime || '');
                        });
                        setSales(formattedSales);
                    }
                });
            });
        }, 3000); // Chama a função a cada 3 segundos

        // Limpeza: é chamada quando o componente é desmontado
        return () => clearInterval(intervalId);
    }, []); // Array de dependências vazio significa que o useEffect rodará apenas uma vez após o componente montar

    const handleCancelSale = (saleId: string) => {
        startTransition(() => {
            cancelSale(saleId).then((data) => {
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
        <div className="min-h-screen flex flex-col px-5 items-center justify-center">
            {sales && (
                <>
                    {sales.length > 0 && (
                        <ScrollArea className="h-[400px] w-full">
                            <Table className="bg-black text-white w-full">
                                <TableHeader>
                                    <TableRow className="text-white">
                                        <TableHead className="w-[100px]">Horário</TableHead>
                                        <TableHead className="w-[100px]">Cliente</TableHead>
                                        <TableHead className="w-[100px]">Placa</TableHead>
                                        <TableHead className="w-[100px] text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sales.map((sale) => (
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
                                                                <Textarea value={sale?.note || ''}></Textarea>
                                                                <TotalPriceSale sale={sale} />
                                                            </CardContent>
                                                            <CardFooter className="md:flex-row flex-col-reverse items-center justify-between gap-3">
                                                                <Button
                                                                    className="gap-x-3 w-full"
                                                                    variant="secondary"
                                                                    onClick={() => handleCancelSale(sale.id)}
                                                                >
                                                                    <MdOutlineCancel />
                                                                    Cancelar Atendimento
                                                                </Button>
                                                                <DialogClose asChild>
                                                                    <Button
                                                                        className="w-full"
                                                                        variant="outline"
                                                                    >
                                                                        Fechar
                                                                    </Button>
                                                                </DialogClose>
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button
                                                                            className="w-full"
                                                                        >Finalizar</Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="p-0 w-full bg-transparent boder-none">
                                                                        <Card>
                                                                            <CardHeader>
                                                                                Confirmar Entrega
                                                                            </CardHeader>
                                                                            <CardContent className="flex flex-col md:gap-y-3">
                                                                                <Label>Tem certeza que deseja finalizar a ordem de servio do João da Silva?</Label>
                                                                            </CardContent>
                                                                            <CardFooter className="items-center justify-between gap-x-3">
                                                                                <DialogClose asChild>
                                                                                    <Button
                                                                                        className="w-full"
                                                                                        variant="outline"
                                                                                    >
                                                                                        Cancelar
                                                                                    </Button>
                                                                                </DialogClose>

                                                                                <Button
                                                                                    className="w-full"
                                                                                >Confirmar</Button>
                                                                            </CardFooter>
                                                                        </Card>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </CardFooter>
                                                        </Card>
                                                    </DialogContent>
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
            )
            }
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