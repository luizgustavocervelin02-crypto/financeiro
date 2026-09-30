'use client';

import React, { useState } from 'react';
import { Target, Plus, Calendar, DollarSign, Trash2, Trophy, ArrowUpRight } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatarMoeda, formatarDataBR } from '@/lib/financial-engine/calculations';
import { Modal } from '@/components/ui/Modal';

export default function MetasPage() {
  const { metas, adicionarMeta, aportarMeta, excluirMeta } = useFinance();
  const [modalNovaMeta, setModalNovaMeta] = useState(false);
  const [modalAporte, setModalAporte] = useState<string | null>(null);
  const [valorAporte, setValorAporte] = useState('');

  // Form states nova meta
  const hoje = new Date();
  const anoQueVem = `${hoje.getFullYear() + 1}-12-31`;
  const [nome, setNome] = useState('');
  const [valorObjetivo, setValorObjetivo] = useState('');
  const [valorAcumulado, setValorAcumulado] = useState('0');
  const [prazo, setPrazo] = useState(anoQueVem);
  const [cor, setCor] = useState('#10b981');

  const totalAcumuladoGeral = metas.reduce((sum, m) => sum + m.valor_acumulado, 0);
  const totalObjetivosGeral = metas.reduce((sum, m) => sum + m.valor_objetivo, 0);
  const progressoMedio = totalObjetivosGeral > 0 ? (totalAcumuladoGeral / totalObjetivosGeral) * 100 : 0;

  const handleSubmitNovaMeta = (e: React.FormEvent) => {
    e.preventDefault();
    const obj = parseFloat(valorObjetivo.replace(',', '.'));
    const acum = parseFloat(valorAcumulado.replace(',', '.')) || 0;
    if (!nome.trim() || isNaN(obj) || obj <= 0) return;

    adicionarMeta({
      nome: nome.trim(),
      valor_objetivo: obj,
      valor_acumulado: acum,
      prazo,
      categoria: 'patrimonio',
      cor,
    });

    setNome('');
    setValorObjetivo('');
    setValorAcumulado('0');
    setModalNovaMeta(false);
  };

  const handleAporte = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAporte) return;
    const val = parseFloat(valorAporte.replace(',', '.'));
    if (isNaN(val) || val <= 0) return;

    aportarMeta(modalAporte, val);
    setValorAporte('');
    setModalAporte(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-white">Metas Financeiras</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Planejamento para reserva de emergência, aquisições e realizações de vida
          </p>
        </div>

        <button
          onClick={() => setModalNovaMeta(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nova Meta
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-emerald-500/20">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Total Acumulado em Metas</span>
          <h3 className="text-2xl font-black text-white mt-1">{formatarMoeda(totalAcumuladoGeral)}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Patrimônio já alocado</p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-gray-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">Objetivo Consolidado</span>
          <h3 className="text-2xl font-black text-cyan-300 mt-1">{formatarMoeda(totalObjetivosGeral)}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Soma de todas as metas</p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-gray-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">Progresso Geral</span>
          <h3 className="text-2xl font-black text-purple-300 mt-1">{progressoMedio.toFixed(1)}%</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">{metas.length} objetivos cadastrados</p>
        </div>
      </div>

      {/* Grid de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {metas.length === 0 ? (
          <div className="col-span-full glass-panel rounded-2xl p-12 text-center text-gray-400">
            Nenhuma meta cadastrada. Defina seus objetivos (ex: Reserva de Emergência, Comprar Carro, Viagem).
          </div>
        ) : (
          metas.map((meta) => {
            const perc = meta.valor_objetivo > 0 ? (meta.valor_acumulado / meta.valor_objetivo) * 100 : 0;
            const falta = Math.max(0, meta.valor_objetivo - meta.valor_acumulado);
            const isConcluida = perc >= 100;

            return (
              <div
                key={meta.id}
                className="glass-panel rounded-2xl p-5 border border-gray-800 hover:border-gray-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-inner"
                        style={{ backgroundColor: `${meta.cor}25`, border: `1px solid ${meta.cor}55` }}
                      >
                        {isConcluida ? <Trophy className="w-5 h-5 text-amber-400" /> : <Target className="w-5 h-5" style={{ color: meta.cor }} />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-snug">{meta.nome}</h4>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          Prazo: {formatarDataBR(meta.prazo)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => excluirMeta(meta.id)}
                      className="text-gray-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                      title="Excluir meta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Valores e Barra */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-extrabold text-white">
                        {formatarMoeda(meta.valor_acumulado)}
                      </span>
                      <span className="text-xs text-gray-400">
                        de {formatarMoeda(meta.valor_objetivo)}
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, perc)}%`,
                          backgroundColor: meta.cor
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
                      <span>Progresso: <strong className="text-white">{perc.toFixed(0)}%</strong></span>
                      <span>{isConcluida ? '🎉 Concluída!' : `Faltam ${formatarMoeda(falta)}`}</span>
                    </div>
                  </div>
                </div>

                {/* Botão de Aporte Rápido */}
                <div className="pt-2 border-t border-gray-800/80">
                  <button
                    onClick={() => setModalAporte(meta.id)}
                    className="w-full py-2 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-xs font-bold text-gray-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    Adicionar Aporte
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Nova Meta */}
      <Modal isOpen={modalNovaMeta} onClose={() => setModalNovaMeta(false)} title="Nova Meta Financeira">
        <form onSubmit={handleSubmitNovaMeta} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Nome da Meta</label>
            <input
              type="text"
              required
              placeholder="Ex: Reserva de Emergência, Comprar Carro, Viagem..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Valor Objetivo (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="Ex: 30000"
                value={valorObjetivo}
                onChange={(e) => setValorObjetivo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Valor Já Acumulado (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 5000"
                value={valorAcumulado}
                onChange={(e) => setValorAcumulado(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Prazo Estimado</label>
              <input
                type="date"
                required
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Cor da Meta</label>
              <div className="flex items-center gap-2 pt-1.5">
                {['#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b'].map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setCor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      cor === c ? 'scale-110 border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={() => setModalNovaMeta(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow-lg shadow-emerald-500/20 transition-all"
            >
              Criar Meta
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Aporte Rápido */}
      <Modal isOpen={Boolean(modalAporte)} onClose={() => setModalAporte(null)} title="Registrar Aporte na Meta">
        <form onSubmit={handleAporte} className="space-y-4">
          <p className="text-xs text-gray-300">
            Quanto você gostaria de adicionar a esta meta financeira hoje?
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Valor do Aporte (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0,00"
              value={valorAporte}
              onChange={(e) => setValorAporte(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={() => setModalAporte(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow-lg shadow-emerald-500/20 transition-all"
            >
              Confirmar Aporte
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
