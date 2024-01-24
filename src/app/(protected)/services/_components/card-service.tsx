"use client"
import { createService, updateService } from "@/actions/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ServicesSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Service } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";


interface CardServiceProps {
    service?: Service | undefined;
    onServiceUpdate: () => void;
}
export const CardService = ({ service, onServiceUpdate }: CardServiceProps) => {
    const [isPending, startTransition] = useTransition();
    const { update } = useSession();

    const form = useForm<z.infer<typeof ServicesSchema>>({
        resolver: zodResolver(ServicesSchema),
        defaultValues: {
            id: service?.id || undefined,
            name: service?.name || undefined,
            description: service?.description || undefined,
            costPrice: service?.costPrice.toString() || undefined,
            salePrice: service?.salePrice.toString() || undefined,
            status: service?.status || false
        }
    });

    const onSubmit = (values: z.infer<typeof ServicesSchema>) => {
        startTransition(() => {
            if (service) {
                updateService(values).then((data) => {
                    if (data.error) {
                        toast.error(data.error)
                    }
                    if (data.success) {
                        update();
                        toast.success(data.success);
                    }
                }).catch(() => toast.error("Algo deu errado")).finally(() => {
                    onServiceUpdate();
                })
            } else {
                createService(values).then((data) => {
                    if (data.error) {
                        toast.error(data.error)
                    }
                    if (data.success) {
                        update();
                        toast.success(data.success);
                    }
                }).catch(() => toast.error("Algo deu errado")).finally(() => {
                    onServiceUpdate();
                })
            }

        })
    }


    return (
        <Card>
            <CardHeader>
                {!service ? 'Cadastro de Serviço' : 'Editar Serviço'}
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
                                                type="number"
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
                                                type="number"
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Este serviço ficará imediatamente ativo?
                                            </FormLabel>
                                            <FormDescription>
                                                Se marcar essa opção ele ficará imediatamente disponível para ser usado nas vendas
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button className="w-full" type="submit" disabled={isPending}>
                            Salvar
                        </Button>
                        <Button className="w-full" onClick={onServiceUpdate} variant="outline" type="button" disabled={isPending}>
                            Cancelar
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
