"use client"
import { createEmployees, getEmployees } from "@/actions/employees";
import { createPaymentMethods, getPayments } from "@/actions/payments";
import { getProducts } from "@/actions/products";
import { cancelSale, createSale, finalizeSale, getPendingSales, saveContact, saveCustomer, savePaymentMethod, saveServices, saveTime } from "@/actions/sales";
import { getServices } from "@/actions/services";
import { createStatusSales } from "@/actions/status-sale";
import LoadingAnimation from "@/components/custom/LoadingAnimation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatPriceBRL } from "@/utils/mask";
import { Employee, PaymentMethod, Product, Service } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { BsPlus } from "react-icons/bs";
import { FaCheckCircle, FaEye } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { toast } from "sonner";
import PaymentInfoSale from "./list/_components/paymentinfosale";
import ServiceSale from "./list/_components/servicesale";
import TotalPriceSale from "./list/_components/totalpricesale";
import VehicleSale from "./list/_components/vehiclesale";

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
    const [times, setTimes] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string>();
    const [isPaymentLater, setIsPaymentLater] = useState<boolean>(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>();
    const [celPhone, setCelPhone] = useState<string>();
    const [note, setNote] = useState<string>();

    useEffect(() => {
        getAllServices();
        getAllProducts();
        getAllEmployees();
        populateTimes();
        getAllPaymentMethods();
        getAllPendingSales();
    }, [])

    useEffect(() => {
        if (currentStep === 7) {
            setTimeout(() => {
                setCurrentStep(0);
                setSlideDirection("right-to-left");
                resetForm();
            }, 3000)
        }
    }, [currentStep])

    const resetForm = () => {
        setTotalPrice(undefined);
        setSaleId('');
        setCustomerDocument('');
        setCustomerName('');
        setModel('');
        setPlate('');
        setSelectedServices([]);
        setSelectedTime(undefined);
        setIsPaymentLater(false);
        setSelectedPaymentMethod(undefined);
        setCelPhone(undefined);
        setNote(undefined);
    };

    const populateTimes = () => {
        const currentTime = new Date();
        const currentHours = currentTime.getHours();
        const currentMinutes = currentTime.getMinutes();

        const startHour = 7;
        const endHour = 21;
        let newTimes = [];

        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minutes = 0; minutes < 60; minutes += 30) {
                if (hour > currentHours || (hour === currentHours && minutes >= currentMinutes)) {
                    const timeString = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                    newTimes.push(timeString);
                }
            }
        }

        setTimes(newTimes);
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

    const handleStartSale = (employeeId: string) => {
        startTransition(() => {
            createSale(employeeId).then((data) => {
                if (data.error) {
                    toast.error(data.error)
                }
                if (data.success) {
                    nextStep();
                    setSaleId(data.saleId)
                }
            }).catch(() => toast.error("Algo deu errado"))
        })
    }

    const nextStep = () => {
        setCurrentStep(currentStep + 1);
        setSlideDirection("left-to-right");
    }

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
        setSlideDirection("right-to-left");
    }

    const handleSaveCustomer = () => {
        if (!saleId || !customerDocument || !customerName) {
            return
        }

        startTransition(() => {
            saveCustomer(saleId, customerDocument, customerName).then((data) => {
                if (data?.error) {
                    toast.error(data.error);
                }

                if (data?.success) {
                    nextStep();
                }
            })
        })
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
            setTotalPrice((totalPrice || 0) - serviceSalePrice);
        } else {
            setSelectedServices([...selectedServices, serviceId]);
            setTotalPrice((totalPrice || 0) + serviceSalePrice);
        }
    };

    const handleSaveServices = () => {
        startTransition(() => {
            saveServices(saleId, selectedServices, model, plate).then((data) => {
                if (data?.error) {
                    toast.error(data.error)
                }
                if (data?.success) {
                    nextStep();
                    const sumOfPrices = data.prices.reduce((acc, currentValue) => acc + currentValue.salePrice, 0);
                    setTotalPrice(sumOfPrices)
                }
            })
        })
    }

    const handleSaveTime = () => {
        if (!selectedTime) {
            return
        }
        startTransition(() => {
            saveTime(saleId, selectedTime).then((data) => {
                if (data?.error) {
                    toast.error(data.error)
                }

                if (data?.success) {
                    nextStep();
                }
            })
        })
    }

    const handleSavePaymentMethod = () => {
        if (!isPaymentLater && !selectedPaymentMethod && !totalPrice) {
            return
        }

        startTransition(() => {
            savePaymentMethod(saleId, selectedPaymentMethod || '', totalPrice || 0)
                .then((data) => {
                    if (data?.error) {
                        toast.error(data.error);
                    }

                    if (data?.success) {
                        setCurrentStep(currentStep + 1);
                        setSlideDirection("left-to-right");
                    }
                })
        })
    }

    const handleSaveContact = () => {
        if (!celPhone) {
            return
        }
        startTransition(() => {
            saveContact(saleId, celPhone, note).then((data) => {
                if (data?.error) {
                    toast.error(data.error)
                }
                if (data?.success) {
                    nextStep();
                    //TODO: enviar resumo do pedido para o whats do cliente
                }
            })
        })
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
                            <DialogContent className="flex">
                                <ScrollArea className="h-[400px] space-y-3">
                                    <div className="w-full flex flex-col gap-x-4">
                                        <Label className="text-lg">Serviços</Label>
                                        <ScrollArea className="h-[200px] my-3">
                                            <div className="grid md:grid-cols-4 grid-cols-2 gap-3">
                                                {
                                                    services?.map((service) => (
                                                        <Button
                                                            onClick={() => handleServiceClick(service.id, service.salePrice)}
                                                            key={service.id}
                                                            disabled={isPending}
                                                            size="lg"
                                                            variant={selectedServices.includes(service.id) ? 'selected' : 'default'}
                                                            className={`${slideDirection === "left-to-right" ? "slide-left" : "slide-right"}
                                                            flex-col
                                                            `}>
                                                            <Label className="font-semibold">{service.name}</Label>
                                                            <span className="text-sm">{formatPriceBRL(service.salePrice)}</span>
                                                        </Button>
                                                    ))
                                                }
                                            </div>
                                        </ScrollArea>
                                    </div>
                                    <div className="w-full flex flex-col">
                                        <Label className="text-lg">Horário</Label>
                                        <ScrollArea className="max-h-[200px] my-3">
                                            <div className="grid grid-cols-4 gap-4">
                                                {
                                                    times?.map((time) => (
                                                        <>
                                                            <Button
                                                                onClick={() => setSelectedTime(time)}
                                                                key={time}
                                                                disabled={isPending}
                                                                variant={selectedTime === time ? 'selected' : 'default'}
                                                                className={`${slideDirection === "left-to-right" ? "slide-left" : "slide-right"}
                                                            `}>
                                                                {time}
                                                            </Button>
                                                        </>
                                                    ))
                                                }
                                            </div>
                                        </ScrollArea>
                                    </div>
                                    <div className="w-full flex flex-col">
                                        <Label className="text-lg">Contato</Label>
                                        <div className="space-y-2">
                                            <Label>Nome</Label>
                                            <Input
                                                placeholder="Digite aqui o Nome do cliente"
                                                onChange={(event) => setCustomerName(event.target.value)}
                                                disabled={isPending}
                                                value={customerName} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>WhatsApp</Label>
                                            <Input
                                                placeholder="Digite aqui o WhatsApp do cliente"
                                                onChange={(event) => setCelPhone(event.target.value)}
                                                disabled={isPending}
                                                value={celPhone} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Observações</Label>
                                            <Textarea
                                                placeholder="Digite aqui alguma observação (opcional)"
                                                onChange={(event) => setNote(event.target.value)}
                                                disabled={isPending}
                                                value={note}></Textarea>
                                        </div>
                                    </div>
                                    <div className="w-full flex flex-col my-3">
                                        <Label className="text-lg space-y-3">Veículo</Label>
                                        <div className="space-y-2">
                                            <Label>Placa</Label>
                                            <Input
                                                placeholder="Digite aqui a Placa do veículo"
                                                onChange={(event) => setPlate(event.target.value)}
                                                disabled={isPending}
                                                value={plate} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Modelo</Label>
                                            <Input
                                                placeholder="Digite aqui o Modelo do veículo"
                                                onChange={(event) => setModel(event.target.value)}
                                                disabled={isPending}
                                                value={model} />
                                        </div>
                                    </div>
                                    <DialogFooter className="my-5 flex-row items-center justify-around">
                                        <Button
                                            variant="outline"
                                            className="rounded-full px-3 py-6"
                                        >
                                            <MdOutlineCancel className="w-7 h-7" />
                                        </Button>
                                        <Button
                                            className="rounded-full px-3 py-6"
                                        >
                                            <FaCheckCircle className="w-7 h-7" />
                                        </Button>
                                    </DialogFooter>
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
