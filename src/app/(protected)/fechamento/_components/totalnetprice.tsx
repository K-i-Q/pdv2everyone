import { Label } from '@/components/ui/label';
import { formatPriceBRL } from '@/utils/mask';

type TotalNetPriceProps = {
  sales: Sale[];
  showLabel?: boolean;
  setBilling?: (billing: number) => void;
};

const TotalNetPrice = ({ sales, showLabel = true, setBilling }: TotalNetPriceProps) => {
  if (sales.length <= 0) return null;
  const totalNetPrice = sales.reduce((acc, sale) => acc + (sale.netPrice || 0), 0);

  if (setBilling) setBilling(totalNetPrice);
  return (
    <div>
      <Label>{showLabel ? "Faturamento do dia: " : ''} {formatPriceBRL(totalNetPrice)}</Label>
    </div>
  );
};

export default TotalNetPrice;
