'use client';

import React, { useState } from 'react';
import { BarChart3, Download, Printer, Calendar, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatarMoeda, getMesAnoAtual } from '@/lib/financial-engine/calculations';

export default function RelatoriosPage() {
  const { receitas, despesas, contasFuturas, resumo, saude } = useFinance();
  const mesAtual = getMesAnoAtual();
  const [mesSelecionado, setMesSelecionado] = useState(mesAtual);

  const despesasMes = despesas.filter(d => d.data.startsWith(mesSelecionado));
  const receitasMes = receitas.filter(r => r.data.startsWith(mesSelecionado));

  // Maiores gastos
  const maioresGastos = [...despesasMes].sort((a, b) => b.valor - a.valor).slice(0, 5);

  const totalReceitas = receitasMes.reduce((s, r) => s + r.valor, 0);
  const totalDespesas = despesasMes.reduce((s, d) => s + d.valor, 0);
  const economiaLiquida = Math.max(0, totalReceitas - totalDespesas);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-black text-white">Relatórios Automáticos</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Consolidação mensal de receitas, despesas, economia líquida e maiores gastos
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-xs font-semibold text-white transition-colors"
        >
          <Printer className="w-4 h-4" />
          Imprimir / Salvar PDF
        </button>
      </div>

      {/* Relatório Consolidado */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
          <div>
            <span className="text-xs uppercase font-bold text-gray-400">Extrato Mensal Fechado</span>
            <h2 className="text-xl font-bold text-white mt-0.5">Competência: {mesSelecionado}</h2>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="month"
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white"
            />
          </div>
        </div>

        {/* 3 Blocos de Totais do Relatório */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
            <span className="text-xs font-semibold text-emerald-400">Total Recebido</span>
            <h3 className="text-2xl font-black text-white mt-1">{formatarMoeda(totalReceitas)}</h3>
            <p className="text-[11px] text-gray-400 mt-1">{receitasMes.length} lançamentos</p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20">
            <span className="text-xs font-semibold text-rose-400">Total Desembolsado</span>
            <h3 className="text-2xl font-black text-white mt-1">{formatarMoeda(totalDespesas)}</h3>
            <p className="text-[11px] text-gray-400 mt-1">{despesasMes.length} despesas</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20">
            <span className="text-xs font-semibold text-purple-300">Economia Líquida</span>
            <h3 className="text-2xl font-black text-purple-200 mt-1">{formatarMoeda(economiaLiquida)}</h3>
            <p className="text-[11px] text-gray-400 mt-1">Saldo poupado no mês</p>
          </div>
        </div>

        {/* Top 5 Maiores Gastos do Período */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Maiores Gastos Registrados no Mês:
          </h4>

          <div className="divide-y divide-gray-800/60 rounded-2xl bg-gray-900/40 border border-gray-800/80 p-2">
            {maioresGastos.length === 0 ? (
              <p className="text-xs text-gray-500 p-4 text-center">Nenhuma despesa para este período.</p>
            ) : (
              maioresGastos.map((g, idx) => (
                <div key={g.id} className="py-2.5 px-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-gray-800 text-gray-300 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-white block">{g.descricao}</span>
                      <span className="text-[10px] text-gray-400 uppercase">{g.categoria}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-rose-400">{formatarMoeda(g.valor)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Diagnóstico Executivo de Conclusão */}
        <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-cyan-400">Parecer do Copiloto Financeiro AI:</span>
          <p className="text-xs text-gray-300 leading-relaxed">
            Neste período, você poupou <strong>{((economiaLiquida / (totalReceitas || 1)) * 100).toFixed(0)}%</strong> das suas receitas.
            Seu nível de saúde financeira consolidada fechou em <strong>{saude.score}/100</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
