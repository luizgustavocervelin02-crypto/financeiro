'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight, Sparkles, Activity, Percent } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatarMoeda } from '@/lib/financial-engine/calculations';

function getCorScore(score: number): { texto: string; bg: string; border: string } {
  if (score >= 80) return { texto: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
  if (score >= 65) return { texto: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' };
  if (score >= 50) return { texto: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
  return { texto: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
}

export default function SaudeFinanceiraPage() {
  const { saude, resumo } = useFinance();
  const estiloScore = getCorScore(saude.score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-white">Saúde Financeira</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Diagnóstico dos 4 pilares: comprometimento de renda, poupança, endividamento e reserva
          </p>
        </div>

        <Link
          href="/assistente"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-xs border border-purple-500/30 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Consultar Copiloto IA
        </Link>
      </div>

      {/* Card do Score Geral */}
      <div className={`glass-panel rounded-3xl p-6 sm:p-8 border ${estiloScore.border} bg-gradient-to-br from-[#111827] to-[#0a1120] relative overflow-hidden shadow-2xl`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Pontuação Geral Consolidada</span>
            <div className="flex items-baseline justify-center md:justify-start gap-2">
              <span className={`text-5xl sm:text-6xl font-black tracking-tight ${estiloScore.texto}`}>
                {saude.score}
              </span>
              <span className="text-2xl font-bold text-gray-500">/100</span>
            </div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-900 border border-gray-700 text-white">
              Classificação: {saude.classificacao}
            </div>
            <p className="text-xs text-gray-300 max-w-lg mt-2 leading-relaxed">
              Seu score é recalculado dinamicamente com base no fluxo real de receitas, pontualidade de pagamentos e amortização de dívidas.
            </p>
          </div>

          <div className="w-full md:w-72 space-y-3 p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Reserva de Emergência</span>
              <span className="font-bold text-white">{saude.cobertura_reserva_meses} meses</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(100, (saude.cobertura_reserva_meses / 6) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 block text-right">Meta recomendada: 6 meses</span>
          </div>
        </div>
      </div>

      {/* Os 4 Pilares Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pilar 1: Comprometimento de Renda */}
        <div className="glass-panel rounded-2xl p-5 border border-gray-800">
          <span className="text-xs font-semibold text-gray-400 uppercase">1. Renda Comprometida</span>
          <h3 className="text-3xl font-black text-white mt-2">{saude.comprometimento_renda}%</h3>
          <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${saude.comprometimento_renda > 70 ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${saude.comprometimento_renda}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            {saude.comprometimento_renda <= 60 ? '✅ Saudável (<= 60%)' : '⚠️ Alerta (> 60%)'}
          </p>
        </div>

        {/* Pilar 2: Capacidade de Economia / Poupança */}
        <div className="glass-panel rounded-2xl p-5 border border-gray-800">
          <span className="text-xs font-semibold text-gray-400 uppercase">2. Capacidade de Poupança</span>
          <h3 className="text-3xl font-black text-emerald-400 mt-2">{saude.capacidade_poupanca}%</h3>
          <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${saude.capacidade_poupanca}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            {saude.capacidade_poupanca >= 20 ? '✅ Excelente (>= 20%)' : '💡 Pode melhorar'}
          </p>
        </div>

        {/* Pilar 3: Nível de Endividamento */}
        <div className="glass-panel rounded-2xl p-5 border border-gray-800">
          <span className="text-xs font-semibold text-gray-400 uppercase">3. Nível de Endividamento</span>
          <h3 className="text-3xl font-black text-amber-300 mt-2">{saude.nivel_endividamento}%</h3>
          <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${saude.nivel_endividamento}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Dívidas vs capacidade anual</p>
        </div>

        {/* Pilar 4: Liquidez Imediata */}
        <div className="glass-panel rounded-2xl p-5 border border-gray-800">
          <span className="text-xs font-semibold text-gray-400 uppercase">4. Cobertura da Reserva</span>
          <h3 className="text-3xl font-black text-cyan-300 mt-2">{saude.cobertura_reserva_meses}x</h3>
          <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full"
              style={{ width: `${Math.min(100, (saude.cobertura_reserva_meses / 6) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Meses de sobrevivência sem renda</p>
        </div>
      </div>

      {/* Pontos Fortes e Oportunidades de Melhoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Pontos Fortes Identificados</h4>
          </div>
          <ul className="space-y-2 text-xs text-gray-300">
            {saude.pontos_fortes.map((p, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-amber-500/20 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-bold text-white">Oportunidades de Otimização</h4>
          </div>
          <ul className="space-y-2 text-xs text-gray-300">
            {saude.pontos_melhoria.map((p, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">!</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
