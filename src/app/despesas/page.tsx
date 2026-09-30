'use client';

import React, { useState } from 'react';
import { Plus, ArrowDownCircle, Trash2, Calendar, CreditCard, Tag, Search } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatarMoeda, formatarDataBR, getMesAnoAtual } from '@/lib/financial-engine/calculations';
import { NovaDespesaModal } from '@/components/modals/NovaDespesaModal';
import { CategoriaDespesa, FormaPagamento } from '@/lib/types';

const CATEGORIAS_CONFIG: Record<string, { label: string; cor: string }> = {
  alimentacao: { label: 'Alimentação', cor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  moradia: { label: 'Moradia', cor: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  transporte: { label: 'Transporte', cor: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  lazer: { label: 'Lazer', cor: 'bg-pink-500/15 text-pink-400 border-pink-500/30' },
  saude: { label: 'Saúde', cor: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  compras: { label: 'Compras', cor: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  assinaturas: { label: 'Assinaturas', cor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  educacao: { label: 'Educação', cor: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
  outros: { label: 'Outros', cor: 'bg-gray-700/50 text-gray-300 border-gray-600' },
};

export default function DespesasPage() {
  const { despesas, excluirDespesa, cartoes, resumo } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [busca, setBusca] = useState('');

  const despesasFiltradas = despesas.filter((d) => {
    const matchCat = filtroCategoria === 'todas' || d.categoria === filtroCategoria;
    const matchBusca = d.descricao.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  const totalFiltrado = despesasFiltradas.reduce((sum, d) => sum + d.valor, 0);

  const getNomeCartao = (cartaoId?: string) => {
    if (!cartaoId) return null;
    const c = cartoes.find(x => x.id === cartaoId);
    return c ? c.nome_cartao : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="w-6 h-6 text-rose-400" />
            <h1 className="text-2xl font-black text-white">Despesas & Gastos</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">Monitore saídas por categoria e forma de pagamento</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nova Despesa
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-rose-500/20">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">Total de Despesas</span>
          <h3 className="text-2xl font-black text-white mt-1">{formatarMoeda(totalFiltrado)}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">{despesasFiltradas.length} transações filtradas</p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-gray-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">Despesas Deste Mês</span>
          <h3 className="text-2xl font-black text-purple-300 mt-1">{formatarMoeda(resumo.totalDespesasMes)}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Competência atual</p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-gray-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">Fatura de Cartões</span>
          <h3 className="text-2xl font-black text-amber-300 mt-1">{formatarMoeda(resumo.faturaCartoesTotal)}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Gastos em crédito e parcelas</p>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por descrição (ex: Supermercado, Farmácia...)"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setFiltroCategoria('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
              filtroCategoria === 'todas'
                ? 'bg-rose-500 text-white border-rose-400'
                : 'bg-gray-900/80 text-gray-400 border-gray-800 hover:text-white'
            }`}
          >
            Todas as Categorias
          </button>
          {Object.entries(CATEGORIAS_CONFIG).map(([cat, config]) => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                filtroCategoria === cat
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-gray-900/80 text-gray-400 border-gray-800 hover:text-white'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela / Lista de Despesas */}
      <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-gray-900/40 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">Lançamentos de Saída</h4>
          <span className="text-xs text-gray-400">{despesasFiltradas.length} itens</span>
        </div>

        <div className="divide-y divide-gray-800/60">
          {despesasFiltradas.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-400">
              Nenhuma despesa encontrada.
            </div>
          ) : (
            despesasFiltradas.map((d) => {
              const catConf = CATEGORIAS_CONFIG[d.categoria] || { label: d.categoria, cor: 'bg-gray-700 text-gray-300' };
              const nomeCartao = getNomeCartao(d.cartao_id);

              return (
                <div
                  key={d.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 mt-0.5">
                      <ArrowDownCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{d.descricao}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catConf.cor}`}>
                          {catConf.label}
                        </span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatarDataBR(d.data)}
                        </span>
                        <span className="text-[11px] text-gray-400 uppercase font-semibold">
                          {d.forma_pagamento}
                        </span>
                        {nomeCartao && (
                          <span className="text-[11px] text-cyan-400 flex items-center gap-1 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                            <CreditCard className="w-3 h-3" />
                            {nomeCartao}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <span className="text-base font-extrabold text-rose-400">
                        -{formatarMoeda(d.valor)}
                      </span>
                      <p className="text-[10px] text-gray-500">Confirmado</p>
                    </div>

                    <button
                      onClick={() => excluirDespesa(d.id)}
                      className="p-2 text-gray-500 hover:text-rose-400 hover:bg-gray-800 rounded-lg transition-colors"
                      title="Excluir despesa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <NovaDespesaModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
