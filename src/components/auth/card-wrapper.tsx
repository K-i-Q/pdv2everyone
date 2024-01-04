"use client";

import {
    Card
} from "@/components/ui/card";

interface CardWrapperProps {
    children: React.ReactNode;
    headerLabel: string;
    backButtonLabel: string;
    backButtonHref: string;
    showSocial?: boolean;
}

export const CardWrapper = ({
    children,
    headerLabel,
    backButtonLabel,
    backButtonHref,
    showSocial = false
}: CardWrapperProps) => {
    return (
        <Card className="w-[400px] shadow-md">
            {children}
        </Card>
    )
}