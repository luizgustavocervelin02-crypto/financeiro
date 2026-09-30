'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, ArrowRight, Bot } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { BalanceCards } from '@/components/dashboard/BalanceCards';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { UpcomingBills } from '@/components/dashboard/UpcomingBills';
import { FutureCommitments } from '@/components/dashboard/FutureCommitments';
import { FinancialCharts } from '@/components/dashboard/FinancialCharts';
import { NovaDespesaModal } from '@/components/modals/NovaDespesaModal';
import { NovaReceitaModal } from '@/components/modals/NovaReceitaModal';

export default function DashboardPage() {
  const { saude, profile, isLoaded } = useFinance();
  const [modalDespesaOpen, setModalDespesaOpen] = useState(false);
  const [modalReceitaOpen, setModalReceitaOpen] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-xs text-gray-400">Carregando seu copiloto financeiro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner de Saudação e Status do Copiloto IA */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-purple-950/40 border border-emerald-500/20 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Copiloto Financeiro Ativo
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Score {saude.score}/100 ({saude.classificacao})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Olá, {profile.nome?.split(' ')[0] || 'Investidor'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
              {saude.dicas_ia[0] || 'Seu painel financeiro consolidado está atualizado. Consulte o assistente antes de qualquer compra!'}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href="/simulador"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-gray-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              Antes de Comprar
            </Link>

            <Link
              href="/assistente"
              className="flex items-center justify-center p-2.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 transition-colors"
              title="Perguntar ao Copiloto IA"
            >
              <Bot className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 1. Cards Principais de Saldo, Receitas, Despesas e Disponível */}
      <BalanceCards />

      {/* 2. Barra de Ações Rápidas */}
      <QuickActions
        onOpenNovaDespesa={() => setModalDespesaOpen(true)}
        onOpenNovaReceita={() => setModalReceitaOpen(true)}
      />

      {/* 3. Gráficos Financeiros (Fluxo & Categorias) */}
      <FinancialCharts />

      {/* 4. Duas Colunas: Contas Próximas & Compromissos Futuros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UpcomingBills />
        <FutureCommitments />
      </div>

      {/* 5. Mini Chamada de Saúde Financeira */}
      <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 bg-[#101827] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Diagnóstico da sua Saúde Financeira</h4>
            <p className="text-xs text-gray-400">
              Comprometimento de renda em <strong className="text-white">{saude.comprometimento_renda}%</strong> e poupança de <strong className="text-emerald-400">{saude.capacidade_poupanca}%</strong>.
            </p>
          </div>
        </div>

        <Link
          href="/saude-financeira"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors w-full sm:w-auto justify-center"
        >
          <span>Ver 4 Pilares</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Modais Globais */}
      <NovaDespesaModal
        isOpen={modalDespesaOpen}
        onClose={() => setModalDespesaOpen(false)}
      />
      <NovaReceitaModal
        isOpen={modalReceitaOpen}
        onClose={() => setModalReceitaOpen(false)}
      />
    </div>
  );
}
