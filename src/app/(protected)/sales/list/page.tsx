"use client";

import { getSales } from "@/actions/sales";
import LoadingAnimation from "@/components/custom/LoadingAnimation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { FaEye } from "react-icons/fa";
import { toast } from "sonner";

type DeferredPayment = {
    // Defina a estrutura de DeferredPayment conforme necessário
};

type ItemSale = {
    id: string;
    productId?: string; // O campo é opcional
    serviceId?: string; // O campo é opcional
    isGift: boolean;
    saleId: string;
    quantity: number;
    vehicleId?: string; // O campo é opcional
    vehicle?: Vehicle; // Assumindo que o tipo Vehicle será ajustado para incluir esta relação
    sale: Sale; // Assumindo que você já tem um tipo Sale definido
};

type SalePaymentMethod = {
    // Defina a estrutura de SalePaymentMethod conforme necessário
};


type Vehicle = {
    id: string;
    model: string;
    licensePlate: string;
    customerId?: string; // O campo é opcional
    customer?: Customer; // Assumindo que você já tem um tipo Customer definido
    itemSales: ItemSale[]; // Relação de um para muitos com ItemSale
};

type Customer = {
    id: string;
    name: string | null;
    birthday: Date | null;
    nickname: string | null;
    gender: string | null;
    document: string;
    phone: string | null;
    Sales: Sale[]; // Note que este é um relacionamento de um para muitos
    Vehicles: Vehicle[];
};

type Sale = {
    id: string;
    grossPrice: number;
    netPrice: number;
    discount: number | null;
    createAt: Date;
    isDeferredPayment: boolean | null;
    pickupTime: string | null;
    deferredPayments: DeferredPayment[];
    note: string | null;
    items: ItemSale[];
    salePayments: SalePaymentMethod[];
    customerId: string | null;
    customer: Customer | null; // Este campo reflete o relacionamento opcional com Customer
};


const SalesListPage = () => {
    const router = useRouter();
    const [sales, setSales] = useState<Sale[] | undefined>();
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const intervalId = setInterval(() => {
            startTransition(() => {
                getSales().then((data) => {
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
                        }).sort((a, b) => {
                            // Comparando as strings de pickupTime diretamente
                            return a.pickupTime.localeCompare(b.pickupTime);
                        });
                        setSales(formattedSales);
                    }
                });
            });
            console.log(123)
        }, 3000); // Chama a função a cada 3 segundos

        // Limpeza: é chamada quando o componente é desmontado
        return () => clearInterval(intervalId);
    }, []); // Array de dependências vazio significa que o useEffect rodará apenas uma vez após o componente montar


    return (
        <>
            {sales && (
                <>
                    {sales.length > 0 && (
                        <ScrollArea className="h-[400px] w-full pr-4">
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
                                                <Button>
                                                    <FaEye />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    )}
                    {sales.length === 0 && (
                        <>
                            Não tem Sale my nigga
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
        </>
    )
}

export default SalesListPage;