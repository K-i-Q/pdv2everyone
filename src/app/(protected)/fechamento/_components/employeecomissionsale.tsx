import CurrencyInput from '@/components/custom/CurrencyInput';
import { SalaryEmployee } from '../page';


type EmployeeCommissionSaleProps = {
  sale: Sale;
  employee: Employee;
  disabled: boolean;
  salary: SalaryEmployee;
  setSalary: (salary: SalaryEmployee) => void;
}


const EmployeeCommissionSale = ({ sale, employee, disabled, setSalary, salary }: EmployeeCommissionSaleProps) => {
  // Supondo que a comissão do funcionário está em uma taxa percentual sobre o preço total da venda
  // e que o total da venda já foi calculado em outro lugar e passado para esse componente
  const totalProductsPrice = sale.items
    .filter(item => item.product)
    .reduce((acc, item) => acc + ((item.product?.salePrice || 0) * item.quantity), 0);

  const totalServicesPrice = sale.items
    .filter(item => item.service)
    .reduce((acc, item) => acc + ((item.service?.salePrice || 0) * item.quantity), 0);

  const totalPrice = totalProductsPrice + totalServicesPrice;

  // Calcula a comissão do funcionário
  const commission = totalPrice * employee.commission; // Supondo que a comissão está armazenada como um percentual

  const updateSalaryMatrix = (prevSalary: SalaryEmployee, employeeId: string, saleId: string, value: number) => {
    const updatedSalary: SalaryEmployee = {
      ...prevSalary,
      [employeeId]: {
        ...prevSalary[employeeId],
        [saleId]: value
      }
    };
    setSalary(updatedSalary);
  };

  return (
    <div>
      <CurrencyInput
        defaultValue={commission}
        placeholder="R$ 100,00"
        autoComplete="off"
        disabled={disabled}
        onChange={newValue => updateSalaryMatrix(salary, employee.id, sale.id, newValue)}
      />
    </div>
  );
};

export default EmployeeCommissionSale;
