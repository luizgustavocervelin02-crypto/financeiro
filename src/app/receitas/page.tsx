'use client';

import React, { useState } from 'react';
import { Plus, ArrowUpCircle, Trash2, Calendar, Repeat, Tag, TrendingUp } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatarMoeda, formatarDataBR } from '@/lib/financial-engine/calculations';
import { NovaReceitaModal } from '@/components/modals/NovaReceitaModal';

export default function ReceitasPage() {
  const { receitas, excluirReceita, resumo } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');

  const receitasFiltradas = filtroCategoria === 'todas'
    ? receitas
    : receitas.filter(r => r.categoria === filtroCategoria);

  const totalFiltrado = receitasFiltradas.reduce((sum, r) => sum + r.valor, 0);

  const getNomeCategoria = (cat: string) => {
    switch (cat) {
      case 'salario': return 'Salário';
      case 'renda_extra': return 'Renda Extra';
      case 'investimentos': return 'Investimentos';
      default: return 'Outros Ganhos';
    }
  };

  const getCorBadge = (cat: string) => {
    switch (cat) {
      case 'salario': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'renda_extra': return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'investimentos': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-700/50 text-gray-300 border-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com totalizador e botão de adicionar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-white">Receitas & Ganhos</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">Gerencie seus salários, rendas extras e dividendos</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nova Receita
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-emerald-500/20">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Total de Receitas</span>
          <h3 className="text-2xl font-black text-white mt-1">{formatarMoeda(totalFiltrado)}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">{receitasFiltradas.length} entradas registradas</p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-gray-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">Receitas do Mês Atual</span>
          <h3 className="text-2xl font-black text-cyan-300 mt-1">{formatarMoeda(resumo.totalReceitasMes)}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Competência deste mês</p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-gray-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">Taxa de Poupança</span>
          <h3 className="text-2xl font-black text-purple-300 mt-1">{resumo.taxaPoupancaMes.toFixed(1)}%</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Capacidade de retenção</p>
        </div>
      </div>

      {/* Filtros por Categoria */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {['todas', 'salario', 'renda_extra', 'investimentos', 'outros'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltroCategoria(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
              filtroCategoria === cat
                ? 'bg-emerald-500 text-gray-950 border-emerald-400'
                : 'bg-gray-900/80 text-gray-400 border-gray-800 hover:text-white'
            }`}
          >
            {cat === 'todas' ? 'Todas as Receitas' : getNomeCategoria(cat)}
          </button>
        ))}
      </div>

      {/* Lista de Receitas */}
      <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-gray-900/40 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">Histórico de Entradas</h4>
          <span className="text-xs text-gray-400">{receitasFiltradas.length} itens</span>
        </div>

        <div className="divide-y divide-gray-800/60">
          {receitasFiltradas.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-400">
              Nenhuma receita encontrada para o filtro selecionado.
            </div>
          ) : (
            receitasFiltradas.map((r) => (
              <div
                key={r.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 mt-0.5">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{r.descricao}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCorBadge(r.categoria)}`}>
                        {getNomeCategoria(r.categoria)}
                      </span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatarDataBR(r.data)}
                      </span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        {r.recorrencia === 'mensal' ? 'Mensal' : r.recorrencia === 'anual' ? 'Anual' : 'Pontual'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-left sm:text-right">
                    <span className="text-base font-extrabold text-emerald-400">
                      +{formatarMoeda(r.valor)}
                    </span>
                    <p className="text-[10px] text-gray-500">Recebido</p>
                  </div>

                  <button
                    onClick={() => excluirReceita(r.id)}
                    className="p-2 text-gray-500 hover:text-rose-400 hover:bg-gray-800 rounded-lg transition-colors"
                    title="Excluir receita"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <NovaReceitaModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
