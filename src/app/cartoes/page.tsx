'use client';

import React, { useState } from 'react';
import { CreditCard, Plus, Calendar, Shield, Trash2, ArrowUpRight } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatarMoeda, calcularMetricasCartao } from '@/lib/financial-engine/calculations';
import { Modal } from '@/components/ui/Modal';

export default function CartoesPage() {
  const { cartoes, adicionarCartao, excluirCartao, despesas, comprasParceladas } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [banco, setBanco] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [limite, setLimite] = useState('');
  const [fechamento, setFechamento] = useState('25');
  const [vencimento, setVencimento] = useState('5');
  const [cor, setCor] = useState('#820ad1');

  const todasParcelas = comprasParceladas.flatMap(c => c.parcelas || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lim = parseFloat(limite.replace(',', '.'));
    if (!banco.trim() || !nomeCartao.trim() || isNaN(lim) || lim <= 0) return;

    adicionarCartao({
      banco: banco.trim(),
      nome_cartao: nomeCartao.trim(),
      limite: lim,
      fechamento: parseInt(fechamento) || 25,
      vencimento: parseInt(vencimento) || 5,
      cor,
    });

    setBanco('');
    setNomeCartao('');
    setLimite('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-black text-white">Cartões de Crédito</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">Controle de faturas, limites utilizados e datas de corte</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Novo Cartão
        </button>
      </div>

      {/* Grid de Cartões Estilizados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cartoes.map((cartao) => {
          const metricas = calcularMetricasCartao(cartao, despesas, todasParcelas);
          const isQuaseLotado = metricas.percentualUtilizado >= 80;

          return (
            <div
              key={cartao.id}
              className="glass-panel rounded-3xl p-6 border border-gray-800 relative overflow-hidden flex flex-col justify-between space-y-6 hover:border-gray-700 transition-all"
            >
              {/* Efeito visual do cartão tipo mockup moderno */}
              <div 
                className="rounded-2xl p-5 text-white relative shadow-xl overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${cartao.cor}dd 0%, #0d1117 100%)`,
                  border: `1px solid ${cartao.cor}66`
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">{cartao.banco}</span>
                    <h3 className="text-lg font-black tracking-tight">{cartao.nome_cartao}</h3>
                  </div>
                  <div className="w-9 h-6 rounded bg-amber-400/80 border border-amber-300 flex items-center justify-center opacity-90 shadow-sm">
                    <div className="w-6 h-3.5 border border-amber-600/50 rounded-sm" />
                  </div>
                </div>

                <div className="my-6">
                  <span className="text-[11px] opacity-75">Fatura Atual Prevista</span>
                  <div className="text-2xl font-black">{formatarMoeda(metricas.faturaAtual)}</div>
                </div>

                <div className="flex items-center justify-between text-xs opacity-90 pt-2 border-t border-white/10">
                  <div>
                    <span className="text-[10px] block opacity-70">Fechamento</span>
                    <span className="font-bold">Dia {cartao.fechamento}</span>
                  </div>
                  <div>
                    <span className="text-[10px] block opacity-70">Vencimento</span>
                    <span className="font-bold">Dia {cartao.vencimento}</span>
                  </div>
                  <div>
                    <span className="text-[10px] block opacity-70">Limite Total</span>
                    <span className="font-bold">{formatarMoeda(cartao.limite)}</span>
                  </div>
                </div>
              </div>

              {/* Métricas e Barra de Progresso do Limite */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Limite Utilizado</span>
                  <span className={`font-bold ${isQuaseLotado ? 'text-rose-400' : 'text-white'}`}>
                    {formatarMoeda(metricas.limiteUtilizado)} ({metricas.percentualUtilizado.toFixed(0)}%)
                  </span>
                </div>

                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, metricas.percentualUtilizado)}%`,
                      backgroundColor: isQuaseLotado ? '#ef4444' : cartao.cor
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                  <span>Limite Disponível:</span>
                  <span className="font-bold text-emerald-400">{formatarMoeda(metricas.limiteDisponivel)}</span>
                </div>
              </div>

              {/* Botões do Rodapé */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-800/80">
                {isQuaseLotado && (
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    ⚠️ Limite superior a 80%
                  </span>
                )}
                {!isQuaseLotado && <span />}

                <button
                  onClick={() => excluirCartao(cartao.id)}
                  className="p-2 text-gray-500 hover:text-rose-400 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Novo Cartão */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Cadastrar Novo Cartão de Crédito">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Banco / Emissor</label>
              <input
                type="text"
                required
                placeholder="Ex: Nubank, Itaú, Santander..."
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Nome do Cartão</label>
              <input
                type="text"
                required
                placeholder="Ex: Ultravioleta, Visa Infinite..."
                value={nomeCartao}
                onChange={(e) => setNomeCartao(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Limite Total (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="Ex: 10000"
              value={limite}
              onChange={(e) => setLimite(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Dia do Fechamento (1-31)</label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={fechamento}
                onChange={(e) => setFechamento(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Dia do Vencimento (1-31)</label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Cor do Cartão</label>
            <div className="flex items-center gap-3">
              {['#820ad1', '#ec7000', '#003399', '#cc092f', '#10b981', '#06b6d4', '#1f2937'].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    cor === c ? 'scale-110 border-white' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-gray-950 shadow-lg shadow-cyan-500/20 transition-all"
            >
              Salvar Cartão
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
