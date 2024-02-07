import { Label } from '@/components/ui/label';
import React from 'react';

// Supondo que as interfaces acima estejam definidas e importadas corretamente

const ServiceSale: React.FC<{ sale: Sale }> = ({ sale }) => {
  // Extrair nomes de serviços únicos
  const uniqueServiceNames = sale.items
    .flatMap(item => item.service) // Cria um array plano de todos os serviços
    .map(service => service?.name) // Extrai os nomes dos serviços
    .filter((value, index, self) => self.indexOf(value) === index); // Filtra nomes únicos

  // Juntar nomes de serviços com vírgula
  const servicesString = uniqueServiceNames.join(', ');

  return (
    <div>
      <Label>Serviços: {servicesString || 'N/A'}</Label>
    </div>
  );
};

export default ServiceSale;
