'use client';

import React from 'react';
import Link from 'next/link';
import { PlusCircle, MinusCircle, Sparkles, CreditCard, Bot, FileSpreadsheet } from 'lucide-react';

interface QuickActionsProps {
  onOpenNovaDespesa: () => void;
  onOpenNovaReceita: () => void;
}

export function QuickActions({ onOpenNovaDespesa, onOpenNovaReceita }: QuickActionsProps) {
  return (
    <div className="glass-panel rounded-2xl p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações Rápidas</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
        <button
          onClick={onOpenNovaDespesa}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-rose-500/40 hover:bg-rose-500/5 transition-all text-center group"
        >
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
            <MinusCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-200 mt-2">Nova Despesa</span>
        </button>

        <button
          onClick={onOpenNovaReceita}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all text-center group"
        >
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-200 mt-2">Nova Receita</span>
        </button>

        <Link
          href="/simulador"
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-900/80 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all text-center group"
        >
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-cyan-300 mt-2">Posso Comprar?</span>
        </Link>

        <Link
          href="/assistente"
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-900/80 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10 transition-all text-center group"
        >
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 group-hover:scale-110 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-purple-300 mt-2">Copiloto IA</span>
        </Link>

        <Link
          href="/cartoes"
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-center group"
        >
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-200 mt-2">Ver Cartões</span>
        </Link>

        <Link
          href="/importacao-csv"
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all text-center group"
        >
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-200 mt-2">Importar CSV</span>
        </Link>
      </div>
    </div>
  );
}
