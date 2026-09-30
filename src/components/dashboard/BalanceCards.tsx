'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, TrendingUp, TrendingDown, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatarMoeda } from '@/lib/financial-engine/calculations';

export function BalanceCards() {
  const { resumo } = useFinance();
  const [showValues, setShowValues] = useState(true);

  const ocultar = (val: string) => (showValues ? val : '••••••');

  const disponivelPositivo = resumo.valorDisponivel >= 0;

  return (
    <div className="space-y-4">
      {/* Botão de toggle visibilidade dos valores */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Visão Geral</h2>
          <p className="text-xs text-gray-400">Resumo financeiro em tempo real</p>
        </div>
        <button
          onClick={() => setShowValues(!showValues)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-400 hover:text-white transition-colors"
        >
          {showValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{showValues ? 'Ocultar' : 'Exibir'}</span>
        </button>
      </div>

      {/* Grid de 4 Cards Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Saldo Geral Atual */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-[#111827] to-[#0f172a]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Saldo Atual</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {ocultar(formatarMoeda(resumo.saldoAtual))}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">Patrimônio líquido em conta</p>
          </div>
        </div>

        {/* 2. Receitas do Mês */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Receitas do Mês</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-cyan-300 tracking-tight">
              {ocultar(formatarMoeda(resumo.totalReceitasMes))}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">Salário, extras e investimentos</p>
          </div>
        </div>

        {/* 3. Despesas do Mês */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Despesas do Mês</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-300 tracking-tight">
              {ocultar(formatarMoeda(resumo.totalDespesasMes))}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">Gastos pagos no período</p>
          </div>
        </div>

        {/* 4. Valor Disponível / Sobra */}
        <div className={`glass-panel rounded-2xl p-5 relative overflow-hidden border ${
          disponivelPositivo ? 'border-purple-500/30 bg-purple-950/10' : 'border-rose-500/30 bg-rose-950/10'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">Valor Disponível</span>
            <div className={`p-2.5 rounded-xl ${
              disponivelPositivo ? 'bg-purple-500/20 text-purple-300' : 'bg-rose-500/20 text-rose-300'
            }`}>
              {disponivelPositivo ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              disponivelPositivo ? 'text-purple-300' : 'text-rose-400'
            }`}>
              {ocultar(formatarMoeda(resumo.valorDisponivel))}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Após pagar faturas, contas e despesas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
