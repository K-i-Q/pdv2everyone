"use client"
import { deleteService, getServices, setStatusService } from "@/actions/services";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Service } from "@prisma/client";
import { useEffect, useState, useTransition } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { MdAddToPhotos } from "react-icons/md";
import { toast } from "sonner";
import { CardService } from "./_components/card-service";

const ServicePage = () => {
    const [showModalDelete, setShowModalDelete] = useState<boolean>(true);
    const [services, setServices] = useState<Service[] | undefined>();
    const [isPending, startTransition] = useTransition();
    const [pesquisa, setPesquisa] = useState<boolean>(false);
    useEffect(() => {
        getAllServices();
    }, [pesquisa])
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

    const handleDeleteService = (serviceId: any) => {
        startTransition(() => {
            deleteService(serviceId).then((data) => {
                if (data?.error) {
                    toast.error(data.error);
                }
                if (data?.success) {
                    toast.success(data.success);
                    getAllServices();
                }
            })
        })
    }

    const handleAtivarStatus = (id: string) => {
        startTransition(() => {
            setStatusService(id).then((data) => {
                if (data.error) {
                    toast.error(data.error)
                }
                if (data.success) {
                    toast.success(data.success);
                    getAllServices();
                }
            }).catch(() => toast.error("Algo deu errado"))
        })
    }


    return (
        <>
            <div className="w-full h-full flex justify-end p-4">
                <Dialog>
                    <DialogTrigger>
                        <Button type="button">
                            <MdAddToPhotos />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 w-auto bg-transparent boder-none">
                        <CardService onServiceUpdate={() => setPesquisa(true)} />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="w-full h-full flex justify-center p-5">
                <Table className="bg-black text-white">
                    <TableHeader>
                        <TableRow className="text-white">
                            <TableHead className="w-[100px]">Nome</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Preço de custo</TableHead>
                            <TableHead>Preço de Venda</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {services?.map((service) => (
                            <TableRow key={service.id} className="group">
                                <TableCell>{service.name}</TableCell>
                                <TableCell>{service.description}</TableCell>
                                <TableCell>{service.costPrice.toString()}</TableCell>
                                <TableCell>{service.salePrice.toString()}</TableCell>
                                <TableCell>
                                    {service.status && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button onClick={() => handleAtivarStatus(service.id)} disabled={isPending} className="bg-transparent text-yellow-400 group-hover:text-black" type="button">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-square-fill" viewBox="0 0 16 16">
                                                            <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z" />
                                                        </svg>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Ativado. Clique para desativar</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                    )}
                                    {!service.status && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button onClick={() => handleAtivarStatus(service.id)} disabled={isPending} className="bg-transparent text-yellow-400 group-hover:text-black" type="button">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-square-fill" viewBox="0 0 16 16">
                                                            <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm3.354 4.646L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708" />
                                                        </svg>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Desativado. Clique para ativar</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Dialog>
                                        <DialogTrigger>
                                            <Button className="bg-transparent text-yellow-400 group-hover:text-black" type="button">
                                                <FaEdit />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="p-0 w-auto bg-transparent boder-none">
                                            <CardService service={service} onServiceUpdate={() => setPesquisa(true)} />
                                        </DialogContent>
                                    </Dialog>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button onClick={() => setShowModalDelete(true)} className="bg-transparent text-yellow-400 group-hover:text-black" type="button">
                                                <FaTrashAlt />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Excluir serviço</DialogTitle>
                                                <DialogDescription>
                                                    Você tem certeza que deseja excluir o serviço {service.name}?
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <DialogClose >
                                                    <Button className="w-full" disabled={isPending} variant="outline" type="button">Cancelar</Button>
                                                </DialogClose>
                                                <Button disabled={isPending} type="button" onClick={() => handleDeleteService(service.id)}>Confirmar</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={5}>Total</TableCell>
                            <TableCell className="text-right">{services?.length}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </>
    )
}

export default ServicePage;