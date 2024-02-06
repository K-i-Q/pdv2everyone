import { Label } from '@/components/ui/label';
import React from 'react';

// Assumindo que os tipos acima foram definidos e importados corretamente

const PaymentInfoSale: React.FC<{ sale: Sale }> = ({ sale }) => {
    // Checa se a venda foi feita com pagamento diferido e ainda não tem pagamentos vinculados
    const isDeferredAndUnpaid = sale.isDeferredPayment && sale.salePayments.length === 0;
    console.log(sale);
    // Extrai e formata as descrições dos métodos de pagamento utilizados
    const paymentMethodsUsed = sale.salePayments
        .map(payment => payment.paymentMethod.description)
        .join(', ');
    return (
        <div>
            <Label>
                Pagamento: {isDeferredAndUnpaid ? 'Não pagou ainda' : paymentMethodsUsed || 'N/A'}
            </Label>
        </div>
    );
};

export default PaymentInfoSale;
