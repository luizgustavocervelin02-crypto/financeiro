// ==============================================================================
// MOTOR DE SIMULAÇÃO "ANTES DE COMPRAR" (FASE 2)
// Analisa impacto financeiro antes de tomar decisão de compra
// ==============================================================================

import { 
  SimulacaoCompraInput, 
  ResultadoSimulacao, 
  ResumoFinanceiroGeral, 
  MetaFinanceira,
  CartaoCredito
} from '../types';
import { formatarMoeda } from './calculations';

export function simularCompra(
  input: SimulacaoCompraInput,
  resumo: ResumoFinanceiroGeral,
  metas: MetaFinanceira[],
  cartaoSelecionado?: CartaoCredito
): ResultadoSimulacao {
  const { valor, tipo_pagamento, parcelas = 1, descricao } = input;
  const numParcelas = Math.max(1, parcelas);
  const valorParcela = Math.round((valor / numParcelas) * 100) / 100;

  // 1. Impacto no Saldo Imediato
  const impactoSaldoImediato = tipo_pagamento === 'a_vista' ? valor : valorParcela;
  const saldoAposCompraAVista = resumo.saldoAtual - valor;

  // 2. Impacto Mensal no Fluxo de Caixa
  const impactoMensal = tipo_pagamento === 'a_vista' ? valor : valorParcela;

  // 3. Novo comprometimento da renda mensal
  const despesaAtualPrevista = resumo.totalDespesasMes + resumo.contasProximasTotal + resumo.faturaCartoesTotal;
  const novaDespesaPrevista = despesaAtualPrevista + impactoMensal;
  const novoComprometimento = resumo.totalReceitasMes > 0 
    ? (novaDespesaPrevista / resumo.totalReceitasMes) * 100 
    : 100;

  // 4. Meses para recuperar caso seja à vista
  const sobraMediaMensal = Math.max(100, resumo.valorDisponivel);
  const mesesParaRecuperar = tipo_pagamento === 'a_vista' 
    ? Math.ceil(valor / sobraMediaMensal) 
    : numParcelas;

  // 5. Impacto nas metas financeiras
  const impactoMetas: string[] = [];
  metas.forEach(meta => {
    const restanteMeta = meta.valor_objetivo - meta.valor_acumulado;
    if (restanteMeta > 0) {
      if (tipo_pagamento === 'a_vista' && valor > resumo.saldoAtual * 0.4) {
        impactoMetas.push(`Pode atrasar o alcance de "${meta.nome}" em até ${mesesParaRecuperar} meses.`);
      } else if (tipo_pagamento === 'parcelado' && valorParcela > sobraMediaMensal * 0.3) {
        impactoMetas.push(`A parcela de ${formatarMoeda(valorParcela)} reduz o aporte mensal na meta "${meta.nome}".`);
      }
    }
  });

  if (impactoMetas.length === 0) {
    impactoMetas.push('Nenhuma meta em andamento será severamente comprometida.');
  }

  // 6. Avaliação de Viabilidade e Nível de Impacto
  let viavel = true;
  let pontuacao_impacto: 'baixo' | 'moderado' | 'alto' | 'critico' = 'baixo';
  let recomendacao_ia = '';

  if (tipo_pagamento === 'a_vista') {
    if (valor > resumo.saldoAtual) {
      viavel = false;
      pontuacao_impacto = 'critico';
      recomendacao_ia = `🚨 Alerta: Seu saldo atual é de ${formatarMoeda(resumo.saldoAtual)}. Você não possui saldo suficiente para pagar ${formatarMoeda(valor)} à vista sem entrar no cheque especial.`;
    } else if (valor > resumo.saldoAtual * 0.7) {
      pontuacao_impacto = 'alto';
      recomendacao_ia = `⚠️ Atenção: Esta compra consome mais de 70% da sua reserva imediata. Se não for essencial, considere adiar ou negociar desconto substancial para pagamento à vista.`;
    } else if (valor > resumo.saldoAtual * 0.3) {
      pontuacao_impacto = 'moderado';
      recomendacao_ia = `💡 Viável com cautela: O impacto é moderado. Se pagar à vista, certifique-se de obter no mínimo 5% a 10% de desconto para compensar a perda de liquidez.`;
    } else {
      pontuacao_impacto = 'baixo';
      recomendacao_ia = `✅ Compra recomendada à vista! O valor consome menos de 30% da sua liquidez e não compromete seu fluxo dos próximos meses.`;
    }
  } else {
    // Pagamento Parcelado
    const sobraAposParcela = resumo.valorDisponivel - valorParcela;

    if (cartaoSelecionado && (cartaoSelecionado.limite - (cartaoSelecionado.fatura_atual || 0)) < valor) {
      viavel = false;
      pontuacao_impacto = 'critico';
      recomendacao_ia = `🚨 Limite insuficiente: O cartão ${cartaoSelecionado.nome_cartao} possui limite disponível inferior a ${formatarMoeda(valor)}.`;
    } else if (sobraAposParcela < 0) {
      viavel = false;
      pontuacao_impacto = 'critico';
      recomendacao_ia = `🚨 Fluxo negativo: A parcela de ${formatarMoeda(valorParcela)} deixará seu orçamento mensal no vermelho em ${formatarMoeda(Math.abs(sobraAposParcela))}. Não parcele agora.`;
    } else if (novoComprometimento > 70) {
      pontuacao_impacto = 'alto';
      recomendacao_ia = `⚠️ Comprometimento elevado: Com esta parcela, ${novoComprometimento.toFixed(0)}% da sua renda estará engessada por ${numParcelas} meses. Cuidado com novos imprevistos.`;
    } else if (novoComprometimento > 50) {
      pontuacao_impacto = 'moderado';
      recomendacao_ia = `💡 Parcelamento viável, mas mantenha controle estrito sobre novos gastos com cartão até ${numParcelas} meses passarem.`;
    } else {
      pontuacao_impacto = 'baixo';
      recomendacao_ia = `✅ Parcelamento sem juros seguro! A parcela de ${formatarMoeda(valorParcela)} cabe confortavelmente dentro da sua folga financeira mensal.`;
    }
  }

  return {
    viavel,
    pontuacao_impacto,
    impacto_saldo_imediato: impactoSaldoImediato,
    impacto_mensal: impactoMensal,
    novo_comprometimento_renda: Math.min(100, novoComprometimento),
    meses_para_recuperar: mesesParaRecuperar,
    impacto_metas: impactoMetas,
    recomendacao_ia,
    comparativo: {
      a_vista: {
        valor,
        desconto_possivel: Number((valor * 0.05).toFixed(2)), // 5% de desconto de referência
        saldo_apos_compra: saldoAposCompraAVista,
      },
      parcelado: {
        parcelas: numParcelas,
        valor_parcela: valorParcela,
        total_a_pagar: valor,
        comprometimento_futuro_meses: numParcelas,
      }
    }
  };
}
