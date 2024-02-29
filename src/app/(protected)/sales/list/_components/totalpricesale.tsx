import { Label } from '@/components/ui/label';
import { formatPriceBRL } from '@/utils/mask';

type TotalPriceSaleProps = {
  sale: Sale;
  showLabel?: boolean;
}
const TotalPriceSale = ({sale, showLabel = true}: TotalPriceSaleProps) => {
  // Calcula o preço total dos produtos
  const totalProductsPrice = sale.items
    .filter(item => item.product)
    .reduce((acc, item) => acc + ((item.product?.salePrice || 0) * item.quantity), 0);

  // Calcula o preço total dos serviços
  const totalServicesPrice = sale.items
    .filter(item => item.service)
    .reduce((acc, item) => acc + ((item.service?.salePrice || 0) * item.quantity), 0);

  // Soma os preços dos produtos e serviços para obter o preço total da venda
  const totalPrice = totalProductsPrice + totalServicesPrice;

  return (
    <div>
      <Label>{showLabel ? "Total:" : ''} {formatPriceBRL(totalPrice)}</Label>
    </div>
  );
};

export default TotalPriceSale;
