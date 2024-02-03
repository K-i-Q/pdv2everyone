"use client"
import { deleteService, getServices, setStatusService } from "@/actions/services";
import LoadingAnimation from "@/components/custom/LoadingAnimation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatPriceBRL } from "@/utils/mask";
import { Service } from "@prisma/client";
import { useWindowWidth } from '@react-hook/window-size';
import { useEffect, useState, useTransition } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaCheckSquare, FaEdit, FaTimes, FaTrashAlt } from "react-icons/fa";
import { MdAddToPhotos } from "react-icons/md";
import { toast } from "sonner";
import { CardService } from "./_components/card-service";

const ServicePage = () => {
    const [services, setServices] = useState<Service[] | undefined>();
    const [isPending, startTransition] = useTransition();
    const [colSpan, setColSpan] = useState(5);
    const onlyWidth = useWindowWidth()

    useEffect(() => {
        getAllServices();
    }, [])

    useEffect(() => {
        setColSpan(onlyWidth > 768 ? 4 : 2);
    }, [onlyWidth]);

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

    const handleAtivarStatus = (id: string, index: number) => {
        startTransition(() => {
            setStatusService(id).then((data) => {
                if (data.error) {
                    toast.error(data.error)
                }
                if (data.success) {
                    toast.success(data.success);
                    getAllServices();
                }
            }).catch(() => toast.error("Algo deu errado")).finally(() => closeDialogs(index))
        })
    }

    const handleServiceUpdate = (index?: number) => {
        getAllServices();
        closeDialogs(index);
    };

    const closeDialogs = (index?: number) => {
        const dialogCreate = document.getElementById('close-dialog-create') as HTMLElement;
        if (dialogCreate) dialogCreate.click();
        const dialogUpdate = document.getElementById('close-dialog-update' + index) as HTMLElement;
        if (dialogUpdate) dialogUpdate.click();
        const dialogActivate = document.getElementById('close-dialog-activate' + index) as HTMLElement;
        if (dialogActivate) dialogActivate.click();
    }

    const openDialogEdit = (index: number) => {
        const dialogEdit = document.getElementById('edit' + index) as HTMLElement;
        if (dialogEdit) dialogEdit.click();
    }

    const openDialogDelete = (index: number) => {
        const dialogDelete = document.getElementById('delete' + index) as HTMLElement;
        if (dialogDelete) dialogDelete.click();
    }

    const openDialogStatus = (index: number) => {
        const dialogStatus = document.getElementById('status' + index) as HTMLElement;
        if (dialogStatus) dialogStatus.click();
    }

    return (
        <>
            {
                services && (
                    <TooltipProvider>
                        {
                            services.length > 0 && (
                                <div className="flex flex-col-reverse md:flex-col">
                                    <div className="w-full h-full flex justify-end p-4">
                                        <Dialog>
                                            <DialogClose asChild>
                                                <Button id="close-dialog-create" className="hidden">
                                                    Close
                                                </Button>
                                            </DialogClose>
                                            <DialogTrigger asChild>
                                                <Button className="text-2xl p-4 flex flex-col h-full">
                                                    <MdAddToPhotos />
                                                    Adicionar
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="p-0 w-full bg-transparent boder-none">
                                                <CardService onServiceUpdate={handleServiceUpdate} />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <ScrollArea className="h-[400px] w-full pr-4">
                                        <Table className="bg-black text-white">
                                            <TableHeader>
                                                <TableRow className="text-white">
                                                    <TableHead className="w-[100px]">Nome</TableHead>
                                                    <TableHead className="hidden md:table-cell">Descrição</TableHead>
                                                    <TableHead className="hidden md:table-cell">Preço de custo</TableHead>
                                                    <TableHead>Preço de Venda</TableHead>
                                                    <TableHead className="text-right">Ações</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {services?.map((service, index) => (
                                                    <TableRow key={service.id} className="group">
                                                        <TableCell>{service.name}</TableCell>
                                                        <TableCell className="hidden md:table-cell">{service.description}</TableCell>
                                                        <TableCell className="hidden md:table-cell">{formatPriceBRL(service.costPrice)}</TableCell>
                                                        <TableCell>{formatPriceBRL(service.salePrice)}</TableCell>
                                                        <TableCell className="md:space-x-3 md:space-y-0 space-y-2 flex flex-col md:flex-row items-center justify-center">
                                                            {onlyWidth < 768 && (
                                                                <>

                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button>
                                                                                <BsThreeDots />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent className="w-56">
                                                                            <DropdownMenuItem>
                                                                                <Button
                                                                                    className="w-full justify-between"
                                                                                    onClick={() => openDialogEdit(index)}>
                                                                                    Editar
                                                                                    <FaEdit />
                                                                                </Button>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem>
                                                                                <Button
                                                                                    className="w-full justify-between"
                                                                                    onClick={() => openDialogDelete(index)}>
                                                                                    Excluir
                                                                                    <FaTrashAlt />
                                                                                </Button>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem>
                                                                                <Button
                                                                                    className="w-full justify-between"
                                                                                    onClick={() => openDialogStatus(index)}>
                                                                                    {service.status && (
                                                                                        <>
                                                                                            Ativado
                                                                                            <FaCheckSquare />
                                                                                        </>
                                                                                    )}
                                                                                    {!service.status && (
                                                                                        <>
                                                                                            Desativado
                                                                                            <FaTimes />
                                                                                        </>
                                                                                    )}
                                                                                </Button>
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                    <Dialog>
                                                                        <DialogClose asChild>
                                                                            <Button id={`close-dialog-update${index}`} className="hidden">
                                                                                Close
                                                                            </Button>
                                                                        </DialogClose>
                                                                        <DialogTrigger asChild>
                                                                            <Button id={`edit${index}`} className="hidden">
                                                                                Editar
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                        <DialogContent className="p-0 w-ful bg-transparent boder-none">
                                                                            <CardService service={service} onServiceUpdate={() => handleServiceUpdate(index)} />
                                                                        </DialogContent>
                                                                    </Dialog>
                                                                    <Dialog>
                                                                        <DialogTrigger asChild>
                                                                            <Button id={`delete${index}`} className="hidden">
                                                                                Excluir
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                        <DialogContent>
                                                                            <DialogHeader>
                                                                                <DialogTitle>Confirmar</DialogTitle>
                                                                                <DialogDescription>
                                                                                    Excluir serviço
                                                                                </DialogDescription>
                                                                            </DialogHeader>
                                                                            <div>
                                                                                Você tem certeza que deseja excluir o serviço {service.name}?
                                                                            </div>
                                                                            <DialogFooter className="gap-y-3">
                                                                                <DialogClose className="border-none">
                                                                                    <div className="w-full px-2 py-0 hover:underline">Cancelar</div>
                                                                                </DialogClose>
                                                                                <Button disabled={isPending} type="button" onClick={() => handleDeleteService(service.id)}>Excluir</Button>
                                                                            </DialogFooter>
                                                                        </DialogContent>
                                                                    </Dialog>
                                                                    <Dialog>
                                                                        <DialogTrigger asChild>
                                                                            <Button id={`status${index}`} className="hidden">
                                                                                Status
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                        <DialogContent>
                                                                            <DialogClose asChild>
                                                                                <Button id={`close-dialog-activate${index}`} className="hidden">
                                                                                    Close
                                                                                </Button>
                                                                            </DialogClose>
                                                                            <DialogHeader>
                                                                                <DialogTitle>Confirmar</DialogTitle>
                                                                                <DialogDescription>
                                                                                    {service.status ? 'Desativar' : 'Ativar'}
                                                                                </DialogDescription>
                                                                            </DialogHeader>
                                                                            <div>
                                                                                {service.status ? 'Desativar' : 'Ativar'} o serviço {service.name}?
                                                                            </div>
                                                                            <DialogFooter className="gap-y-3">
                                                                                <DialogClose asChild className="border-none">
                                                                                    <Button className="px-2 py-0 hover:underline text-white" variant="outline">Cancelar</Button>
                                                                                </DialogClose>
                                                                                <Button onClick={() => handleAtivarStatus(service.id, index)} disabled={isPending} type="button">Confirmar</Button>
                                                                            </DialogFooter>
                                                                        </DialogContent>
                                                                    </Dialog>
                                                                </>
                                                            )}
                                                            {onlyWidth > 768 && (
                                                                <>
                                                                    <Dialog>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <DialogTrigger asChild>
                                                                                    <Button className="md:text-2xl">
                                                                                        {service.status ? <FaCheckSquare /> : <FaTimes />}
                                                                                    </Button>
                                                                                </DialogTrigger>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                {service.status ? 'Desativar' : 'Ativar'} serviço {service.name}
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                        <DialogContent>
                                                                            <DialogClose asChild>
                                                                                <Button id={`close-dialog-activate${index}`} className="hidden">
                                                                                    Close
                                                                                </Button>
                                                                            </DialogClose>
                                                                            <DialogHeader>
                                                                                <DialogTitle>Confirmar</DialogTitle>
                                                                                <DialogDescription>
                                                                                    {service.status ? 'Desativar' : 'Ativar'}
                                                                                </DialogDescription>
                                                                            </DialogHeader>
                                                                            <div>
                                                                                {service.status ? 'Desativar' : 'Ativar'} o serviço {service.name}?
                                                                            </div>
                                                                            <DialogFooter className="gap-y-3">
                                                                                <DialogClose asChild className="border-none">
                                                                                    <Button className="px-2 py-0 hover:underline text-white" variant="outline">Cancelar</Button>
                                                                                </DialogClose>
                                                                                <Button onClick={() => handleAtivarStatus(service.id, index)} disabled={isPending} type="button">Confirmar</Button>
                                                                            </DialogFooter>
                                                                        </DialogContent>
                                                                    </Dialog>
                                                                    <Dialog>
                                                                        <DialogClose asChild>
                                                                            <Button id={`close-dialog-update${index}`} className="hidden">
                                                                                Close
                                                                            </Button>
                                                                        </DialogClose>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <DialogTrigger asChild>
                                                                                    <Button className="md:text-2xl">
                                                                                        <FaEdit />
                                                                                    </Button>
                                                                                </DialogTrigger>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>Editar serviço {service.name}</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>

                                                                        <DialogContent className="p-0 w-ful bg-transparent boder-none">
                                                                            <CardService service={service} onServiceUpdate={() => handleServiceUpdate(index)} />
                                                                        </DialogContent>
                                                                    </Dialog>
                                                                    <Dialog>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <DialogTrigger asChild>
                                                                                    <Button className="md:text-2xl">
                                                                                        <FaTrashAlt />
                                                                                    </Button>
                                                                                </DialogTrigger>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>Excluir serviço {service.name}</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                        <DialogContent>
                                                                            <DialogHeader>
                                                                                <DialogTitle>Confirmar</DialogTitle>
                                                                                <DialogDescription>
                                                                                    Excluir serviço
                                                                                </DialogDescription>
                                                                            </DialogHeader>
                                                                            <div>
                                                                                Você tem certeza que deseja excluir o serviço {service.name}?
                                                                            </div>
                                                                            <DialogFooter className="gap-y-3">
                                                                                <DialogClose className="border-none">
                                                                                    <div className="w-full px-2 py-0 hover:underline">Cancelar</div>
                                                                                </DialogClose>
                                                                                <Button disabled={isPending} type="button" onClick={() => handleDeleteService(service.id)}>Excluir</Button>
                                                                            </DialogFooter>
                                                                        </DialogContent>
                                                                    </Dialog>
                                                                </>
                                                            )}

                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                            <TableFooter>
                                                <TableRow>
                                                    <TableCell colSpan={colSpan}>Quantidade serviços</TableCell>
                                                    <TableCell className="text-right">{services?.length}</TableCell>
                                                </TableRow>
                                            </TableFooter>
                                        </Table>
                                    </ScrollArea>
                                </div>
                            )
                        }
                        {!(services.length > 0) && (
                            <Dialog>
                                <DialogClose asChild>
                                    <Button id="close-dialog-create" className="hidden">
                                        Close
                                    </Button>
                                </DialogClose>
                                <DialogTrigger asChild>
                                    <Button className="text-5xl p-12 flex gap-x-3">
                                        <MdAddToPhotos />
                                        Adicionar serviço
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="p-0 w-full bg-transparent boder-none">
                                    <CardService onServiceUpdate={handleServiceUpdate} />
                                </DialogContent>
                            </Dialog>
                        )
                        }
                    </TooltipProvider>
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