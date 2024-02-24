import { Label } from '@/components/ui/label';
import { formatPriceBRL } from '@/utils/mask';

type TotalNetPriceProps = {
  sales: Sale[];
  showLabel?: boolean;
};

const TotalNetPrice = ({ sales, showLabel = true }: TotalNetPriceProps) => {
  // Calcula a soma do netPrice de todas as vendas
  if(sales.length <= 0) return null;
  const totalNetPrice = sales.reduce((acc, sale) => acc + (sale.netPrice || 0), 0);

  return (
    <div>
      <Label>{showLabel ? "Faturamento do dia: " : ''} {formatPriceBRL(totalNetPrice)}</Label>
    </div>
  );
};

export default TotalNetPrice;
