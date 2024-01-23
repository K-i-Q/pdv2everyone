"use client";

// import { useCurrentRole } from "@/hooks/use-current-role";

interface RoleGateProps {
    children: React.ReactNode;
    // allowedRole: UserRole
}

export const RoleGate = ({ children }: RoleGateProps) => {
    // const role = useCurrentRole();
    // if (role !== allowedRole) {
    //     return (
    //         <FormError message="Você não tem permissão para ver esse conteúdo" />
    //     )
    // }

    return (
        <>
            {children}
        </>
    )
}