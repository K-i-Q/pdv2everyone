"use client";
import { admin } from "@/actions/admin";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

const AdminPage = () => {
    const onServerActionClick = () => {
        admin().then((data) => {
            // if (data?.success) {
            //     toast.success(data.success)
            // }

            if (data?.error) {
                toast.error(data.error)
            }
        })
    }
    const onApiRouteClick = () => {
        fetch('/api/admin').then((response) => {
            if (response.ok) {
                toast.success("Acesso permitido")
            } else {
                toast.error("Acesso negado")
            }
        })
    }

    return (
        <Card className="md:w-1/3">
            <CardHeader>
                <p className="text-2xl font-semibold text-center">
                    Admin
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* <RoleGate allowedRole={UserRole.ADMIN}> */}
                    <FormSuccess message="Você tem permissão pra ver esse conteúdo" />
                {/* </RoleGate> */}
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-md">
                    <p className="text-sm font-medium">
                        Admin-only API route
                    </p>
                    <Button onClick={onApiRouteClick}>
                        Click to test
                    </Button>
                </div>
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-md">
                    <p className="text-sm font-medium">
                        Admin-only server action
                    </p>
                    <Button onClick={onServerActionClick}>
                        Click to test
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default AdminPage;