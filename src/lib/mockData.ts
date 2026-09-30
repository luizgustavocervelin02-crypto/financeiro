// ==============================================================================
// DADOS INICIAIS REALISTAS PARA INÍCIO IMEDIATO
// Permite que o usuário use o app instantaneamente mesmo antes de conectar o Supabase
// ==============================================================================

import { 
  Receita, 
  Despesa, 
  CartaoCredito, 
  CompraParcelada, 
  ContaFutura, 
  Emprestimo, 
  MetaFinanceira, 
  UserProfile 
} from './types';
import { gerarParcelasAutomaticas, getMesAnoAtual } from './financial-engine/calculations';

const mesAtual = getMesAnoAtual();
const agora = new Date();
const ano = agora.getFullYear();
const mes = String(agora.getMonth() + 1).padStart(2, '0');

export const mockProfile: UserProfile = {
  id: 'usr_demo_1',
  nome: 'Luiz Silva',
  email: 'luiz@financeai.com',
  preferencias: {
    moeda: 'BRL',
    tema: 'dark',
    notificacoes_push: true,
    alerta_limite_cartao: 80,
    meta_reserva_meses: 6,
  }
};

export const mockCartoes: CartaoCredito[] = [
  {
    id: 'card_1',
    banco: 'Nubank',
    nome_cartao: 'Nubank Ultravioleta',
    limite: 12000,
    fechamento: 25,
    vencimento: 5,
    cor: '#820ad1',
  },
  {
    id: 'card_2',
    banco: 'Itaú',
    nome_cartao: 'Itaú Black',
    limite: 18000,
    fechamento: 15,
    vencimento: 22,
    cor: '#ec7000',
  }
];

export const mockReceitas: Receita[] = [
  {
    id: 'rec_1',
    descricao: 'Salário Mensal',
    valor: 8500,
    categoria: 'salario',
    data: `${mesAtual}-05`,
    recorrencia: 'mensal',
    status: 'recebido'
  },
  {
    id: 'rec_2',
    descricao: 'Consultoria / Renda Extra',
    valor: 1800,
    categoria: 'renda_extra',
    data: `${mesAtual}-15`,
    recorrencia: 'unica',
    status: 'recebido'
  },
  {
    id: 'rec_3',
    descricao: 'Dividendos e Fundos Imobiliários',
    valor: 420,
    categoria: 'investimentos',
    data: `${mesAtual}-18`,
    recorrencia: 'mensal',
    status: 'recebido'
  }
];

export const mockDespesas: Despesa[] = [
  {
    id: 'desp_1',
    descricao: 'Supermercado Mensal',
    valor: 1250,
    categoria: 'alimentacao',
    data: `${mesAtual}-06`,
    forma_pagamento: 'credito',
    cartao_id: 'card_1',
    status: 'pago'
  },
  {
    id: 'desp_2',
    descricao: 'Combustível Posto Ipiranga',
    valor: 320,
    categoria: 'transporte',
    data: `${mesAtual}-09`,
    forma_pagamento: 'pix',
    status: 'pago'
  },
  {
    id: 'desp_3',
    descricao: 'Restaurante Fim de Semana',
    valor: 240,
    categoria: 'lazer',
    data: `${mesAtual}-12`,
    forma_pagamento: 'debito',
    status: 'pago'
  },
  {
    id: 'desp_4',
    descricao: 'Farmácia & Vitaminas',
    valor: 180,
    categoria: 'saude',
    data: `${mesAtual}-14`,
    forma_pagamento: 'pix',
    status: 'pago'
  }
];

export const mockContasFuturas: ContaFutura[] = [
  {
    id: 'conta_1',
    descricao: 'Internet Fibra 600MB',
    valor: 129.90,
    vencimento_dia: 10,
    data_proximo_vencimento: `${mesAtual}-10`,
    categoria: 'moradia',
    fixa: true,
    status: 'pago'
  },
  {
    id: 'conta_2',
    descricao: 'Energia Elétrica (Enel)',
    valor: 215.40,
    vencimento_dia: 18,
    data_proximo_vencimento: `${mesAtual}-18`,
    categoria: 'moradia',
    fixa: true,
    status: 'pendente'
  },
  {
    id: 'conta_3',
    descricao: 'Condomínio Residencial',
    valor: 680.00,
    vencimento_dia: 20,
    data_proximo_vencimento: `${mesAtual}-20`,
    categoria: 'moradia',
    fixa: true,
    status: 'pendente'
  },
  {
    id: 'conta_4',
    descricao: 'Netflix & Spotify Family',
    valor: 94.80,
    vencimento_dia: 28,
    data_proximo_vencimento: `${mesAtual}-28`,
    categoria: 'assinaturas',
    fixa: true,
    status: 'pendente'
  }
];

// Compras parceladas com geração automática de parcelas
const compraNotebookId = 'comp_1';
const parcelasNotebook = gerarParcelasAutomaticas(compraNotebookId, 6000, 12, `${ano}-01-15`);

const compraCelularId = 'comp_2';
const parcelasCelular = gerarParcelasAutomaticas(compraCelularId, 3200, 8, `${ano}-02-10`);

export const mockComprasParceladas: CompraParcelada[] = [
  {
    id: compraNotebookId,
    descricao: 'Notebook Dell XPS 15',
    valor_total: 6000,
    total_parcelas: 12,
    valor_parcela: 500,
    data_inicio: `${ano}-01-15`,
    cartao_id: 'card_1',
    categoria: 'compras',
    parcelas: parcelasNotebook
  },
  {
    id: compraCelularId,
    descricao: 'Smartphone Samsung Galaxy S24',
    valor_total: 3200,
    total_parcelas: 8,
    valor_parcela: 400,
    data_inicio: `${ano}-02-10`,
    cartao_id: 'card_2',
    categoria: 'compras',
    parcelas: parcelasCelular
  }
];

export const mockEmprestimos: Emprestimo[] = [
  {
    id: 'emp_1',
    banco: 'Banco do Brasil',
    descricao: 'Financiamento Energia Solar',
    valor_contratado: 15000,
    quantidade_parcelas: 24,
    valor_parcela: 785.40,
    taxa_juros: 1.45,
    parcelas_pagas: 9,
    data_inicio: `${ano - 1}-10-01`
  }
];

export const mockMetas: MetaFinanceira[] = [
  {
    id: 'meta_1',
    nome: 'Reserva de Emergência (6 Meses)',
    valor_objetivo: 35000,
    valor_acumulado: 21500,
    prazo: `${ano + 1}-06-30`,
    categoria: 'reserva',
    cor: '#10b981',
    icone: 'shield'
  },
  {
    id: 'meta_2',
    nome: 'Viagem de Férias Europa',
    valor_objetivo: 15000,
    valor_acumulado: 8200,
    prazo: `${ano + 1}-12-15`,
    categoria: 'lazer',
    cor: '#06b6d4',
    icone: 'plane'
  },
  {
    id: 'meta_3',
    nome: 'Troca de Carro / Entrada',
    valor_objetivo: 45000,
    valor_acumulado: 12000,
    prazo: `${ano + 2}-05-01`,
    categoria: 'patrimonio',
    cor: '#8b5cf6',
    icone: 'car'
  }
];
