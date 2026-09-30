// ==============================================================================
// CLIENTE GEMINI AI & COPILOTO FINANCEIRO (FASE 2)
// Integração inteligente para responder dúvidas financeiras com contexto real
// ==============================================================================

import { ResumoFinanceiroGeral, IndicadoresSaudeFinanceira, MetaFinanceira, CompraParcelada, Emprestimo } from '../types';
import { formatarMoeda } from '../financial-engine/calculations';

export interface ContextoFinanceiroIA {
  resumo: ResumoFinanceiroGeral;
  saude: IndicadoresSaudeFinanceira;
  metas: MetaFinanceira[];
  comprasParceladas: CompraParcelada[];
  emprestimos: Emprestimo[];
}

export function gerarPromptSistema(ctx: ContextoFinanceiroIA): string {
  const { resumo, saude, metas, emprestimos, comprasParceladas } = ctx;

  const listaMetas = metas.map(m => `- ${m.nome}: ${formatarMoeda(m.valor_acumulado)} de ${formatarMoeda(m.valor_objetivo)} (Prazo: ${m.prazo})`).join('\n') || 'Nenhuma meta cadastrada';
  const listaEmprestimos = emprestimos.map(e => `- ${e.banco}: Parcela ${formatarMoeda(e.valor_parcela)}, ${e.parcelas_pagas}/${e.quantidade_parcelas} pagas, taxa ${e.taxa_juros}% a.m.`).join('\n') || 'Nenhum empréstimo ativo';
  const listaParcelamentos = comprasParceladas.map(c => `- ${c.descricao}: ${c.total_parcelas}x de ${formatarMoeda(c.valor_parcela)} (Total: ${formatarMoeda(c.valor_total)})`).join('\n') || 'Nenhum parcelamento ativo';

  return `Você é o "Finance AI", um consultor e copiloto financeiro pessoal inteligente, empático, direto e altamente analítico.
Seu objetivo é ajudar o usuário a tomar as melhores decisões financeiras, proteger seu patrimônio, evitar endividamento tóxico e atingir suas metas.

DADOS FINANCEIROS ATUAIS DO USUÁRIO (Calculados pelo Backend):
- Saldo em Conta/Liquidez: ${formatarMoeda(resumo.saldoAtual)}
- Receitas Mensais: ${formatarMoeda(resumo.totalReceitasMes)}
- Despesas Mensais Pagas: ${formatarMoeda(resumo.totalDespesasMes)}
- Faturas de Cartão de Crédito do Mês: ${formatarMoeda(resumo.faturaCartoesTotal)}
- Contas Fixas Pendentes do Mês: ${formatarMoeda(resumo.contasProximasTotal)}
- Valor Efetivamente Disponível / Sobra no Mês: ${formatarMoeda(resumo.valorDisponivel)}
- Compromissos Futuros (Parcelas + Dívidas): ${formatarMoeda(resumo.compromissosFuturosTotal)}
- Dívida Total de Empréstimos: ${formatarMoeda(resumo.totalDividaEmprestimos)}
- Score de Saúde Financeira: ${saude.score}/100 (${saude.classificacao})
- Comprometimento de Renda: ${saude.comprometimento_renda}%
- Capacidade de Poupança: ${saude.capacidade_poupanca}%
- Cobertura da Reserva: ${saude.cobertura_reserva_meses} meses

METAS FINANCEIRAS DO USUÁRIO:
${listaMetas}

EMPRÉSTIMOS ATIVOS:
${listaEmprestimos}

COMPRAS PARCELADAS ATIVAS:
${listaParcelamentos}

DIRETRIZES PARA SUAS RESPOSTAS:
1. Seja prático, direto ao ponto e focado na realidade financeira do usuário.
2. Utilize formatação clara com tópicos (bullet points), valores em Reais (R$) e negrito para destacar valores e conclusões.
3. Se o usuário perguntar "Posso comprar X?": analise o impacto na liquidez, no comprometimento de renda e nas metas. Diga claramente "Sim, pode comprar" ou "Não recomendo agora" com a justificativa matemática.
4. Se o usuário recebeu dinheiro extra (ex: R$ 5.000): priorize a ordem financeira inteligente brasileira: (1) Reserva de emergência mínima (3-6 meses), (2) Amortização de dívidas com juros altos (empréstimos/cheque/rotativo), (3) Metas de curto prazo, (4) Investimentos.
5. Se o usuário perguntar como reduzir gastos ou quando atinge metas, forneça datas estimadas e planos de ação passo a passo.
`;
}

export async function consultarGeminiIA(
  pergunta: string,
  contexto: ContextoFinanceiroIA,
  apiKeyCustomizada?: string
): Promise<string> {
  const apiKey = apiKeyCustomizada || process.env.GEMINI_API_KEY || '';

  // Se a chave Gemini estiver configurada, chamamos a API oficial
  if (apiKey && apiKey.length > 10 && !apiKey.includes('sua-chave')) {
    try {
      const systemPrompt = gerarPromptSistema(contexto);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nPERGUNTA DO USUÁRIO:\n${pergunta}` }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (texto) return texto;
      }
    } catch (err) {
      console.warn('Erro ao consultar API Gemini, utilizando motor analítico local:', err);
    }
  }

  // Fallback Inteligente / Motor Analítico Local (quando não há API Key ou offline)
  return gerarRespostaAnaliticaLocal(pergunta, contexto);
}

/**
 * Motor heurístico inteligente que analisa com precisão matemática caso a API Key não esteja cadastrada
 */
function gerarRespostaAnaliticaLocal(pergunta: string, ctx: ContextoFinanceiroIA): string {
  const { resumo, saude, metas, emprestimos } = ctx;
  const p = pergunta.toLowerCase();

  if (p.includes('posso comprar') || p.includes('comprar')) {
    const valorEncontrado = pergunta.match(/\d+([.,]\d+)?/);
    const valor = valorEncontrado ? parseFloat(valorEncontrado[0].replace(',', '.')) : 0;

    if (valor > 0) {
      if (valor <= resumo.valorDisponivel * 0.5) {
        return `### 🟢 Análise Financeira AI: **Compra Viável**
      
Com base no seu fluxo de caixa deste mês:
- **Valor da Compra:** ${formatarMoeda(valor)}
- **Disponível Atual no Mês:** ${formatarMoeda(resumo.valorDisponivel)}
- **Saldo após a compra:** ${formatarMoeda(resumo.valorDisponivel - valor)}

**Veredito do Copiloto:**
Esta compra representa menos de 50% da sua sobra mensal e não comprometerá suas contas fixas de ${formatarMoeda(resumo.contasProximasTotal)} nem suas parcelas futuras. Pode realizar a compra tranquilamente!`;
      } else {
        return `### 🟡 Análise Financeira AI: **Cuidado com o Impacto**
      
- **Valor pretendido:** ${formatarMoeda(valor)}
- **Disponível no Mês:** ${formatarMoeda(resumo.valorDisponivel)}
- **Comprometimento de Renda Atual:** ${saude.comprometimento_renda}%

**Veredito do Copiloto:**
O valor pretendido consome grande parte da sua margem de segurança mensal. 
**Recomendações:**
1. Verifique se você consegue negociar desconto à vista de pelo menos 5% a 10%.
2. Se for parcelar, limite o valor da parcela a no máximo 10% da sua renda mensal.
3. Certifique-se de que não atrasará o alcance de suas metas atuais.`;
      }
    }

    return `### 💡 Análise de Decisão de Compra
Para uma análise exata do impacto, me informe o valor aproximado do produto ou serviço (ex: *"Posso comprar uma TV de R$ 2.500?"*). 
Seu valor livre no momento é de **${formatarMoeda(resumo.valorDisponivel)}** e seu saldo total é de **${formatarMoeda(resumo.saldoAtual)}**.`;
  }

  if (p.includes('recebi') || p.includes('extra') || p.includes('dinheiro extra') || p.includes('o que pagar primeiro')) {
    const valorEncontrado = pergunta.match(/\d+([.,]\d+)?/);
    const extra = valorEncontrado ? parseFloat(valorEncontrado[0].replace(',', '.')) : 3000;

    let resposta = `### 🎯 Plano de Destinação Estratégica (${formatarMoeda(extra)} Extra)\n\n`;
    resposta += `Com base nos seus números atuais (Score de Saúde: **${saude.score}/100**), a melhor estratégia é:\n\n`;

    if (emprestimos.length > 0) {
      const emp = emprestimos[0];
      resposta += `1. **Amortizar Empréstimo (${emp.banco}):** Reduza as parcelas pendentes para economizar com a taxa de juros de ${emp.taxa_juros}% a.m.\n`;
    }

    if (saude.cobertura_reserva_meses < 6) {
      resposta += `2. **Fortalecer Reserva de Emergência:** Sua reserva atual cobre ${saude.cobertura_reserva_meses} meses. Destine pelo menos 40% deste valor extra para atingir 6 meses de segurança.\n`;
    }

    if (metas.length > 0) {
      resposta += `3. **Aporte na Meta "${metas[0].nome}":** Acelere sua meta aportando uma fração deste valor.\n`;
    }

    resposta += `\n*Dica de Ouro:* Evite gastar todo o extra em despesas de consumo momentâneo. Transforme esse ganho em tranquilidade futura!`;
    return resposta;
  }

  if (p.includes('reduzir') || p.includes('gastos') || p.includes('economizar')) {
    return `### ✂️ Como Otimizar Seus Gastos Agora
    
Atualmente suas despesas do mês estão em **${formatarMoeda(resumo.totalDespesasMes)}** e suas faturas de cartão somam **${formatarMoeda(resumo.faturaCartoesTotal)}**.

**Plano de Ação Sugerido:**
1. **Auditoria de Assinaturas & Recorrências:** Revise streamings, clubes de assinatura e planos de celular que não utiliza frequentemente.
2. **Limite nos Cartões:** Seu comprometimento de renda está em **${saude.comprometimento_renda}%**. Procure não ultrapassar 60%.
3. **Regra dos 3 Dias:** Para qualquer gasto não essencial acima de R$ 200, espere 72 horas antes de comprar. 80% das compras por impulso são evitadas dessa forma!`;
  }

  if (p.includes('meta') || p.includes('atingir')) {
    if (metas.length > 0) {
      const meta = metas[0];
      const falta = meta.valor_objetivo - meta.valor_acumulado;
      const mesesEstimados = resumo.valorDisponivel > 0 ? Math.ceil(falta / (resumo.valorDisponivel * 0.5)) : 12;
      return `### 🎯 Progresso da Sua Meta: **${meta.nome}**
      
- **Objetivo:** ${formatarMoeda(meta.valor_objetivo)}
- **Acumulado:** ${formatarMoeda(meta.valor_acumulado)} (${((meta.valor_acumulado / meta.valor_objetivo) * 100).toFixed(0)}%)
- **Falta:** ${formatarMoeda(falta)}
- **Prazo Estimado:** Aportando metade da sua folga mensal (${formatarMoeda(resumo.valorDisponivel * 0.5)}/mês), você atinge a meta em aproximadamente **${mesesEstimados} meses**!`;
    }
    return `Você ainda não cadastrou metas financeiras! Acesse o menu de **Metas** para definir seus objetivos (ex: Reserva de Emergência, Viagem, Comprar Carro).`;
  }

  // Resumo Geral
  return `### 📊 Diagnóstico Financeiro Finance AI

- **Saldo Geral:** ${formatarMoeda(resumo.saldoAtual)}
- **Disponível no Mês:** ${formatarMoeda(resumo.valorDisponivel)}
- **Comprometimento de Renda:** ${saude.comprometimento_renda}%
- **Score Financeiro:** ${saude.score}/100 (${saude.classificacao})

Você pode me perguntar:
- *"Posso comprar um celular de R$ 3.000?"*
- *"Recebi R$ 5.000 extras, o que fazer?"*
- *"Como posso reduzir meus gastos este mês?"*
- *"Quando vou atingir minha meta?"*`;
}
