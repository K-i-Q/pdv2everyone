import { Card, CardHeader } from "@/components/ui/card";
import PaymentList from "./_components/payment-list-client";

export default function PaymentPage() {
    return (
        <section className="flex flex-col items-center justify-center">
            <Card>
                <CardHeader>
                    Pagamentos Pendentes
                </CardHeader>
                <PaymentList />
            </Card>
        </section>
    );
}
