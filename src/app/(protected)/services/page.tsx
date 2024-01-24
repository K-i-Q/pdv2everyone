"use client"
import { deleteService, getServices, setStatusService } from "@/actions/services";
import LoadingAnimation from "@/components/custom/LoadingAnimation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Service } from "@prisma/client";
import { useEffect, useState, useTransition } from "react";
import { FaCheckSquare, FaEdit, FaTimes, FaTrashAlt } from "react-icons/fa";
import { MdAddToPhotos } from "react-icons/md";
import { toast } from "sonner";
import { CardService } from "./_components/card-service";

const ServicePage = () => {
    const [showModalDelete, setShowModalDelete] = useState<boolean>(true);
    const [services, setServices] = useState<Service[] | undefined>();
    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [colSpan, setColSpan] = useState(5);

    useEffect(() => {
        getAllServices();
    }, [])
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

    const handleServiceUpdate = () => {
        getAllServices();
        closeDialogs();
    };

    const closeDialogs = () => {
        const dialogCreate = document.getElementById('close-dialog-create') as HTMLElement;
        if (dialogCreate) dialogCreate.click();
        const dialogUpdate = document.getElementById('close-dialog-update') as HTMLElement;
        if (dialogUpdate) dialogUpdate.click();
    }


    useEffect(() => {
        const handleResize = () => {
            setColSpan(window.innerWidth > 768 ? 5 : 3);
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);


    return (
        <>
            {
                services && (
                    <>
                        {
                            services.length > 0 && (
                                <div className="flex flex-col-reverse md:flex-col">
                                    <div className="w-full h-full flex justify-end p-4">
                                        <Dialog>
                                            <DialogClose asChild>
                                                <div id="close-dialog-create" className="hidden">
                                                    Close
                                                </div>
                                            </DialogClose>
                                            <DialogTrigger>
                                                <div className="text-black md:text-4xl md:py-6 md:px-14 py-3 px-4 rounded-md bg-yellow-400 flex items-center justify-center shadow hover:bg-yellow-300/90">
                                                    <MdAddToPhotos />
                                                </div>
                                            </DialogTrigger>
                                            <DialogContent className="p-0 w-full bg-transparent boder-none">
                                                <CardService onServiceUpdate={() => handleServiceUpdate()} />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <div className="w-full h-full flex justify-center p-5">
                                        <Table className="bg-black text-white">
                                            <TableHeader>
                                                <TableRow className="text-white">
                                                    <TableHead className="w-[100px]">Nome</TableHead>
                                                    <TableHead className="hidden md:table-cell">Descrição</TableHead>
                                                    <TableHead className="hidden md:table-cell">Preço de custo</TableHead>
                                                    <TableHead>Preço de Venda</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Ações</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {services?.map((service) => (
                                                    <TableRow key={service.id} className="group">
                                                        <TableCell>{service.name}</TableCell>
                                                        <TableCell className="hidden md:table-cell">{service.description}</TableCell>
                                                        <TableCell className="hidden md:table-cell">{service.costPrice.toString()}</TableCell>
                                                        <TableCell>{service.salePrice.toString()}</TableCell>
                                                        <TableCell>
                                                            {service.status && (
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <div onClick={() => handleAtivarStatus(service.id)} className="bg-transparent text-yellow-400 py-2 px-3 rounded-md group-hover:text-black hover:bg-yellow-300/90 md:text-2xl cursor-pointer">
                                                                                <FaCheckSquare />
                                                                            </div>
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
                                                                            <div onClick={() => handleAtivarStatus(service.id)} className="bg-transparent text-yellow-400 py-2 px-3 rounded-md group-hover:text-black hover:bg-yellow-300/90 md:text-2xl cursor-pointer">
                                                                                <FaTimes />
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>Desativado. Clique para ativar</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right space-x-2 flex flex-row">
                                                            <Dialog>
                                                                <DialogClose asChild>
                                                                    <div id="close-dialog-update" className="hidden">
                                                                        Close
                                                                    </div>
                                                                </DialogClose>
                                                                <DialogTrigger>
                                                                    <div className="bg-transparent text-yellow-400 group-hover:text-black py-2.5 px-4 rounded-md flex items-center justify-center shadow hover:bg-yellow-300/90 md:text-2xl">
                                                                        <FaEdit />
                                                                    </div>
                                                                </DialogTrigger>
                                                                <DialogContent className="p-0 w-ful bg-transparent boder-none">
                                                                    <CardService service={service} onServiceUpdate={() => handleServiceUpdate()} />
                                                                </DialogContent>
                                                            </Dialog>
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <div onClick={() => setShowModalDelete(true)} className="bg-transparent text-yellow-400 group-hover:text-black py-2.5 px-4 rounded-md flex items-center justify-center shadow hover:bg-yellow-300/90 md:text-2xl">
                                                                        <FaTrashAlt />
                                                                    </div>
                                                                </DialogTrigger>
                                                                <DialogContent className="sm:max-w-[425px]">
                                                                    <DialogHeader>
                                                                        <DialogTitle>Excluir serviço</DialogTitle>
                                                                        <DialogDescription>
                                                                            Você tem certeza que deseja excluir o serviço {service.name}?
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    <DialogFooter>
                                                                        <DialogClose className="border-none">
                                                                            <div className="w-full px-2 py-0 hover:underline">Cancelar</div>
                                                                        </DialogClose>
                                                                        <Button disabled={isPending} type="button" onClick={() => handleDeleteService(service.id)}>Excluir</Button>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                            <TableFooter>
                                                <TableRow>
                                                    <TableCell colSpan={colSpan}>Total</TableCell>
                                                    <TableCell className="text-right">{services?.length}</TableCell>
                                                </TableRow>
                                            </TableFooter>
                                        </Table>
                                    </div>
                                </div>
                            )
                        }
                        {!(services.length > 0) && (
                            <Dialog>
                                <DialogClose asChild>
                                    <div id="close-dialog-create" className="hidden">
                                        Close
                                    </div>
                                </DialogClose>
                                <DialogTrigger>
                                    <div className="text-black md:text-4xl md:py-6 md:px-14 py-3 px-4 rounded-md bg-yellow-400 flex flex-col items-center justify-center shadow hover:bg-yellow-300/90">
                                        <MdAddToPhotos />
                                        Adicionar Serviço
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="p-0 w-full bg-transparent boder-none">
                                    <CardService onServiceUpdate={() => handleServiceUpdate()} />
                                </DialogContent>
                            </Dialog>
                        )
                        }
                    </>
                )}
            {
                !services && (
                    <LoadingAnimation />
                )
            }
        </>
    )
}

export default ServicePage;