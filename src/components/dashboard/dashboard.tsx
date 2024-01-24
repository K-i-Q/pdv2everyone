import { InputFileXlsXlsx } from '@/components/custom/Input';
import React, { useState } from 'react';
import { read, utils } from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

type PlanilhaDados = {
    DATA: string;
    VEILUCO: string;
    PLACA: string;
    SERVICO: string;
    VALOR: string;
    OBS: string | null;
    [key: string]: string | null; // Representa as comissões dos funcionários (e.g., ADRI, BIEL, JAKE).
};

type ModeloProps = {
    modelo: string;
    quantidade: number;
};

type FrequenteProps = {
    placa: string;
    quantidade: number;
};


type DashboardData = {
    diaMaiorMovimento: { dia: string; quantidade: number };
    diaMaiorFaturamento: {
        maiorFaturamento: { dia: string; valor: number };
        menorFaturamento: { dia: string; valor: number };
    };
    servicosMaisPrestados: {
        servico: string;
        quantidade: number;
    }[];
    totalPagamentoFuncionarios: FuncionarioTotal[];
    modeloMaisLavado: ModeloProps[];
    carrosFrequentes: FrequenteProps[];
};

type FuncionarioTotal = {
    nome: string;
    totalPagar: number;
};

const Dashboard: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData | undefined>();

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const data = e.target.result;
                const workbook = read(data, { type: 'binary' });

                // Assumindo que os dados estão na primeira folha da planilha
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const json = utils.sheet_to_json(sheet);
                // Cria um Blob com os dados JSON
                const dataAtualizados = tratamentoDeDadosJSON(json);
                // Aqui você precisaria processar os dados de json e atualizar o dashboardData com o resultado
                setDashboardData(dataAtualizados);
            };
            reader.readAsBinaryString(file);
        }
    };

    const tratamentoDeDadosJSON = (dadosJson: any) => {
        const dadosPlanilha: PlanilhaDados[] = dadosJson.map((dado: any) => {
            const funcionarios: Record<string, string | null | number> = {};

            Object.keys(dado).forEach((key) => {
                let valor = dado[key];

                // Limpar valor monetário para o campo VALOR
                if (key === 'VALOR') {
                    valor = limparValorMonetario(valor);
                    funcionarios[key] = valor;
                }

                // Limpar valor monetário para o array de funcionários
                if (key !== 'DATA' && key !== 'VEILUCO' && key !== 'PLACA' && key !== 'SERVIÇO' && key !== 'VALOR' && key !== 'OBS') {
                    funcionarios[key] = limparValorMonetario(valor);
                }
            });

            return {
                DATA: excelSerialDateToJSDate(dado.DATA).toLocaleDateString(),
                VEILUCO: dado.VEILUCO,
                PLACA: dado.PLACA,
                SERVICO: dado.SERVIÇO ?? 'erro',
                VALOR: dado.VALOR,
                OBS: dado.OBS,
                ...funcionarios,
            };
        });

        const dadosAtualizados: DashboardData = {
            diaMaiorMovimento: calcularDiaMaiorMovimento(dadosPlanilha),
            diaMaiorFaturamento: calcularFaturamento(dadosPlanilha),
            servicosMaisPrestados: servicosMaisPrestados(dadosPlanilha),
            totalPagamentoFuncionarios: totalPorFuncionario(dadosPlanilha),
            modeloMaisLavado: modeloMaisLavado(dadosPlanilha),
            carrosFrequentes: carrosLavadosComFrequencia(dadosPlanilha)
        }

        return dadosAtualizados;
    }

    const limparValorMonetario = (valor: string): number => {
        if (typeof valor === 'string') {
            valor = valor.replace('R$', '').replace(',', '.').trim();
            if (valor === '-' || valor === '') {
                return 0.0;
            } else {
                return parseFloat(valor);
            }
        }
        return 0.0; // Se o valor não for string, assumimos que é um valor inválido ou ausente e atribuímos 0.
    };

    const excelSerialDateToJSDate = (serialDate: number): Date => {
        // Data base do Excel (30 de dezembro de 1899)
        const excelBaseDate = new Date(Date.UTC(1899, 11, 29));

        // Considera o bug do ano bissexto do Excel (bug do dia 60)
        const adjustedSerialDate = serialDate + 1 + ((serialDate > 60) ? 1 : 0);

        // Converter serial para milissegundos
        const jsDate = new Date(excelBaseDate.getTime() + adjustedSerialDate * 86400000);

        return jsDate;
    };

    // 1. Dia de maior movimento
    const calcularDiaMaiorMovimento = (dados: PlanilhaDados[]): { dia: string; quantidade: number } => {
        const diasServicos = new Map<string, number>();

        dados.forEach((item) => {
            const dataServicos = item.DATA;
            const servicos = item.SERVICO.split('+'); // Separando serviços se houver mais de um
            servicos.forEach((servico) => {
                const chave = `${dataServicos}-${servico}`;
                if (diasServicos.has(chave)) {
                    diasServicos.set(chave, diasServicos.get(chave)! + 1);
                } else {
                    diasServicos.set(chave, 1);
                }
            });
        });

        let diaMaiorMovimento: string = '';
        let quantidadeMaiorMovimento: number = 0;

        diasServicos.forEach((quantidade, dia) => {
            if (quantidade > quantidadeMaiorMovimento) {
                quantidadeMaiorMovimento = quantidade;
                diaMaiorMovimento = dia.split('-')[0]; // Obtendo apenas a data do dia
            }
        });

        return { dia: diaMaiorMovimento, quantidade: quantidadeMaiorMovimento };
    }

    // 2. Dia de maior faturamento

    const calcularFaturamento = (dados: PlanilhaDados[]): {
        maiorFaturamento: { dia: string; valor: number };
        menorFaturamento: { dia: string; valor: number };
    } => {
        const faturamentoPorDia: Record<string, number> = {};

        dados.forEach((item) => {
            const data = item.DATA;
            const valor = parseFloat(item.VALOR);
            const obs = item.OBS;

            if (obs !== 'A RECEBER' && !isNaN(valor)) { // Desconsiderar valores a receber e tratar caso o valor não seja um número válido
                faturamentoPorDia[data] = (faturamentoPorDia[data] || 0) + valor;
            }
        });

        let maiorFaturamento: { dia: string; valor: number } = { dia: '', valor: 0 };
        let menorFaturamento: { dia: string; valor: number } = { dia: '', valor: Number.MAX_VALUE };

        Object.entries(faturamentoPorDia).forEach(([dia, valor]) => {
            if (valor > maiorFaturamento.valor) {
                maiorFaturamento = { dia, valor };
            }

            if (valor < menorFaturamento.valor) {
                menorFaturamento = { dia, valor };
            }
        });

        return { maiorFaturamento, menorFaturamento };
    };


    // 3. Serviços mais prestados
    const servicosMaisPrestados = (dados: PlanilhaDados[]): { servico: string; quantidade: number }[] => {
        const servicosContagem: Record<string, number> = {};

        dados.forEach((item) => {
            const servicos = item.SERVICO.split('+');

            servicos.forEach((servico) => {
                if (servicosContagem[servico]) {
                    servicosContagem[servico]++;
                } else {
                    servicosContagem[servico] = 1;
                }
            });
        });

        // Transformar o objeto em um array de objetos
        const servicosArray = Object.entries(servicosContagem).map(([servico, quantidade]) => ({ servico, quantidade }));

        // Ordenar o array pelo número de ocorrências em ordem decrescente
        const topServicos = servicosArray.sort((a, b) => b.quantidade - a.quantidade).slice(0, 4);

        return topServicos;
    }

    // 4. Total a pagar por funcionário
    const totalPorFuncionario = (dadosPlanilha: PlanilhaDados[]): FuncionarioTotal[] => {
        const funcionariosTotais: Record<string, number> = {};

        dadosPlanilha.forEach((dado) => {
            // Itera sobre as chaves do objeto
            Object.keys(dado).forEach((key) => {
                if (
                    key !== 'DATA' &&
                    key !== 'VEILUCO' &&
                    key !== 'PLACA' &&
                    key !== 'SERVICO' &&
                    key !== 'VALOR' &&
                    key !== 'OBS' &&
                    key !== 'CLIENTE'
                ) {

                    const valorNumerico = parseFloat(dado[key] || '0') || 0;
                    funcionariosTotais[key] = (funcionariosTotais[key] || 0) + valorNumerico;
                }
            });
        });
        // Converte o objeto em um array de objetos
        const funcionariosTotaisArray: FuncionarioTotal[] = Object.entries(funcionariosTotais).map(([nome, totalPagar]) => ({
            nome,
            totalPagar,
        }));

        // Ordena o array em ordem decrescente
        const funcionariosTotaisOrdenados = funcionariosTotaisArray.sort((a, b) => b.totalPagar - a.totalPagar);

        return funcionariosTotaisOrdenados;
    };


    // 5. Modelo de carro mais lavado
    const modeloMaisLavado = (dados: PlanilhaDados[]): ModeloProps[] => {
        const modelosContagem: Record<string, number> = {}

        dados.forEach((dado) => {
            const modelo = dado.VEILUCO;

            // Verifica se o modelo existe
            if (modelo) {
                // Incrementa a contagem para o modelo atual
                modelosContagem[modelo] = (modelosContagem[modelo] || 0) + 1;
            }
        });
        const modelosOrdenados = Object.entries(modelosContagem).sort((a, b) => b[1] - a[1]);

        const top5Modelos = modelosOrdenados.slice(0, 5);

        const modProps: ModeloProps[] = top5Modelos.map(([modelo, quantidade]) => ({
            modelo,
            quantidade,
        }));

        return modProps;
    };

    // 6. Carros lavados com frequência
    const carrosLavadosComFrequencia = (dados: PlanilhaDados[]) => {
        const contagemPlacas = dados.reduce<Record<string, { placa: string; modelo: string; quantidade: number }>>(
            (acc, { PLACA, VEILUCO }) => {
                if (PLACA !== 'DRI-1234') {
                    if (!acc[PLACA]) {
                        acc[PLACA] = { placa: PLACA, modelo: VEILUCO, quantidade: 0 };
                    }
                    acc[PLACA].quantidade++;
                }
                return acc;
            }, {}
        );

        const placasFrequentes = Object.values(contagemPlacas).filter(item => item.quantidade > 1);
        return placasFrequentes.sort((a, b) => b.quantidade - a.quantidade).slice(0, 5);
    };

    return (
        <>
            <div className='flex flex-col-reverse md:flex-col gap-y-5 pt-10 pb-10 md:p-0'>
                <div className='mb-5 bg-slate-950 p-4 rounded-md text-white'>
                    <InputFileXlsXlsx onChange={handleFileUpload} />
                </div>
                {dashboardData && (
                    <div className='flex flex-col md:gap-y-4 space-y-2 md:space-y-0'>
                        <div className='md:flex md:flex-row md:gap-x-4 space-y-2 md:space-y-0'>
                            <Card className='min-w-[240px]'>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-white">
                                        Maior Quantidade Serviços
                                    </CardTitle>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        className="h-4 w-4 text-yellow-400"
                                    >
                                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                </CardHeader>
                                <CardContent>
                                    <div className="md:text-2xl font-bold text-yellow-400">Serviços: {dashboardData?.diaMaiorMovimento?.quantidade}</div>
                                    <p className="text-xs text-white">
                                        Dia: {dashboardData?.diaMaiorMovimento?.dia}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className='min-w-[240px]'>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-white">
                                        Maior Faturamento
                                    </CardTitle>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        className="h-4 w-4 text-yellow-400"
                                    >
                                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                </CardHeader>
                                <CardContent>
                                    <div className="md:text-2xl font-bold text-yellow-400">R$ {dashboardData?.diaMaiorFaturamento?.maiorFaturamento?.valor.toFixed(2)}</div>
                                    <p className="text-xs text-white">
                                        Dia: {dashboardData?.diaMaiorFaturamento?.maiorFaturamento?.dia}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className='min-w-[240px]'>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-white">
                                        Menor Faturamento
                                    </CardTitle>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        className="h-4 w-4 text-yellow-400"
                                    >
                                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                </CardHeader>
                                <CardContent>
                                    <div className="md:text-2xl font-bold text-yellow-400">R$ {dashboardData?.diaMaiorFaturamento?.menorFaturamento?.valor.toFixed(2)}</div>
                                    <p className="text-xs text-white">
                                        Dia: {dashboardData?.diaMaiorFaturamento?.menorFaturamento?.dia}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className='md:flex md:flex-row md:gap-x-4 space-y-2 md:space-y-0'>
                            <Card className='min-w-[240px]'>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-white">
                                        TOP 5 Serviços
                                    </CardTitle>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        className="h-4 w-4 text-yellow-400"
                                    >
                                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                </CardHeader>
                                <CardContent>
                                    <div className="md:text-2xl font-semibold text-yellow-400">
                                        <ul>
                                            {dashboardData?.servicosMaisPrestados.map((item, index) => (
                                                <li key={index}>
                                                    {item.quantidade} vezes
                                                    <p className="text-xs text-white">
                                                        {item.servico}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className='min-w-[240px]'>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-white">
                                        Pagamento Colaboradores
                                    </CardTitle>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        className="h-4 w-4 text-yellow-400"
                                    >
                                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                </CardHeader>
                                <CardContent>
                                    <div className="md:text-2xl font-semibold text-yellow-400">
                                        <ul>
                                            {dashboardData?.totalPagamentoFuncionarios.map((funcionario, index) => (
                                                <li key={index}>
                                                    R$ {funcionario.totalPagar.toFixed(2)}
                                                    <p className="text-xs text-white">
                                                        {funcionario.nome}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className='min-w-[240px]'>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-white">
                                        TOP 5 Modelos Frequentes
                                    </CardTitle>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        className="h-4 w-4 text-yellow-400"
                                    >
                                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                </CardHeader>
                                <CardContent>
                                    <div className="md:text-2xl font-semibold text-yellow-400">
                                        <ul>
                                            {dashboardData?.modeloMaisLavado.map((carro, index) => (
                                                <li key={index}>
                                                    {carro.quantidade} vezes
                                                    <p className="text-xs text-white">
                                                        {carro.modelo}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )
                }
            </div>
        </>
    );
};

export default Dashboard;