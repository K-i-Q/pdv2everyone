"use client"
import { getEmployees } from "@/actions/employees";
import { getProducts } from "@/actions/products";
import { createSale } from "@/actions/sales";
import { getServices } from "@/actions/services";
import { Card, CardHeader } from "@/components/ui/card";
import { Employee, Product, Service } from "@prisma/client";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

const SalesPage = () => {
    const [employees, setEmployees] = useState<Employee[] | undefined>();
    const [services, setServices] = useState<Service[] | undefined>();
    const [products, setProducts] = useState<Product[] | undefined>();
    const [totalPrice, setTotalPrice] = useState<Number | undefined>();
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
                }
            }).catch(() => toast.error("Algo deu errado"))
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
                            <div className={`alguma-outro-div-com-conteúdo ${slideDirection === "left-to-right" ? "slide-left" : "slide-right"}`}>
                               DEUBOA
                            </div>
                        )}
                    </>
                )}
            </>
        </div>
    )
}

export default SalesPage;
