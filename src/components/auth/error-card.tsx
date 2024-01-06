import { CardWrapper } from "@/components/auth/card-wrapper";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export const ErrorCard = () => {
    return (
        <CardWrapper
            headerLabel="Poxa, algo deu errado"
            backButtonHref="/auth/login"
            backButtonLabel="Voltar para o login"

        >
            <div className="w-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-4 h-4 text-destructive" />
            </div>
        </CardWrapper>

    )
}