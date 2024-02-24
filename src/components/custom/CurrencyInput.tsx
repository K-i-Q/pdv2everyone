import { Input } from "@/components/ui/input"; // Assumindo que Input é um componente de input básico
import { useEffect, useState } from 'react';
type TextInputProps = {
    placeholder: string;
    autoComplete: string;
    disabled?: boolean;
    defaultValue: number
  };
  
// Configuração do formatador de moeda brasileira
const moneyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

export default function CurrencyInput({ placeholder, autoComplete, disabled, defaultValue }: TextInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [realValue, setRealValue] = useState(defaultValue);

  // Atualiza o displayValue quando realValue muda
  useEffect(() => {
    setDisplayValue(moneyFormatter.format(realValue));
  }, [realValue]);

  // Lidar com a mudança de valor do input
  const handleChange = (event:any) => {
    const digits = event.target.value.replace(/\D/g, '');
    const num = digits ? parseInt(digits, 10) / 100 : 0;
    setRealValue(num);
  };

  return (
    <div>
      <Input
        type="text"
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        value={displayValue}
        onChange={handleChange}
        // Para prevenir o usuário de inserir caracteres não numéricos diretamente
        onKeyPress={(event) => {
          if (!/[0-9]/.test(event.key)) {
            event.preventDefault();
          }
        }}
      />
    </div>
  );
}
