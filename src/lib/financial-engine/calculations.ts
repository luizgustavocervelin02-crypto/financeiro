// ==============================================================================
// REGRAS FINANCEIRAS SEPARADAS DO FRONTEND
// Motor central de cálculos do Finance AI
// ==============================================================================

import { 
  Receita, 
  Despesa, 
  CartaoCredito, 
  CompraParcelada, 
  Parcela, 
  ContaFutura, 
  Emprestimo, 
  MetaFinanceira,
  ResumoFinanceiroGeral
} from '../types';

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0);
}

export function formatarPorcentagem(valor: number): string {
  return `${(valor || 0).toFixed(1)}%`;
}

export function getMesAnoAtual(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  return `${ano}-${mes}`;
}

export function formatarDataBR(dataIso: string): string {
  if (!dataIso) return '';
  const [ano, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}/${ano}`;
}

/**
 * Gera automaticamente as parcelas de uma compra dividida em N vezes
 * Exemplo: Notebook R$ 6.000 em 12x -> Gera 12 parcelas de R$ 500 para os próximos meses
 */
export function gerarParcelasAutomaticas(
  compraId: string,
  valorTotal: number,
  totalParcelas: number,
  dataInicio: string
): Parcela[] {
  const parcelas: Parcela[] = [];
  const valorBase = Math.floor((valorTotal / totalParcelas) * 100) / 100;
  const diferencaCentavos = Math.round((valorTotal - (valorBase * totalParcelas)) * 100) / 100;

  const dataBase = new Date(dataInicio + 'T12:00:00');

  for (let i = 1; i <= totalParcelas; i++) {
    // Adiciona meses sucessivos
    const dataVenc = new Date(dataBase);
    dataVenc.setMonth(dataBase.getMonth() + (i - 1));

    const ano = dataVenc.getFullYear();
    const mes = String(dataVenc.getMonth() + 1).padStart(2, '0');
    const dia = String(dataVenc.getDate()).padStart(2, '0');
    const mesReferencia = `${ano}-${mes}`;
    const dataFormatada = `${ano}-${mes}-${dia}`;

    // A primeira parcela absorve qualquer arredondamento de centavos
    const valorParcela = i === 1 ? Number((valorBase + diferencaCentavos).toFixed(2)) : valorBase;

    parcelas.push({
      id: `parc_${compraId}_${i}_${Date.now()}`,
      compra_id: compraId,
      numero_parcela: i,
      valor: valorParcela,
      mes_referencia: mesReferencia,
      data_vencimento: dataFormatada,
      status: 'pendente',
    });
  }

  return parcelas;
}

/**
 * Calcula a fatura atual e limites de um cartão de crédito
 */
export function calcularMetricasCartao(
  cartao: CartaoCredito,
  despesas: Despesa[],
  parcelas: Parcela[]
): {
  faturaAtual: number;
  limiteUtilizado: number;
  limiteDisponivel: number;
  percentualUtilizado: number;
} {
  const mesAtual = getMesAnoAtual();

  // Despesas avulsas no cartão deste mês que não vieram de parcelamento
  const despesasCartaoMes = despesas
    .filter(d => d.cartao_id === cartao.id && d.forma_pagamento === 'credito' && d.data.startsWith(mesAtual))
    .reduce((sum, d) => sum + d.valor, 0);

  // Parcelas do cartão deste mês
  const parcelasCartaoMes = parcelas
    .filter(p => p.mes_referencia === mesAtual && p.status === 'pendente')
    .reduce((sum, p) => sum + p.valor, 0);

  const faturaAtual = despesasCartaoMes + parcelasCartaoMes;

  // Limite utilizado total considera todas as parcelas futuras ainda pendentes
  const totalParcelasFuturas = parcelas
    .filter(p => p.status === 'pendente')
    .reduce((sum, p) => sum + p.valor, 0);

  const limiteUtilizado = Math.min(cartao.limite, faturaAtual + (totalParcelasFuturas > faturaAtual ? totalParcelasFuturas - parcelasCartaoMes : 0));
  const limiteDisponivel = Math.max(0, cartao.limite - limiteUtilizado);
  const percentualUtilizado = cartao.limite > 0 ? (limiteUtilizado / cartao.limite) * 100 : 0;

  return {
    faturaAtual,
    limiteUtilizado,
    limiteDisponivel,
    percentualUtilizado,
  };
}

/**
 * Calcula métricas do empréstimo:
 * - parcelas restantes
 * - dívida atual restante
 * - valor futuro total comprometido
 */
export function calcularMetricasEmprestimo(emp: Emprestimo): {
  parcelasRestantes: number;
  dividaAtual: number;
  valorTotalContrato: number;
  progressoQuitacao: number;
} {
  const parcelasRestantes = Math.max(0, emp.quantidade_parcelas - emp.parcelas_pagas);
  const dividaAtual = parcelasRestantes * emp.valor_parcela;
  const valorTotalContrato = emp.quantidade_parcelas * emp.valor_parcela;
  const progressoQuitacao = emp.quantidade_parcelas > 0 
    ? (emp.parcelas_pagas / emp.quantidade_parcelas) * 100 
    : 0;

  return {
    parcelasRestantes,
    dividaAtual,
    valorTotalContrato,
    progressoQuitacao,
  };
}

/**
 * Calcula o Resumo Geral Financeiro para o Dashboard
 */
export function calcularResumoGeral(
  receitas: Receita[],
  despesas: Despesa[],
  contasFuturas: ContaFutura[],
  cartoes: CartaoCredito[],
  comprasParceladas: CompraParcelada[],
  emprestimos: Emprestimo[],
  metas: MetaFinanceira[]
): ResumoFinanceiroGeral {
  const mesAtual = getMesAnoAtual();

  // 1. Receitas do mês
  const totalReceitasMes = receitas
    .filter(r => r.data.startsWith(mesAtual))
    .reduce((sum, r) => sum + r.valor, 0);

  // 2. Despesas pagas do mês
  const totalDespesasMes = despesas
    .filter(d => d.data.startsWith(mesAtual) && d.status === 'pago')
    .reduce((sum, d) => sum + d.valor, 0);

  // 3. Contas futuras pendentes do mês atual
  const hoje = new Date();
  const contasProximasTotal = contasFuturas
    .filter(c => c.status === 'pendente')
    .reduce((sum, c) => sum + c.valor, 0);

  // 4. Todas as parcelas de todas as compras parceladas
  const todasParcelas = comprasParceladas.flatMap(c => c.parcelas || []);

  // 5. Total de faturas dos cartões
  const faturaCartoesTotal = cartoes.reduce((sum, cartao) => {
    const metrica = calcularMetricasCartao(cartao, despesas, todasParcelas);
    return sum + metrica.faturaAtual;
  }, 0);

  // 6. Parcelas de empréstimos do mês
  const parcelasEmprestimosMes = emprestimos.reduce((sum, emp) => {
    const met = calcularMetricasEmprestimo(emp);
    return sum + (met.parcelasRestantes > 0 ? emp.valor_parcela : 0);
  }, 0);

  // 7. Compromissos futuros (soma de todas as parcelas pendentes dos próximos meses + dívidas de empréstimo)
  const parcelasFuturasRestantes = todasParcelas
    .filter(p => p.status === 'pendente')
    .reduce((sum, p) => sum + p.valor, 0);

  const totalDividaEmprestimos = emprestimos.reduce((sum, emp) => {
    const met = calcularMetricasEmprestimo(emp);
    return sum + met.dividaAtual;
  }, 0);

  const compromissosFuturosTotal = parcelasFuturasRestantes + totalDividaEmprestimos;

  // 8. Saldo Atual = Receitas Totais Históricas - Despesas Totais Históricas
  const receitasHistoricas = receitas.reduce((sum, r) => sum + (r.status === 'recebido' ? r.valor : 0), 0);
  const despesasHistoricas = despesas.reduce((sum, d) => sum + (d.status === 'pago' ? d.valor : 0), 0);
  const saldoAtual = Math.max(0, receitasHistoricas - despesasHistoricas);

  // 9. Valor Disponível neste mês (Receitas do mês - despesas pagas - contas a pagar - faturas de cartão do mês - empréstimos)
  const saidasPrevistasMes = totalDespesasMes + contasProximasTotal + faturaCartoesTotal + parcelasEmprestimosMes;
  const valorDisponivel = totalReceitasMes - saidasPrevistasMes;

  // 10. Total acumulado em metas
  const totalMetasAcumulado = metas.reduce((sum, m) => sum + m.valor_acumulado, 0);

  // 11. Taxa de poupança do mês (%)
  const taxaPoupancaMes = totalReceitasMes > 0 
    ? Math.max(0, ((totalReceitasMes - (totalDespesasMes + contasProximasTotal + faturaCartoesTotal)) / totalReceitasMes) * 100)
    : 0;

  return {
    saldoAtual,
    totalReceitasMes,
    totalDespesasMes,
    valorDisponivel,
    faturaCartoesTotal,
    contasProximasTotal,
    compromissosFuturosTotal,
    totalDividaEmprestimos,
    totalMetasAcumulado,
    taxaPoupancaMes,
  };
}
