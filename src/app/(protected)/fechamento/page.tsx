"use client"

import { getServicesByDate } from "@/actions/services";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { toast } from "sonner";


const DailyClosePage = () => {
    //TODO: fazer filtro de serviços por data
    const [date, setDate] = useState<Date>(new Date());
    const [services, setServices] = useState<Service[] | undefined>();

    const getServices = () => {
        getServicesByDate(date!).then((data) => {
            if (data?.error) {
                toast.error(data.error)
            }
            if (data?.success) {
                toast.success(data.success)
                setServices(data.services)
            }
        });
    }


    return (
        <div className="min-h-screen w-full md:px-10 px-5 flex flex-col items-center justify-center">
            <Card className="w-full m-3 md:grid md:grid-cols-2">
                <CardHeader className="flex-col md:flex-row items-center justify-center gap-y-3 md:space-x-2 ">
                    <Dialog>
                        <DialogTrigger className="flex flex-col md:flex-row gap-y-3 w-full outline-none pt-1">
                            <Label className="text-left">Escolha uma data para fechamento:</Label>
                            <Input
                                readOnly
                                className="text-center"
                                value={date?.toLocaleDateString('pt-BR')}
                            />
                        </DialogTrigger>
                        <DialogContent className="items-center justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                            <DialogClose asChild>
                                <Button variant="ghost" onClick={getServices}>
                                    Confirmar
                                </Button>
                            </DialogClose>
                        </DialogContent>
                    </Dialog>
                    <Button className="w-full md:w-auto">Pesquisar</Button>
                </CardHeader>
            </Card>
            <ScrollArea className="h-[400px] w-full">
                <Table className="bg-black text-white w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                Cabeçalho
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                Célula
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    )
}

export default DailyClosePage;
