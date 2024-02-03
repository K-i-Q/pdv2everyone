"use client"
import { getEmployees } from "@/actions/employees";
import { getPayments } from "@/actions/payments";
import { getProducts } from "@/actions/products";
import { createEmployees, createSale, saveContact, saveCustomer, savePaymentMethod, saveServices, saveTime } from "@/actions/sales";
import { getServices } from "@/actions/services";
import LoadingAnimation from "@/components/custom/LoadingAnimation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatPriceBRL } from "@/utils/mask";
import { Employee, PaymentMethod, Product, Service } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { FaCheckCircle, FaList } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";
import { GrLinkNext, GrLinkPrevious } from "react-icons/gr";
import { toast } from "sonner";

const SalesPage = () => {
    const router = useRouter();
    const colors = ['#b89d04', '#d40423', '#0250cf']; // Exemplo de cores
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

        const startHour = 7; // 07:00 AM
        const endHour = 21; // 21:00 PM
        let newTimes = [];

        for (let hour = startHour; hour <= endHour; hour++) {
            // Criando horários a cada 30 minutos
            for (let minutes = 0; minutes < 60; minutes += 30) {
                // Se o horário ainda não passou
                if (hour > currentHours || (hour === currentHours && minutes >= currentMinutes)) {
                    const timeString = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                    newTimes.push(timeString);
                }
            }
        }

        setTimes(newTimes);
    };

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
                console.log('erro: ', data?.error)
            }
            if (data?.success) {
                console.log('success: ', data?.success)
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

    const handleCreateEmployees = () => {
        startTransition(() => {
            createEmployees().then((data) => {
                if (data?.success) {
                    toast.success(data.success)
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

    return (
        <div className="md:px-10 px-5 flex flex-col items-center justify-center">
            <>
                {employees && (
                    <>
                        {currentStep === 0 && (// etapa escolher ativar ou listar
                            <div className={`space-y-5 ${slideDirection === "left-to-right" ? "slide-left" : "slide-right"}`}>
                                <Button
                                    className="w-full items-center py-8 font-semibold uppercase border-zinc-50 border-2 justify-between"
                                    onClick={nextStep}
                                    disabled={isPending}
                                >
                                    Novo Atendimento
                                    <FaCirclePlus className="w-6 h-6" />
                                </Button>
                                <Button
                                    className="w-full items-center py-8 font-semibold uppercase border-zinc-50 border-2 justify-between"
                                    onClick={() => router.push('/sales/list')}
                                    disabled={isPending}
                                >
                                    Consultar Atendimentos
                                    <FaList className="w-6 h-6" />
                                </Button>
                            </div>
                        )}
                        {currentStep === 1 && (// tabela com 2 colunas, info de nome e função de click
                            <div className={`grid grid-cols-2 gap-5 ${slideDirection === "left-to-right" ? "slide-left" : "slide-right"}`}>
                                {
                                    employees.length > 0 && (
                                        employees.map((employee, index) => (
                                            <Button
                                                key={employee.id}
                                                className="bg-yellow-400 p-10 border-zinc-50 border-2"
                                                onClick={() => handleStartSale(employee.id)}
                                                disabled={isPending}
                                            >
                                                {employee.name}
                                            </Button>
                                        ))
                                    )
                                }
                                <Button
                                    variant="outline"
                                    className="w-full col-span-2 gap-x-3"
                                    disabled={isPending}
                                    onClick={prevStep}>
                                    <GrLinkPrevious />
                                    Voltar
                                </Button>
                            </div>
                        )}
                        {currentStep === 2 && (//1 label e input com event change e 2 botões
                            <Card className={`${slideDirection === "left-to-right" ? "slide-left" : "slide-right"} pt-4`}>
                                <CardContent>
                                    <Label>CPF</Label>
                                    <Input
                                        placeholder="Digite aqui o CPF do cliente"
                                        onChange={(event) => setCustomerDocument(event.target.value)}
                                        disabled={isPending}
                                        value={customerDocument} />
                                    <Label>Nome</Label>
                                    <Input
                                        placeholder="Digite aqui o Nome do cliente"
                                        onChange={(event) => setCustomerName(event.target.value)}
                                        disabled={isPending}
                                        value={customerName} />
                                </CardContent>
                                <CardFooter className="flex-row-reverse gap-x-5">
                                    <Button
                                        className="gap-x-3"
                                        disabled={isPending || !customerName || !customerDocument}
                                        onClick={handleSaveCustomer}
                                    >
                                        Próximo
                                        <GrLinkNext />
                                    </Button>
                                    <Button
                                        className="w-full gap-x-3"
                                        variant="outline"
                                        disabled={isPending}
                                        onClick={prevStep}>
                                        <GrLinkPrevious />
                                        Voltar
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}
                        {currentStep === 3 && (//2 input; 1 grid col 4; 2 botões
                            <div className="flex flex-col gap-x-4 gap-y-3 md:w-2/4">
                                <>
                                    <div className="col-span-4">
                                        <Card className={`pt-4 ${slideDirection === "left-to-right" ? "slide-left" : "slide-right"}`}>
                                            <CardContent className="space-y-3">
                                                <div className="space-y-2">
                                                    <Label>Placa</Label>
                                                    <Input
                                                        placeholder="Digite aqui a placa do veículo"
                                                        onChange={(event) => setPlate(event.target.value)}
                                                        disabled={isPending}
                                                        value={plate} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Modelo</Label>
                                                    <Input
                                                        placeholder="Digite aqui o modelo do veículo"
                                                        onChange={(event) => setModel(event.target.value)}
                                                        disabled={isPending}
                                                        value={model} />
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <CardDescription>
                                                    Total: {formatPriceBRL(totalPrice || 0)}
                                                </CardDescription>
                                            </CardFooter>
                                        </Card>
                                    </div>
                                    <div className="grid md:grid-cols-4 grid-cols-2 gap-3">
                                        {
                                            services?.map((service) => (
                                                <Button
                                                    onClick={() => handleServiceClick(service.id, service.salePrice)}
                                                    key={service.id}
                                                    disabled={isPending}
                                                    className={`${selectedServices.includes(service.id) ? 'bg-yellow-300/90' : ''} 
                                                        ${slideDirection === "left-to-right" ? "slide-left" : "slide-right"}
                                                        flex-col
                                                        py-6
                                                        border-2
                                                        border-zinc-50
                                                        `}>
                                                    <Label className="font-semibold">{service.name}</Label>
                                                    <span className="text-sm">{formatPriceBRL(service.salePrice)}</span>
                                                </Button>
                                            ))
                                        }
                                    </div>
                                    <div className="flex flex-row items-center justify-between gap-x-3">
                                        <Button
                                            className="gap-x-3 w-full  justify-between"
                                            variant="outline"
                                            disabled={isPending}
                                            onClick={prevStep}>
                                            <GrLinkPrevious />
                                            Voltar
                                        </Button>
                                        <Button
                                            className="gap-x-3 w-full  justify-between"
                                            disabled={isPending || !model || !plate || selectedServices?.length < 1}
                                            onClick={handleSaveServices}
                                        >
                                            Próximo
                                            <GrLinkNext />
                                        </Button>
                                    </div>
                                </>
                            </div>

                        )}
                        {currentStep === 4 && (//1 grid col 4;2 botões
                            <div className="space-y-3">
                                <div className="grid grid-cols-4 gap-4">
                                    {
                                        times?.map((time) => (
                                            <Button
                                                onClick={() => setSelectedTime(time)}
                                                key={time}
                                                disabled={isPending}
                                                className={`${selectedTime === time ? 'bg-yellow-300/90' : ''} 
                                                    ${slideDirection === "left-to-right" ? "slide-left" : "slide-right"}
                                                    py-6
                                                    border-2
                                                    border-zinc-50
                                                    `}>
                                                {time}
                                            </Button>
                                        ))
                                    }
                                </div>

                                <div className="flex gap-3 w-full justify-between">
                                    <Button
                                        className="gap-x-3 w-full  justify-between"
                                        variant="outline"
                                        disabled={isPending}
                                        onClick={prevStep}>
                                        <GrLinkPrevious />
                                        Voltar
                                    </Button>
                                    <Button
                                        className="gap-x-3 w-full  justify-between"
                                        disabled={isPending || !selectedTime}
                                        onClick={handleSaveTime}
                                    >
                                        Próximo
                                        <GrLinkNext />
                                    </Button>
                                </div>

                            </div>

                        )}
                        {currentStep === 5 && (//1 checkbox; 1 select; 2 botões
                            <div className="flex items-center justify-center">
                                <Card>
                                    <CardHeader>
                                        <div className="space-x-2">
                                            <Checkbox
                                                className="border-gray-50"
                                                id="isPaymentLater"
                                                checked={isPaymentLater}
                                                disabled={isPending}
                                                onCheckedChange={() => setIsPaymentLater(!isPaymentLater)} />
                                            <Label
                                                htmlFor="isPaymentLater"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Pagar depois?
                                            </Label>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {paymentMethods && paymentMethods?.length > 0 && !isPaymentLater && (
                                            <>
                                                <Select
                                                    onValueChange={(value) => setSelectedPaymentMethod(value)}
                                                    disabled={isPending}
                                                    defaultValue={selectedPaymentMethod}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Selecione uma forma de pagamento" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>Forma de Pagamento</SelectLabel>
                                                            {
                                                                paymentMethods.map((paymentMethod) => (
                                                                    <SelectItem
                                                                        key={paymentMethod.id}
                                                                        value={paymentMethod.id}>
                                                                        {paymentMethod.description}
                                                                    </SelectItem>
                                                                ))
                                                            }
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                <div>
                                                    <Label>Total: {formatPriceBRL(totalPrice || 0)}</Label>
                                                </div>
                                            </>
                                        )

                                        }
                                        <div className="flex gap-3 w-full justify-between">
                                            <Button
                                                className="gap-x-3 w-full  justify-between"
                                                variant="outline"
                                                disabled={isPending}
                                                onClick={prevStep}>
                                                <GrLinkPrevious />
                                                Voltar
                                            </Button>
                                            <Button
                                                className="gap-x-3 w-full  justify-between"
                                                disabled={(isPending) || (!isPaymentLater && !selectedPaymentMethod)}
                                                onClick={handleSavePaymentMethod}
                                            >
                                                Próximo
                                                <GrLinkNext />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                        )}
                        {currentStep === 6 && (//1 input; 1 textarea; 2 botões
                            <>
                                <Card className={`w-full ${slideDirection === "left-to-right" ? "slide-left" : "slide-right"}`}>
                                    <CardHeader>
                                        <Label>Contato</Label>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
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
                                    </CardContent>
                                    <CardFooter className="flex gap-3 w-full justify-between">
                                        <Button
                                            className="gap-x-3 w-full justify-between"
                                            variant="outline"
                                            disabled={isPending}
                                            onClick={prevStep}>
                                            <GrLinkPrevious />
                                            Voltar
                                        </Button>
                                        <Button
                                            className="gap-x-3 w-full justify-between"
                                            disabled={isPending || !celPhone}
                                            onClick={handleSaveContact}
                                        >
                                            Próximo
                                            <GrLinkNext />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </>
                        )}
                        {currentStep === 7 && (
                            <div className="flex items-center justify-center">
                                <Card className="md:w-2/4">
                                    <CardHeader className="items-center justify-center">
                                        Ordem de serviço criada com sucesso
                                    </CardHeader>
                                    <CardFooter className="items-center justify-center">
                                        <FaCheckCircle className="w-10 h-10 text-yellow-400" />
                                    </CardFooter>
                                </Card>
                            </div>
                        )}
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
                            <Button disabled={isPending} onClick={handleCreateEmployees}>Criar funcionarios</Button>
                        </>
                    )
                }

            </>
        </div>
    )
}

export default SalesPage;
