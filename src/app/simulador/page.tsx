'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, AlertTriangle, AlertCircle, ShoppingCart, Calculator, ShieldCheck } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { simularCompra } from '@/lib/financial-engine/simulator';
import { formatarMoeda } from '@/lib/financial-engine/calculations';
import { CategoriaDespesa, ResultadoSimulacao } from '@/lib/types';

export default function SimuladorPage() {
  const { resumo, metas, cartoes } = useFinance();

  const [descricao, setDescricao] = useState('Notebook Gamer / Trabalho');
  const [valor, setValor] = useState('4000');
  const [tipoPagamento, setTipoPagamento] = useState<'a_vista' | 'parcelado'>('parcelado');
  const [parcelas, setParcelas] = useState('12');
  const [cartaoId, setCartaoId] = useState(cartoes[0]?.id || '');
  const [categoria, setCategoria] = useState<CategoriaDespesa>('compras');

  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(() => {
    return simularCompra(
      {
        descricao: 'Notebook Gamer / Trabalho',
        valor: 4000,
        tipo_pagamento: 'parcelado',
        parcelas: 12,
        categoria: 'compras',
      },
      resumo,
      metas,
      cartoes[0]
    );
  });

  const handleSimular = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valor.replace(',', '.'));
    if (isNaN(val) || val <= 0) return;

    const cartaoSelecionado = cartoes.find(c => c.id === cartaoId);

    const res = simularCompra(
      {
        descricao: descricao.trim() || 'Nova Compra',
        valor: val,
        tipo_pagamento: tipoPagamento,
        parcelas: parseInt(parcelas) || 1,
        cartao_id: cartaoId,
        categoria,
      },
      resumo,
      metas,
      cartaoSelecionado
    );

    setResultado(res);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-emerald-950/40 border border-cyan-500/20 shadow-xl">
        <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-xs">
          <Sparkles className="w-4 h-4" />
          <span>Inteligência Pré-Compra (Fase 2)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
          Antes de Comprar
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
          Evite arrependimentos. Consulte o impacto exato no seu saldo, fluxo de caixa mensal, faturas futuras e metas financeiras antes de tomar uma decisão.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulário de Simulação (Coluna da Esquerda) */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-gray-800 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
            <Calculator className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Parâmetros da Compra</h3>
          </div>

          <form onSubmit={handleSimular} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">O que você pretende comprar?</label>
              <input
                type="text"
                required
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Celular, Viagem, Curso, TV..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Valor Total do Produto (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-cyan-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Forma de Pagamento Desejada</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTipoPagamento('a_vista')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                    tipoPagamento === 'a_vista'
                      ? 'bg-emerald-500 text-gray-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                  }`}
                >
                  À Vista (Liquidez)
                </button>

                <button
                  type="button"
                  onClick={() => setTipoPagamento('parcelado')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                    tipoPagamento === 'parcelado'
                      ? 'bg-purple-500 text-white border-purple-400 shadow-md shadow-purple-500/20'
                      : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                  }`}
                >
                  Parcelado no Cartão
                </button>
              </div>
            </div>

            {tipoPagamento === 'parcelado' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Qtd. de Parcelas</label>
                    <select
                      value={parcelas}
                      onChange={(e) => setParcelas(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-purple-500"
                    >
                      {[2, 3, 4, 5, 6, 8, 10, 12, 18, 24].map((n) => (
                        <option key={n} value={n}>{n} vezes</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Cartão de Crédito</label>
                    <select
                      value={cartaoId}
                      onChange={(e) => setCartaoId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-purple-500"
                    >
                      {cartoes.map((c) => (
                        <option key={c.id} value={c.id}>{c.nome_cartao}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-gray-950 font-black text-sm shadow-xl shadow-cyan-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Simular Impacto com IA
            </button>
          </form>
        </div>

        {/* Resultados da Simulação (Coluna da Direita) */}
        <div className="lg:col-span-7 space-y-4">
          {resultado && (
            <>
              {/* Card de Veredito */}
              <div className={`glass-panel rounded-3xl p-6 border ${
                resultado.pontuacao_impacto === 'baixo'
                  ? 'border-emerald-500/40 bg-emerald-950/15'
                  : resultado.pontuacao_impacto === 'moderado'
                  ? 'border-cyan-500/40 bg-cyan-950/15'
                  : resultado.pontuacao_impacto === 'alto'
                  ? 'border-amber-500/40 bg-amber-950/15'
                  : 'border-rose-500/40 bg-rose-950/15'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl flex-shrink-0 ${
                    resultado.viavel ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {resultado.viavel ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Diagnóstico IA</span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      {resultado.viavel ? 'Compra Financeiramente Viável' : 'Atenção: Compra Não Recomendada no Momento'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-200 mt-2 leading-relaxed">
                      {resultado.recomendacao_ia}
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid de Impactos Detalhados */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="glass-panel rounded-2xl p-4 border border-gray-800">
                  <span className="text-[10px] text-gray-400 block uppercase font-semibold">Impacto no Saldo</span>
                  <span className="text-base font-bold text-white mt-1 block">
                    -{formatarMoeda(resultado.impacto_saldo_imediato)}
                  </span>
                  <p className="text-[11px] text-gray-400 mt-0.5">Saída imediata</p>
                </div>

                <div className="glass-panel rounded-2xl p-4 border border-gray-800">
                  <span className="text-[10px] text-gray-400 block uppercase font-semibold">Impacto Mensal</span>
                  <span className="text-base font-bold text-cyan-300 mt-1 block">
                    {formatarMoeda(resultado.impacto_mensal)}/mês
                  </span>
                  <p className="text-[11px] text-gray-400 mt-0.5">Fluxo de caixa</p>
                </div>

                <div className="glass-panel rounded-2xl p-4 border border-gray-800">
                  <span className="text-[10px] text-gray-400 block uppercase font-semibold">Novo Comprometimento</span>
                  <span className="text-base font-bold text-purple-300 mt-1 block">
                    {resultado.novo_comprometimento_renda.toFixed(0)}%
                  </span>
                  <p className="text-[11px] text-gray-400 mt-0.5">Da sua renda total</p>
                </div>
              </div>

              {/* Comparativo: À Vista vs Parcelado */}
              <div className="glass-panel rounded-2xl p-5 border border-gray-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Comparativo Estratégico: À Vista vs Parcelado
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
                    <span className="text-xs font-bold text-emerald-400">Pagar À Vista</span>
                    <p className="text-xs text-gray-300">
                      Reduz seu saldo imediato para <strong>{formatarMoeda(resultado.comparativo.a_vista.saldo_apos_compra)}</strong>.
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Ideal caso você consiga um desconto à vista de pelo menos <strong>{formatarMoeda(resultado.comparativo.a_vista.desconto_possivel || 0)}</strong> (5%).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
                    <span className="text-xs font-bold text-purple-400">Parcelar em {resultado.comparativo.parcelado.parcelas}x</span>
                    <p className="text-xs text-gray-300">
                      Compromete <strong>{formatarMoeda(resultado.comparativo.parcelado.valor_parcela)}/mês</strong> durante {resultado.comparativo.parcelado.parcelas} meses futuros.
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Mantém sua reserva no bolso, mas engessa parte do seu fluxo até a quitação.
                    </p>
                  </div>
                </div>
              </div>

              {/* Impacto nas Metas */}
              <div className="glass-panel rounded-2xl p-5 border border-gray-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Impacto nas Metas Cadastradas:
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-300">
                  {resultado.impacto_metas.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
