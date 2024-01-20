"use client"
import { getProducts } from "@/actions/products";
import { createSale } from "@/actions/sales";
import { getServices } from "@/actions/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { SalesSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product, Service } from "@prisma/client";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const SalesPage = () => {
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
    }, [])

    const calculateTotalPrice = () => {
        const selectedServices = form.getValues('services') ?? [];
        const selectedProducts = form.getValues('products') ?? [];

        const selectedServicesPrices = selectedServices.map(serviceId => {
            const service = services?.find(service => service.id === serviceId);
            return service?.salePrice ?? 0;
        });

        const selectedProductsPrices = selectedProducts.map(productId => {
            const product = products?.find(product => product.id === productId);
            return product?.salePrice ?? 0;
        });

        const total = selectedServicesPrices.reduce((acc, price) => acc + Number(price), 0) +
            selectedProductsPrices.reduce((acc, price) => acc + Number(price), 0);

        setTotalPrice(total)
        form.setValue('price', total.toString())
    };
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
        <Card className="md:w-3/4">
            <CardHeader>
                Venda
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[500px] md:h-full w-full pr-4">
                    <Form {...form}>
                        <form className="space-y-3 mb-10" onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="space-y-2">
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
                                                    placeholder="ABC1B34"
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
                                                    placeholder="BMW"
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
                                                    placeholder="Cliente gostou do atendimento"
                                                    disabled={isPending}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex md:flex-row md:gap-x-10 flex-col gap-y-5">
                                    <FormField
                                        control={form.control}
                                        name="services"
                                        render={() => (
                                            <FormItem>
                                                <div className="mb-4">
                                                    <FormLabel className="text-base">Serviços</FormLabel>
                                                    <FormDescription>
                                                        Serviços disponíveis
                                                    </FormDescription>
                                                </div>
                                                {services?.map((service) => (
                                                    <FormField
                                                        key={service.id}
                                                        control={form.control}
                                                        name="services"
                                                        render={({ field }) => {
                                                            return (
                                                                <FormItem
                                                                    key={service.id}
                                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                                >
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(service.id)}
                                                                            onCheckedChange={(checked) => {
                                                                                const retorno = checked
                                                                                    ? field.onChange([...field.value ?? [], service.id])
                                                                                    : field.onChange(
                                                                                        field.value?.filter(
                                                                                            (value) => value !== service.id
                                                                                        )
                                                                                    )
                                                                                calculateTotalPrice();
                                                                                return retorno;
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <div className="flex justify-between w-full space-x-2">
                                                                        <FormLabel className="text-sm font-normal">
                                                                            {service.name}
                                                                        </FormLabel>
                                                                        <FormDescription>
                                                                            R$ {service.salePrice.toFixed(2).toString().replace('.', ',')}
                                                                        </FormDescription>
                                                                    </div>
                                                                </FormItem>
                                                            )
                                                        }}
                                                    />
                                                ))}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="products"
                                        render={() => (
                                            <FormItem>
                                                <div className="mb-4">
                                                    <FormLabel className="text-base">Produtos</FormLabel>
                                                    <FormDescription>
                                                        Produtos disponíveis
                                                    </FormDescription>
                                                </div>
                                                {products?.map((product) => (
                                                    <FormField
                                                        key={product.id}
                                                        control={form.control}
                                                        name="products"
                                                        render={({ field }) => {
                                                            return (
                                                                <FormItem
                                                                    key={product.id}
                                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                                >
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(product.id)}
                                                                            onCheckedChange={(checked) => {
                                                                                const retorno = checked
                                                                                    ? field.onChange([...field.value ?? [], product.id])
                                                                                    : field.onChange(
                                                                                        field.value?.filter(
                                                                                            (value) => value !== product.id
                                                                                        )
                                                                                    )
                                                                                calculateTotalPrice();
                                                                                return retorno;
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <div className="flex justify-between w-full space-x-2">
                                                                        <FormLabel className="text-sm font-normal">
                                                                            {product.name}
                                                                        </FormLabel>
                                                                        <FormDescription>
                                                                            R$ {product.salePrice.toFixed(2).toString().replace('.', ',')}
                                                                        </FormDescription>
                                                                    </div>
                                                                </FormItem>
                                                            )
                                                        }}
                                                    />
                                                ))}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="isDeferredPayment"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                        À receber
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Cliente irá pagar depois
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Total
                                                </FormLabel>
                                                <div>
                                                    R$ {(totalPrice?.toFixed(2)?.toString().replace('.', ',')) ?? '0,00'}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <Button className="w-full" type="submit" disabled={isPending}>
                                Salvar
                            </Button>
                        </form>
                    </Form>
                </ScrollArea>

            </CardContent>
        </Card>
    )
}

export default SalesPage;
