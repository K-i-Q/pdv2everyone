import { Label } from '@/components/ui/label';

const VehicleSale : React.FC<{ sale: Sale }> = ({ sale }) => {
  // Função para extrair veículos únicos
  const uniqueVehicles = sale.items.reduce((acc: Vehicle[], item) => {
    const identifier = `${item.vehicle?.model}-${item.vehicle?.licensePlate}`;
    // Se o veículo ainda não foi adicionado e existe, adiciona ao acumulador
    if (item.vehicle && !acc.find((v) => `${v.model}-${v.licensePlate}` === identifier)) {
      acc.push(item.vehicle);
    }
    return acc;
  }, []);

  // Função para formatar a string de veículos para exibição
  const vehiclesString = uniqueVehicles
    .map(vehicle => `${vehicle.model} ${vehicle.licensePlate}`)
    .join(', ');

  return (
    <div>
      <Label>Veículo: {vehiclesString || 'N/A'}</Label>
    </div>
  );
};

export default VehicleSale;
