"use client";

import { FormError } from "@/components/form-error";
import { useCurrentRole } from "@/hooks/use-current-role";
import { UserRole } from "@prisma/client";

interface RoleGateProps {
    children: React.ReactNode;
    allowedRole: UserRole
}

export const RoleGate = ({ children, allowedRole }: RoleGateProps) => {
    const role = useCurrentRole();
    if (role !== allowedRole) {
        return (
            <FormError message="Você não tem permissão para ver esse conteúdo" />
        )
    }

    return (
        <>
            {children}
        </>
    )
}