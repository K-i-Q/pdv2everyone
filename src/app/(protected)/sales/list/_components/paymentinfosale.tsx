import { Label } from '@/components/ui/label';
import React from 'react';

// Assumindo que os tipos acima foram definidos e importados corretamente

const PaymentInfoSale: React.FC<{ sale: Sale }> = ({ sale }) => {
    // Checa se a venda foi feita com pagamento diferido e ainda não tem pagamentos vinculados
    const isDeferredAndUnpaid = sale.isDeferredPayment && sale.salePayments.length === 0;
    // Extrai e formata as descrições dos métodos de pagamento utilizados
    const paymentMethodsUsed = sale.salePayments
        .map(payment => payment.paymentMethod.description)
        .join(', ');
    return (
        <div>
            <Label className="flex items-center justify-between">
                Pagamento: <span>{isDeferredAndUnpaid ? 'Não pagou ainda' : paymentMethodsUsed || 'N/A'}</span>
            </Label>
        </div>
    );
};

export default PaymentInfoSale;
