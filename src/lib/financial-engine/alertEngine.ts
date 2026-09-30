// ==============================================================================
// MOTOR DE ALERTAS INTELIGENTES (FASE 3)
// Gera notificações preventivas e sugestões automáticas
// ==============================================================================

import { 
  Notificacao, 
  CartaoCredito, 
  ContaFutura, 
  MetaFinanceira, 
  Despesa, 
  ResumoFinanceiroGeral,
  Parcela
} from '../types';
import { calcularMetricasCartao, formatarMoeda } from './calculations';

export function gerarAlertasInteligentes(
  resumo: ResumoFinanceiroGeral,
  cartoes: CartaoCredito[],
  contas: ContaFutura[],
  metas: MetaFinanceira[],
  despesas: Despesa[],
  todasParcelas: Parcela[],
  limiteAlertaCartao: number = 80
): Notificacao[] {
  const notificacoes: Notificacao[] = [];
  const hoje = new Date();
  const diaHoje = hoje.getDate();
  const agoraIso = hoje.toISOString().split('T')[0];

  // 1. Alerta de Limite de Cartão de Crédito
  cartoes.forEach(cartao => {
    const metricas = calcularMetricasCartao(cartao, despesas, todasParcelas);
    if (metricas.percentualUtilizado >= limiteAlertaCartao) {
      notificacoes.push({
        id: `alert_card_${cartao.id}_${agoraIso}`,
        titulo: `Limite do Cartão ${cartao.nome_cartao}`,
        mensagem: `Você já utilizou ${metricas.percentualUtilizado.toFixed(0)}% do limite (${formatarMoeda(metricas.limiteUtilizado)} de ${formatarMoeda(cartao.limite)}). Restam ${formatarMoeda(metricas.limiteDisponivel)}.`,
        tipo: metricas.percentualUtilizado >= 95 ? 'urgente' : 'alerta',
        data: agoraIso,
        lida: false,
        link: '/cartoes',
      });
    }
  });

  // 2. Alerta de Contas Próximas do Vencimento (próximos 3 a 5 dias)
  contas.forEach(conta => {
    if (conta.status === 'pendente') {
      const diasRestantes = conta.vencimento_dia - diaHoje;
      if (diasRestantes >= 0 && diasRestantes <= 3) {
        const quando = diasRestantes === 0 ? 'vence HOJE' : diasRestantes === 1 ? 'vence AMANHÃ' : `vence em ${diasRestantes} dias`;
        notificacoes.push({
          id: `alert_conta_${conta.id}_${agoraIso}`,
          titulo: `Conta Próxima: ${conta.descricao}`,
          mensagem: `A conta "${conta.descricao}" no valor de ${formatarMoeda(conta.valor)} ${quando}.`,
          tipo: diasRestantes <= 1 ? 'urgente' : 'alerta',
          data: agoraIso,
          lida: false,
          link: '/contas',
        });
      }
    }
  });

  // 3. Alerta de Comprometimento de Renda Excessivo
  if (resumo.totalReceitasMes > 0) {
    const despesasPrevistas = resumo.totalDespesasMes + resumo.contasProximasTotal + resumo.faturaCartoesTotal;
    const taxaComprometimento = (despesasPrevistas / resumo.totalReceitasMes) * 100;
    
    if (taxaComprometimento > 80) {
      notificacoes.push({
        id: `alert_budget_${agoraIso}`,
        titulo: 'Atenção ao Orçamento do Mês',
        mensagem: `Suas despesas e faturas já somam ${taxaComprometimento.toFixed(0)}% da sua renda. Evite novas compras parceladas este mês.`,
        tipo: 'urgente',
        data: agoraIso,
        lida: false,
        link: '/saude-financeira',
      });
    }
  }

  // 4. Alerta de Metas Financeiras (se estiver perto do prazo e com pouco progresso)
  metas.forEach(meta => {
    const dataPrazo = new Date(meta.prazo + 'T12:00:00');
    const diffMeses = (dataPrazo.getFullYear() - hoje.getFullYear()) * 12 + (dataPrazo.getMonth() - hoje.getMonth());
    const percConcluido = meta.valor_objetivo > 0 ? (meta.valor_acumulado / meta.valor_objetivo) * 100 : 0;

    if (diffMeses <= 3 && percConcluido < 60) {
      notificacoes.push({
        id: `alert_meta_${meta.id}_${agoraIso}`,
        titulo: `Meta em Risco: ${meta.nome}`,
        mensagem: `O prazo da meta "${meta.nome}" termina em ${Math.max(1, diffMeses)} meses e você atingiu apenas ${percConcluido.toFixed(0)}%. Considere reforçar os aportes.`,
        tipo: 'alerta',
        data: agoraIso,
        lida: false,
        link: '/metas',
      });
    } else if (percConcluido >= 100) {
      notificacoes.push({
        id: `congrats_meta_${meta.id}_${agoraIso}`,
        titulo: `🎉 Parabéns! Meta Concluída`,
        mensagem: `Você atingiu 100% da meta "${meta.nome}" (${formatarMoeda(meta.valor_acumulado)})!`,
        tipo: 'sucesso',
        data: agoraIso,
        lida: false,
        link: '/metas',
      });
    }
  });

  return notificacoes;
}
