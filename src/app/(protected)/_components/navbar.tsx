"use client";

import UserButton from "@/components/auth/user-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
    className?: string;
}
export const Navbar = ({ className } : NavbarProps) => {
    const pathName = usePathname();


   
    return (
        <nav className={`bg-gray-900 flex justify-between items-center p-4 w-full shadow-sm ${className}`}>
            {/* <div className="flex gap-x-2">
                <Button asChild variant={pathName === '/admin' ? "default" : "outline"}>
                    <Link href="/admin">
                        Admin
                    </Link>
                </Button>
            </div>
            <div className="flex gap-x-2">
                <Button asChild variant={pathName === '/client' ? "default" : "outline"}>
                    <Link href="/client">
                        Client
                    </Link>
                </Button>
            </div>*/}
            <div className="flex gap-x-2">
                <Button asChild variant={pathName === '/sales' ? "default" : "outline"}>
                    <Link href="/sales">
                        Venda
                    </Link>
                </Button>
            </div>
            <div className="flex gap-x-2">
                <Button asChild variant={pathName === '/services' ? "default" : "outline"}>
                    <Link href="/services">
                        Serviços
                    </Link>
                </Button>
            </div> 
            <div className="flex gap-x-2">
                <Button asChild variant={pathName === '/dashboard' ? "default" : "outline"}>
                    <Link href="/dashboard">
                        Dashboard
                    </Link>
                </Button>
            </div>
            <UserButton />
        </nav>
    )
}