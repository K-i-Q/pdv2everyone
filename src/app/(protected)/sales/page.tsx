"use client"
import { getEmployees } from "@/actions/employees";
import { getProducts } from "@/actions/products";
import { createSale } from "@/actions/sales";
import { getServices } from "@/actions/services";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SalesSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Employee, Product, Service } from "@prisma/client";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const SalesPage = () => {
    const [employees, setEmployees] = useState<Employee[] | undefined>();
    const [services, setServices] = useState<Service[] | undefined>();
    const [products, setProducts] = useState<Product[] | undefined>();
    const [totalPrice, setTotalPrice] = useState<Number | undefined>();
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof SalesSchema>>({
        resolver: zodResolver(SalesSchema),
        defaultValues: {
            licensePlate: undefined,
            model: undefined,
            services: [],
            price: undefined,
            note: undefined,
            products: [],
            isDeferredPayment: false
        }
    });

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

    const onSubmit = (values: z.infer<typeof SalesSchema>) => {
        startTransition(() => {
            createSale(values).then((data) => {
                if (data.error) {
                    toast.error(data.error)
                }
                if (data.success) {
                    resetaFormulario();
                    toast.success(data.success);
                    getAllServices();
                }
            }).catch(() => toast.error("Algo deu errado"))
        })
    }

    const resetaFormulario = () => {
        const { reset } = form;

        reset({
            licensePlate: '',
            model: '',
            note: '',
            services: [],
            price: '0',
            products: [],
            isDeferredPayment: false
        });
        setTotalPrice(0)
    }


    return (
        <>
            <Card className="md:w-3/4">
                <CardHeader>
                    Venda
                </CardHeader>
                <CardContent>
                    <>
                        {employees && (
                            <ul>
                                {employees.length > 0 && (
                                    employees.map((employee) => (
                                        <li key={employee.id}>
                                            {employee.nickname}
                                        </li>
                                    ))
                                )}
                            </ul>
                        )}
                    </>

                </CardContent>
            </Card>
        </>
    )
}

export default SalesPage;
