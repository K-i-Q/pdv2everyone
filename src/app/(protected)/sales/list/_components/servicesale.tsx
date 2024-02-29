import { Label } from '@/components/ui/label';

// Supondo que as interfaces acima estejam definidas e importadas corretamente
type ServiceSaleProps = {
  sale: Sale;
  showLabel?:boolean;
}
const ServiceSale= ({sale, showLabel = true}: ServiceSaleProps) => {
  // Extrair nomes de serviços únicos
  const uniqueServiceNames = sale.items
    .flatMap(item => item.service) // Cria um array plano de todos os serviços
    .map(service => service?.name) // Extrai os nomes dos serviços
    .filter((value, index, self) => self.indexOf(value) === index); // Filtra nomes únicos

  // Juntar nomes de serviços com vírgula
  const servicesString = uniqueServiceNames.join(', ');

  return (
    <div>
      <Label className="flex items-center justify-between">{showLabel ? 'Serviços:' : ''} <span>{servicesString || 'N/A'}</span></Label>
    </div>
  );
};

export default ServiceSale;
