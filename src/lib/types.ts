// ==============================================================================
// FINANCE AI - MODELOS E TIPOS TYPESCRIPT
// Suporte completo às 3 fases
// ==============================================================================

export type FormaPagamento = 'pix' | 'dinheiro' | 'debito' | 'credito' | 'transferencia' | 'boleto';

export type CategoriaDespesa = 
  | 'alimentacao'
  | 'transporte'
  | 'moradia'
  | 'lazer'
  | 'saude'
  | 'compras'
  | 'assinaturas'
  | 'educacao'
  | 'outros';

export type CategoriaReceita = 
  | 'salario'
  | 'renda_extra'
  | 'investimentos'
  | 'outros';

export type Recorrencia = 'unica' | 'mensal' | 'anual';

export type StatusPagamento = 'pago' | 'pendente';

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  preferencias: {
    moeda: string;
    tema: 'dark' | 'light' | 'system';
    notificacoes_push: boolean;
    alerta_limite_cartao: number; // Porcentagem (ex: 80%)
    meta_reserva_meses: number;
    geminiApiKey?: string;
  };
}

export interface Receita {
  id: string;
  descricao: string;
  valor: number;
  categoria: CategoriaReceita;
  data: string; // YYYY-MM-DD
  recorrencia: Recorrencia;
  status: 'recebido' | 'pendente';
  user_id?: string;
}

export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  categoria: CategoriaDespesa;
  data: string; // YYYY-MM-DD
  forma_pagamento: FormaPagamento;
  cartao_id?: string;
  status: StatusPagamento;
  parcela_origem_id?: string;
  user_id?: string;
}

export interface CartaoCredito {
  id: string;
  banco: string;
  nome_cartao: string;
  limite: number;
  fechamento: number; // Dia 1 a 31
  vencimento: number; // Dia 1 a 31
  cor: string;
  fatura_atual?: number;
  user_id?: string;
}

export interface Parcela {
  id: string;
  compra_id: string;
  numero_parcela: number;
  valor: number;
  mes_referencia: string; // YYYY-MM
  data_vencimento: string; // YYYY-MM-DD
  status: StatusPagamento;
  user_id?: string;
}

export interface CompraParcelada {
  id: string;
  descricao: string;
  valor_total: number;
  total_parcelas: number;
  valor_parcela: number;
  data_inicio: string; // YYYY-MM-DD
  cartao_id?: string;
  categoria: CategoriaDespesa;
  parcelas?: Parcela[];
  user_id?: string;
}

export interface ContaFutura {
  id: string;
  descricao: string;
  valor: number;
  vencimento_dia: number; // Dia 1 a 31
  data_proximo_vencimento: string; // YYYY-MM-DD
  categoria: CategoriaDespesa;
  fixa: boolean;
  status: StatusPagamento;
  user_id?: string;
}

export interface Emprestimo {
  id: string;
  banco: string;
  descricao?: string;
  valor_contratado: number;
  quantidade_parcelas: number;
  valor_parcela: number;
  taxa_juros: number; // Porcentagem ao mês
  parcelas_pagas: number;
  data_inicio: string; // YYYY-MM-DD
  user_id?: string;
}

export interface MetaFinanceira {
  id: string;
  nome: string;
  valor_objetivo: number;
  valor_acumulado: number;
  prazo: string; // YYYY-MM-DD
  categoria: string;
  cor: string;
  icone?: string;
  user_id?: string;
}

export type TipoNotificacao = 'info' | 'alerta' | 'urgente' | 'ia_insight' | 'sucesso';

export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: TipoNotificacao;
  data: string;
  lida: boolean;
  link?: string;
  user_id?: string;
}

// Interfaces para IA e Simulações (Fase 2)
export interface SimulacaoCompraInput {
  descricao: string;
  valor: number;
  tipo_pagamento: 'a_vista' | 'parcelado';
  parcelas?: number;
  cartao_id?: string;
  categoria: CategoriaDespesa;
}

export interface ResultadoSimulacao {
  viavel: boolean;
  pontuacao_impacto: 'baixo' | 'moderado' | 'alto' | 'critico';
  impacto_saldo_imediato: number;
  impacto_mensal: number;
  novo_comprometimento_renda: number; // %
  meses_para_recuperar: number;
  impacto_metas: string[];
  recomendacao_ia: string;
  comparativo: {
    a_vista: {
      valor: number;
      desconto_possivel?: number;
      saldo_apos_compra: number;
    };
    parcelado: {
      parcelas: number;
      valor_parcela: number;
      total_a_pagar: number;
      comprometimento_futuro_meses: number;
    };
  };
}

export interface IndicadoresSaudeFinanceira {
  score: number; // 0 a 100
  classificacao: 'Excelente' | 'Boa' | 'Atenção' | 'Crítica';
  comprometimento_renda: number; // % da renda gasta com contas essenciais e dívidas
  capacidade_poupanca: number; // % da renda que sobra
  nivel_endividamento: number; // % total dívidas / patrimônio ou renda
  cobertura_reserva_meses: number;
  pontos_fortes: string[];
  pontos_melhoria: string[];
  dicas_ia: string[];
}

export interface ResumoFinanceiroGeral {
  saldoAtual: number;
  totalReceitasMes: number;
  totalDespesasMes: number;
  valorDisponivel: number;
  faturaCartoesTotal: number;
  contasProximasTotal: number;
  compromissosFuturosTotal: number;
  totalDividaEmprestimos: number;
  totalMetasAcumulado: number;
  taxaPoupancaMes: number;
}
