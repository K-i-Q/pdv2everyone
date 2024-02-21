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

  // Esta função deve ser chamada sempre que o valor da comissão individual é atualizado
  const handleCommissionChange = (saleId: string, employeeId: string, newCommissionValue: number) => {
    // Aqui você deve atualizar o estado da venda específica e do funcionário com o novo valor da comissão
    // e recalcular o total das comissões
    updateSaleCommission(saleId, employeeId, newCommissionValue);
    calculateTotalCommissions();
  };

  return (
    <Label>Total das Comissões: {formatPriceBRL(totalCommissions)}</Label>
  );
};

export default TotalCommissions;
