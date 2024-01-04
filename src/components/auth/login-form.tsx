import { CardWrapper } from "./card-wrapper"

export const LoginForm = () => {
    return (
        <CardWrapper
            headerLabel="Bem vindo"
            backButtonLabel="Não possui conta?"
            backButtonHref="/auth/register"
        >
            Login Form!
        </CardWrapper>
    )
}
