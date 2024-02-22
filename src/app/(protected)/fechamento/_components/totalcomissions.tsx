import { Label } from '@/components/ui/label';
import { formatPriceBRL } from '@/utils/mask';
import { useEffect, useState } from 'react';

type TotalCommissionsProps = {
  sales: Sale[];
  employees: Employee[];
};

const TotalCommissions = ({ sales, employees }: TotalCommissionsProps) => {

  const [totalCommissions, setTotalCommissions] = useState(0);
  
  useEffect(() => {
    calculateTotalCommissions();
  }, [sales, employees]);

  
  const calculateTotalCommissions = () => {
    let total = 0;
    sales.forEach((sale) => {
      employees.forEach((employee) => {
        const commission = calculateCommissionForSale(sale, employee);
        total += commission;
      });
    });
    setTotalCommissions(total);
  };

  const calculateCommissionForSale = (sale: Sale, employee: Employee) => {
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

    const commission = totalPrice * employee.commission;
    return commission;
  }
  
  if(sales.length <= 0 || employees.length <= 0) return null;


  return (
    <Label>Total das Comissões: {formatPriceBRL(totalCommissions)}</Label>
  );
};

export default TotalCommissions;
