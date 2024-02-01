"use client"
import { getEmployees } from "@/actions/employees";
import { getPayments } from "@/actions/payments";
import { getProducts } from "@/actions/products";
import { createEmployees, createSale, saveCustomer, saveServices, saveTime } from "@/actions/sales";
import { getServices } from "@/actions/services";
import LoadingAnimation from "@/components/custom/LoadingAnimation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPriceBRL } from "@/utils/mask";
import { Employee, PaymentMethod, Product, Service } from "@prisma/client";
import { useEffect, useState, useTransition } from "react";
import { GrLinkNext } from "react-icons/gr";
import { toast } from "sonner";

const SalesPage = () => {
    const [employees, setEmployees] = useState<Employee[] | undefined>();
    const [services, setServices] = useState<Service[] | undefined>();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[] | undefined>();
    const [products, setProducts] = useState<Product[] | undefined>();
    const [totalPrice, setTotalPrice] = useState<Number | undefined>();
    const [saleId, setSaleId] = useState<string>('');
    const [customerDocument, setCustomerDocument] = useState<string>('');
    const [model, setModel] = useState<string>('');
    const [plate, setPlate] = useState<string>('');
    const [isPending, startTransition] = useTransition();
    const colors = ['#b89d04', '#d40423', '#0250cf']; // Exemplo de cores
    const [currentStep, setCurrentStep] = useState(4);
    const [slideDirection, setSlideDirection] = useState("left-to-right");
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [times, setTimes] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string>();
    const [isPaymentLater, setIsPaymentLater] = useState<boolean>(false);

    useEffect(() => {
        getAllServices();
        getAllProducts();
        getAllEmployees();
        populateTimes();
        getAllPaymentMethods();
    }, [])

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
                    setCurrentStep(currentStep + 1);
                    setSlideDirection("left-to-right");
                    setSaleId(data.saleId)
                }
            }).catch(() => toast.error("Algo deu errado"))
        })
    }

    const handleSaveCustomer = (saleId: string, customerDocument: string) => {
        if (!saleId || !customerDocument) {
            return
        }

        startTransition(() => {
            saveCustomer(saleId, customerDocument).then((data) => {
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

    const handleCreateEmployees = () => {
        startTransition(() => {
            createEmployees().then((data) => {
                if (data?.success) {
                    toast.success(data.success)
                }
            })
        })
    }

    const handleInputCustomerChange = (event: any) => {
        setCustomerDocument(event.target.value);
    };

    const handleInputModelChange = (event: any) => {
        setModel(event.target.value);
    };

    const handleInputPlateChange = (event: any) => {
        setPlate(event.target.value);
    };

    const handleServiceClick = (serviceId: string) => {
        if (selectedServices.includes(serviceId)) {
            setSelectedServices(selectedServices.filter(id => id !== serviceId));
        } else {
            setSelectedServices([...selectedServices, serviceId]);
        }
    };

    const handleSaveServices = (saleId: string) => {
        startTransition(() => {
            saveServices(saleId, selectedServices, model, plate).then((data) => {
                if (data?.error) {
                    toast.error(data.error)
                }
                if (data?.success) {
                    setCurrentStep(currentStep + 1);
                    setSlideDirection("left-to-right");
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
                    setCurrentStep(currentStep + 1);
                    setSlideDirection("left-to-right");
                }
            })
        })
    }

    return (
        <div className="w-3/4 md:px-10">
            <>
                {employees && (
                    <>
                        {currentStep === 0 && (
                            <div className={`grid grid-cols-3 gap-5 ${slideDirection === "left-to-right" ? "slide-left" : "slide-right"}`}>
                                {
                                    employees.length > 0 && (
                                        employees.map((employee, index) => (
                                            <Card
                                                key={employee.id}
                                                className={`cursor-pointer hover:bg-black/85`}
                                                style={{ backgroundColor: colors[index % colors.length] }}
                                                onClick={() => handleStartSale(employee.id)}
                                            >
                                                <CardHeader>
                                                    {employee.name}
                                                </CardHeader>
                                            </Card>
                                        ))
                                    )
                                }
                            </div>
                        )}
                        {currentStep === 1 && (
                            <Card className={`${slideDirection === "left-to-right" ? "slide-left" : "slide-right"}`}>
                                <CardHeader>
                                    <Label>CPF</Label>
                                </CardHeader>
                                <CardContent>
                                    <Input placeholder="Digite aqui o CPF do cliente" onChange={handleInputCustomerChange} value={customerDocument} />
                                </CardContent>
                                <CardFooter className="flex-row-reverse">
                                    <Button
                                        className="gap-x-3"
                                        disabled={isPending}
                                        onClick={() => handleSaveCustomer(saleId, customerDocument)}
                                    >
                                        Próximo
                                        <GrLinkNext />
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}
                        {currentStep === 2 && (
                            <div className="grid grid-cols-4 gap-x-4">
                                <>
                                    <Card className={`${slideDirection === "left-to-right" ? "slide-left" : "slide-right"}`}>
                                        <CardHeader>
                                            Veículo
                                        </CardHeader>
                                        <CardContent>
                                            <Label>Modelo</Label>
                                            <Input placeholder="Digite aqui o modelo do veículo" onChange={handleInputModelChange} value={model} />
                                            <Label>Placa</Label>
                                            <Input placeholder="Digite aqui a placa do veículo" onChange={handleInputPlateChange} value={plate} />
                                        </CardContent>
                                    </Card>
                                    {
                                        services?.map((service) => (
                                            <Card
                                                onClick={() => handleServiceClick(service.id)}
                                                key={service.id}
                                                className={`hover:bg-slate-700 cursor-pointer ${selectedServices.includes(service.id) ? 'bg-slate-700' : ''} ${slideDirection === "left-to-right" ? "slide-left" : "slide-right"}`}>
                                                <CardHeader>
                                                    <Label>{service.name}</Label>
                                                </CardHeader>
                                                <CardContent>
                                                    {service.description}
                                                </CardContent>
                                                <CardFooter>
                                                    {formatPriceBRL(service.salePrice)}
                                                </CardFooter>
                                            </Card>
                                        ))
                                    }
                                    <Button
                                        className="gap-x-3"
                                        disabled={isPending || !model || !plate}
                                        onClick={() => handleSaveServices(saleId)}
                                    >
                                        Próximo
                                        <GrLinkNext />
                                    </Button>
                                </>
                            </div>

                        )}
                        {currentStep === 3 && (
                            <div className="grid grid-cols-4 gap-x-4">
                                <>
                                    {
                                        times?.map((time) => (
                                            <Card
                                                onClick={() => setSelectedTime(time)}
                                                key={time}
                                                className={`hover:bg-slate-700 cursor-pointer ${selectedTime === time ? 'bg-slate-700' : ''} ${slideDirection === "left-to-right" ? "slide-left" : "slide-right"}`}>
                                                <CardContent>
                                                    {time}
                                                </CardContent>
                                            </Card>
                                        ))
                                    }
                                    <Button
                                        className="gap-x-3"
                                        disabled={isPending || !selectedTime}
                                        onClick={handleSaveTime}
                                    >
                                        Próximo
                                        <GrLinkNext />
                                    </Button>
                                </>
                            </div>

                        )}
                        {currentStep === 4 && (
                            <div className="flex items-center justify-center">
                                <Card>
                                    <CardHeader>
                                        <div className="space-x-2">
                                            <Checkbox className="border-gray-50" id="isPaymentLater" checked={isPaymentLater} onCheckedChange={() => setIsPaymentLater(!isPaymentLater)} />
                                            <Label
                                                htmlFor="isPaymentLater"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Pagar depois?
                                            </Label>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {paymentMethods && paymentMethods?.length > 0 && !isPaymentLater && (
                                            <>
                                                <Select>
                                                    <SelectTrigger className="w-[180px]">
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
                                            </>
                                        )

                                        }

                                        <Button
                                            className="gap-x-3"
                                            disabled={isPending || !selectedTime}
                                            onClick={handleSaveTime}
                                        >
                                            Próximo
                                            <GrLinkNext />
                                        </Button>
                                    </CardContent>

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
