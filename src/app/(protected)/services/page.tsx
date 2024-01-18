"use client"
import { services } from "@/actions/services";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ServicesSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const ServicePage = () => {
    const [success, setSuccess] = useState<string | undefined>();
    const [error, setError] = useState<string | undefined>();
    const [isListContent, setIsListContent] = useState<boolean>(true);
    const [isPending, startTransition] = useTransition();
    const { update } = useSession();

    const form = useForm<z.infer<typeof ServicesSchema>>({
        resolver: zodResolver(ServicesSchema),
        defaultValues: {
            name: undefined,
            description: undefined,
            costPrice: undefined,
            salePrice: undefined
        }
    });

    const onSubmit = (values: z.infer<typeof ServicesSchema>) => {
        startTransition(() => {
            services(values).then((data) => {
                setError("");
                setSuccess("");
                if (data.error) {
                    setError(data.error)
                }
                if (data.success) {
                    update();
                    setSuccess(data.success)
                }
            }).catch(() => setError("Algo deu errado"))
        })
    }


    return (
        <>
            <div className="w-full flex justify-end p-4">
                <Button onClick={() => setIsListContent(!isListContent)}>Lista</Button>
            </div>
            {isListContent && (
                <div className="w-full h-screen flex justify-center p-5">
                    <Table className="bg-black text-white">
                        <TableCaption>A list of your recent invoices.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Invoice</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* {invoices.map((invoice) => ( */}
                                <TableRow key={1}>
                                    <TableCell className="font-medium">{'invoice.invoice'}</TableCell>
                                    <TableCell>{'invoice.paymentStatus'}</TableCell>
                                    <TableCell>{'invoice.paymentMethod'}</TableCell>
                                    <TableCell className="text-right">{'invoice.totalAmount'}</TableCell>
                                </TableRow>
                            {/* ))} */}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={3}>Total</TableCell>
                                <TableCell className="text-right">$2,500.00</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            )
            }
            {!isListContent && (
                <Card className="md:w-3/4">
                    <CardHeader>
                        Cadastro de Serviço
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="space-y-2">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Nome do Serviço
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="COMPLETO"
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Descrição do Serviço
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        placeholder="Lavagem externa e interna"
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="costPrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Preço de Custo
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="R$ 50,00"
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="salePrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Preço de Venda
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="R$ 100,00"
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormError message={error} />
                                <FormSuccess message={success} />
                                <Button className="w-full" type="submit" disabled={isPending}>
                                    Salvar
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            )
            }

        </>
    )
}

export default ServicePage;