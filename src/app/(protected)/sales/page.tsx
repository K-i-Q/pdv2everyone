"use client"
import { getEmployees } from "@/actions/employees";
import { getProducts } from "@/actions/products";
import { createEmployees, createSale, saveCustomer } from "@/actions/sales";
import { getServices } from "@/actions/services";
import LoadingAnimation from "@/components/custom/LoadingAnimation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPriceBRL } from "@/utils/mask";
import { Employee, Product, Service } from "@prisma/client";
import { useEffect, useState, useTransition } from "react";
import { GrLinkNext } from "react-icons/gr";
import { toast } from "sonner";

const SalesPage = () => {
    const [employees, setEmployees] = useState<Employee[] | undefined>();
    const [services, setServices] = useState<Service[] | undefined>();
    const [products, setProducts] = useState<Product[] | undefined>();
    const [totalPrice, setTotalPrice] = useState<Number | undefined>();
    const [saleId, setSaleId] = useState<string>('');
    const [customerDocument, setCustomerDocument] = useState<string>('');
    const [isPending, startTransition] = useTransition();
    const colors = ['#b89d04', '#d40423', '#0250cf']; // Exemplo de cores
    const [currentStep, setCurrentStep] = useState(0);
    const [slideDirection, setSlideDirection] = useState("left-to-right");

    useEffect(() => {
        getAllServices();
        getAllProducts();
        getAllEmployees();
    }, [])

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
                    console.log('services', services)
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
                                    {
                                        services?.map((service) => (
                                            <Card key={service.id} className={`hover:bg-slate-700 cursor-pointer ${slideDirection === "left-to-right" ? "slide-left" : "slide-right"}`}>
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
                                </>
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
