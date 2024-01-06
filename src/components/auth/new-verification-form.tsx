"use client";

import { newVerification } from "@/actions/new-verification";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
export const NewVerificationForm = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    const onSubmit = useCallback(() => {
        if (success || error) return;
        if (!token) {
            setError("Token não existe");
            return
        }
        newVerification(token).then((data) => {
            setSuccess(data.success)
            setError(data.error)
        }).catch(() => {
            setError("Algo deu errado")
        })
    }, [token, success, error])

    useEffect(() => {
        onSubmit();
    }, [onSubmit])
    return (
        <CardWrapper
            headerLabel="Confirmação de email"
            backButtonHref="/auth/login"
            backButtonLabel="Voltar ao login"
        >
            <div className="w-full flex items-center justify-center">
                {!success && !error && (
                    <BeatLoader />
                )
                }
                <FormSuccess message={success} />
                {!success && (
                    <FormError message={error} />
                )
                }
            </div>
        </CardWrapper>
    )
}