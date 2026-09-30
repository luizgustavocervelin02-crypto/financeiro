// ==============================================================================
// INDICADORES DE SAÚDE FINANCEIRA (FASE 2)
// Avalia saúde financeira com métricas bancárias e recomendações
// ==============================================================================

import { IndicadoresSaudeFinanceira, ResumoFinanceiroGeral } from '../types';

export function calcularSaudeFinanceira(resumo: ResumoFinanceiroGeral): IndicadoresSaudeFinanceira {
  const renda = Math.max(1, resumo.totalReceitasMes);
  const despesasTotais = resumo.totalDespesasMes + resumo.contasProximasTotal + resumo.faturaCartoesTotal;
  
  // 1. Comprometimento de Renda (%)
  const comprometimento_renda = Math.min(100, Math.round((despesasTotais / renda) * 100));

  // 2. Capacidade de Poupança (%)
  const sobra = Math.max(0, renda - despesasTotais);
  const capacidade_poupanca = Math.min(100, Math.round((sobra / renda) * 100));

  // 3. Nível de Endividamento (%) = Compromissos futuros / Renda anual aproximada
  const rendaAnualEstimada = renda * 12;
  const dividasTotais = resumo.compromissosFuturosTotal + resumo.totalDividaEmprestimos;
  const nivel_endividamento = Math.min(100, Math.round((dividasTotais / rendaAnualEstimada) * 100));

  // 4. Cobertura da Reserva em meses
  const gastoMedio = Math.max(1, despesasTotais);
  const cobertura_reserva_meses = Number((resumo.saldoAtual / gastoMedio).toFixed(1));

  // 5. Cálculo do Score Geral de 0 a 100
  let score = 100;

  // Penalidade de comprometimento (ideal <= 60%)
  if (comprometimento_renda > 85) score -= 35;
  else if (comprometimento_renda > 70) score -= 25;
  else if (comprometimento_renda > 60) score -= 15;

  // Recompensa de poupança (ideal >= 20%)
  if (capacidade_poupanca < 5) score -= 25;
  else if (capacidade_poupanca < 15) score -= 10;
  else if (capacidade_poupanca >= 25) score += 5;

  // Penalidade de endividamento
  if (nivel_endividamento > 60) score -= 30;
  else if (nivel_endividamento > 35) score -= 15;
  else if (nivel_endividamento > 20) score -= 5;

  // Reserva de emergência
  if (cobertura_reserva_meses < 1) score -= 20;
  else if (cobertura_reserva_meses < 3) score -= 10;
  else if (cobertura_reserva_meses >= 6) score += 10;

  score = Math.max(10, Math.min(100, score));

  // Classificação
  let classificacao: 'Excelente' | 'Boa' | 'Atenção' | 'Crítica' = 'Boa';
  if (score >= 85) classificacao = 'Excelente';
  else if (score >= 70) classificacao = 'Boa';
  else if (score >= 50) classificacao = 'Atenção';
  else classificacao = 'Crítica';

  // Diagnósticos
  const pontos_fortes: string[] = [];
  const pontos_melhoria: string[] = [];
  const dicas_ia: string[] = [];

  if (capacidade_poupanca >= 20) {
    pontos_fortes.push(`Excelente taxa de poupança de ${capacidade_poupanca}%, superando a média nacional.`);
  }
  if (comprometimento_renda <= 60) {
    pontos_fortes.push(`Orçamento equilibrado com apenas ${comprometimento_renda}% da renda comprometida.`);
  }
  if (cobertura_reserva_meses >= 6) {
    pontos_fortes.push(`Reserva sólida cobrindo ${cobertura_reserva_meses} meses de custo de vida.`);
  }
  if (nivel_endividamento < 15) {
    pontos_fortes.push('Baixo endividamento futuro em empréstimos e parcelamentos.');
  }

  if (comprometimento_renda > 70) {
    pontos_melhoria.push(`Seus gastos consom ${comprometimento_renda}% da receita, deixando margem de segurança perigosa.`);
    dicas_ia.push('Revise assinaturas e gastos de lazer este mês para recuperar pelo menos 10% de folga.');
  }
  if (cobertura_reserva_meses < 3) {
    pontos_melhoria.push(`Reserva de emergência atual cobre menos de 3 meses de despesas (${cobertura_reserva_meses} meses).`);
    dicas_ia.push('Priorize direcionar sobras do mês para a reserva de emergência antes de novos investimentos de risco.');
  }
  if (nivel_endividamento > 35) {
    pontos_melhoria.push(`Dívidas e parcelas futuras representam ${nivel_endividamento}% da sua capacidade anual.`);
    dicas_ia.push('Concentre pagamentos extras para amortizar os empréstimos com taxas de juros mais altas.');
  }

  if (pontos_fortes.length === 0) {
    pontos_fortes.push('Controle financeiro ativo sendo alimentado regularmente.');
  }
  if (pontos_melhoria.length === 0) {
    pontos_melhoria.push('Mantenha o bom hábito de monitorar faturas e manter a consistência de investimentos.');
  }
  if (dicas_ia.length === 0) {
    dicas_ia.push('Seu perfil atual permite acelerar aportes nas metas de longo prazo!');
  }

  return {
    score,
    classificacao,
    comprometimento_renda,
    capacidade_poupanca,
    nivel_endividamento,
    cobertura_reserva_meses,
    pontos_fortes,
    pontos_melhoria,
    dicas_ia,
  };
}
