"use client"
import { createEmployees, getEmployees } from "@/actions/employees";
import { createPaymentMethods, getPayments } from "@/actions/payments";
import { getProducts } from "@/actions/products";
import { cancelSale, finalizeSale, getPendingSales } from "@/actions/sales";
import { getServices } from "@/actions/services";
import { createStatusSales } from "@/actions/status-sale";
import LoadingAnimation from "@/components/custom/LoadingAnimation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { SalesSchema } from "@/schemas";
import { formatPriceBRL } from "@/utils/mask";
import { zodResolver } from "@hookform/resolvers/zod";
import { Employee, PaymentMethod, Product, Service } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { BsPlus } from "react-icons/bs";
import { FaCheckCircle, FaEye } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { toast } from "sonner";
import * as z from "zod";
import PaymentInfoSale from "./list/_components/paymentinfosale";
import ServiceSale from "./list/_components/servicesale";
import TotalPriceSale from "./list/_components/totalpricesale";
import VehicleSale from "./list/_components/vehiclesale";

interface Time {
    value: string;
    id: number;
}

const SalesPage = () => {
    const router = useRouter();
    const [sales, setSales] = useState<Sale[] | undefined>();
    const [employees, setEmployees] = useState<Employee[] | undefined>();
    const [isPending, startTransition] = useTransition();
    const [currentStep, setCurrentStep] = useState(0);
    const [slideDirection, setSlideDirection] = useState("left-to-right");

    const [services, setServices] = useState<Service[] | undefined>();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[] | undefined>();
    const [products, setProducts] = useState<Product[] | undefined>();
    const [totalPrice, setTotalPrice] = useState<number | undefined>();
    const [saleId, setSaleId] = useState<string>('');
    const [customerDocument, setCustomerDocument] = useState<string>('');
    const [customerName, setCustomerName] = useState<string>('');
    const [model, setModel] = useState<string>('');
    const [plate, setPlate] = useState<string>('');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [times, setTimes] = useState<Time[]>([]);
    const [selectedTime, setSelectedTime] = useState<string>();
    const [isPaymentLater, setIsPaymentLater] = useState<boolean>(true);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>();
    const [celPhone, setCelPhone] = useState<string>();
    const [note, setNote] = useState<string>();

    const form = useForm<z.infer<typeof SalesSchema>>({
        resolver: zodResolver(SalesSchema),
        defaultValues: {
            name: '',
            isDeferredPayment: true,
            licensePlate: '',
            model: '',
            note: '',
            paymentMethod: undefined,
            phone: '',
            services: [],
            time: ''
        }
    });

    const onSubmit = (values: z.infer<typeof SalesSchema>) => {
        console.log('values', values)
        startTransition(() => {
            // createSale(values).then((data) => {

            // }).catch(() => toast.error("Algo deu errado"))
        })
    }

    useEffect(() => {
        getAllServices();
        getAllProducts();
        getAllEmployees();
        populateTimes();
        getAllPaymentMethods();
        getAllPendingSales();
    }, [])

    const populateTimes = () => {
        const currentTime = new Date();
        const currentHours = currentTime.getHours();
        const currentMinutes = currentTime.getMinutes();

        const startHour = 7;
        const endHour = 21;
        let newTimes = [];
        let key = 0; // Inicializa um contador de chave

        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minutes = 0; minutes < 60; minutes += 30) {
                if (hour > currentHours || (hour === currentHours && minutes >= currentMinutes)) {
                    const timeString = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                    newTimes.push({ id: key++, value: timeString }); // Cria um objeto com chave e valor e adiciona ao array
                }
            }
        }

        setTimes(newTimes); // Atualiza o estado com o novo array de objetos
    };



    const getAllPendingSales = () => {
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
    }

    const getAllPaymentMethods = () => {
        getPayments().then((data) => {
            if (data?.error) {
                toast.error(data.error)
            }
            if (data?.success) {
                setPaymentMethods(data.paymentMethods)
            }
        })
    }

    const getAllEmployees = () => {
        getEmployees().then((data) => {
            if (data?.error) {
                toast.error(data?.error)
            }
            if (data?.success) {
                setEmployees(data.employees)
            }
        })
    }

    const getAllServices = () => {
        getServices().then((data) => {
            if (data?.error) {
                toast.error(data.error)
            }
            if (data?.success) {
                setServices(data.services)
            }
        });
    }

    const getAllProducts = () => {
        getProducts().then((data) => {
            if (data?.error) {
                toast.error(data.error)
            }
            if (data?.success) {
                setProducts(data.services)
            }
        });
    }

    const handleCreateEmployeesPaymentMethodAndStatusMock = () => {
        startTransition(() => {
            createEmployees().then((data) => {
                if (data?.success) {
                    toast.success(data.success)
                }
            });

            createPaymentMethods().then((data) => {
                if (data?.success) {
                    toast.success(data.success)
                } else {
                    toast.error('Erro ao criar formas de pagamento')
                }
            });

            createStatusSales().then((data) => {
                if (data?.success) {
                    toast.success(data.success)
                } else {
                    toast.error('Erro ao criar status da OS')
                }
            })
        })
    }

    const handleServiceClick = (serviceId: string, serviceSalePrice: number) => {
        if (selectedServices.includes(serviceId)) {
            setSelectedServices(selectedServices.filter(id => id !== serviceId));
            form.setValue('services', form.getValues('services').filter((id) => id !== serviceId))
            setTotalPrice((totalPrice || 0) - serviceSalePrice);
        } else {
            setSelectedServices([...selectedServices, serviceId]);
            form.setValue('services', [...form.getValues('services'), serviceId])
            setTotalPrice((totalPrice || 0) + serviceSalePrice);
        }
    };

    const handleSetTime = (time: Time) => {
        setSelectedTime(time.value);
        form.setValue('time', time.value);
    }

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


    const handleDialogClose = ()=>{
        form.reset();
        setSelectedTime('');
        setSelectedServices([]);
    }

    return (
        <div className="min-h-screen w-full md:px-10 px-5 flex flex-col items-center justify-center">
            <>

                {sales && (
                    <>
                        {sales.length > 0 && (
                            <ScrollArea className="h-[400px] w-full">
                                <Table className="bg-black text-white w-full">
                                    <TableHeader>
                                        <TableRow className="text-white">
                                            <TableHead className="text-center">Horário</TableHead>
                                            <TableHead className="text-center">Cliente</TableHead>
                                            <TableHead className="text-center">Placa</TableHead>
                                            <TableHead className="text-center">Ações</TableHead>
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
                {employees && (
                    <>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    <BsPlus />
                                    Novo Atendimento
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="flex flex-col">
                                <ScrollArea className="h-[500px] space-y-3">
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)}>
                                            <FormField
                                                control={form.control}
                                                name="services"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Serviços
                                                        </FormLabel>
                                                        <FormControl>
                                                            <ScrollArea className="h-[200px] my-3">
                                                                <div className="grid md:grid-cols-4 grid-cols-2 gap-3">
                                                                    {
                                                                        services?.map((service) => (
                                                                            <Button
                                                                                type="button"
                                                                                onClick={() => handleServiceClick(service.id, service.salePrice)}
                                                                                disabled={isPending}
                                                                                size="lg"
                                                                                key={service.id}
                                                                                variant={selectedServices.includes(service.id) ? 'selected' : 'default'}
                                                                                className={`${slideDirection === "left-to-right" ? "slide-left" : "slide-right"}
                                                                                flex-col
                                                                                `}>
                                                                                <Label className="font-semibold">{service.name}</Label>
                                                                                <span className="text-sm">{formatPriceBRL(service.salePrice)}</span>
                                                                                <Input {...field} className="hidden" />
                                                                            </Button>
                                                                        ))
                                                                    }
                                                                </div>
                                                            </ScrollArea>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="time"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Horário
                                                        </FormLabel>
                                                        <FormControl>
                                                            <ScrollArea className="h-[200px] my-3">
                                                                <div className="grid grid-cols-4 gap-3">
                                                                    {
                                                                        times?.map((time) => (
                                                                            <Button
                                                                                type="button"
                                                                                onClick={() => handleSetTime(time)}
                                                                                key={time.id}
                                                                                disabled={isPending}
                                                                                variant={selectedTime === time.value ? 'selected' : 'default'}
                                                                                className={`${slideDirection === "left-to-right" ? "slide-left" : "slide-right"}
                                                                                `}>
                                                                                {time.value}
                                                                                <Input {...field} className="hidden" />
                                                                            </Button>
                                                                        ))
                                                                    }
                                                                </div>
                                                            </ScrollArea>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Cliente
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Nome do Cliente"
                                                                disabled={isPending}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            WhatsApp
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="WhatsApp do Cliente"
                                                                disabled={isPending}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="note"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Observações
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                {...field}
                                                                placeholder="Observações"
                                                                disabled={isPending}
                                                            ></Textarea>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="isDeferredPayment"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel>
                                                                Pagar depois?
                                                            </FormLabel>
                                                            <FormDescription>
                                                                Pergunte ao cliente se ele prefere pagar depois
                                                            </FormDescription>
                                                        </div>
                                                        <FormControl>
                                                            <Checkbox
                                                                className="h-7 w-7"
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            {paymentMethods && paymentMethods?.length > 0 && !form.getValues('isDeferredPayment') && (
                                                <FormField
                                                    control={form.control}
                                                    name="paymentMethod"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Forma de Pagamento</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue placeholder="Selecione uma forma de pagamento" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {
                                                                        paymentMethods.map((paymentMethod) => (
                                                                            <SelectItem
                                                                                key={paymentMethod.id}
                                                                                value={paymentMethod.id}>
                                                                                {paymentMethod.description}
                                                                            </SelectItem>
                                                                        ))
                                                                    }
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                            <FormField
                                                control={form.control}
                                                name="licensePlate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Placa
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Placa do Veículo"
                                                                disabled={isPending}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="model"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Modelo
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Model do Veículo"
                                                                disabled={isPending}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <DialogFooter className="my-5 flex-row items-center justify-around">
                                                <DialogClose asChild>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="rounded-full px-3 py-6"
                                                        onClick={handleDialogClose}
                                                    >
                                                        <MdOutlineCancel className="w-7 h-7" />
                                                    </Button>
                                                </DialogClose>
                                                <Button
                                                    type="submit"
                                                    className="rounded-full px-3 py-6"
                                                >
                                                    <FaCheckCircle className="w-7 h-7" />
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>

                                </ScrollArea>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
                {
                    !employees && (
                        <LoadingAnimation />
                    )
                }
                {
                    (!employees || employees?.length === 0) && (
                        <>
                            <Button disabled={isPending} onClick={handleCreateEmployeesPaymentMethodAndStatusMock}>Colaboradores, Formas de pagamento e Status</Button>
                        </>
                    )
                }

            </>
        </div>
    )
}

export default SalesPage;
