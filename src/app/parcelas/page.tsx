'use client';

import React, { useState } from 'react';
import { Layers, Plus, Calendar, CheckCircle2, Clock, Trash2, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatarMoeda, formatarDataBR } from '@/lib/financial-engine/calculations';
import { Modal } from '@/components/ui/Modal';
import { CategoriaDespesa } from '@/lib/types';

export default function ParcelasPage() {
  const { comprasParceladas, adicionarCompraParcelada, excluirCompraParcelada, alternarStatusParcela, cartoes } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [compraAberta, setCompraAberta] = useState<string | null>(comprasParceladas[0]?.id || null);

  // Form states
  const hoje = new Date().toISOString().split('T')[0];
  const [descricao, setDescricao] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [totalParcelas, setTotalParcelas] = useState('12');
  const [dataInicio, setDataInicio] = useState(hoje);
  const [cartaoId, setCartaoId] = useState(cartoes[0]?.id || '');
  const [categoria, setCategoria] = useState<CategoriaDespesa>('compras');

  const valorTotalNum = parseFloat(valorTotal.replace(',', '.')) || 0;
  const numParcelasInt = parseInt(totalParcelas) || 1;
  const valorParcelaCalculado = numParcelasInt > 0 ? (valorTotalNum / numParcelasInt).toFixed(2) : '0,00';

  const todasParcelas = comprasParceladas.flatMap(c => c.parcelas || []);
  const parcelasPendentes = todasParcelas.filter(p => p.status === 'pendente');
  const totalComprometido = parcelasPendentes.reduce((sum, p) => sum + p.valor, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim() || valorTotalNum <= 0 || numParcelasInt <= 1) return;

    adicionarCompraParcelada({
      descricao: descricao.trim(),
      valor_total: valorTotalNum,
      total_parcelas: numParcelasInt,
      data_inicio: dataInicio,
      cartao_id: cartaoId || undefined,
      categoria,
    });

    setDescricao('');
    setValorTotal('');
    setTotalParcelas('12');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-black text-white">Compras Parceladas</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Geração automática das parcelas mês a mês e linha do tempo de quitação
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nova Compra Parcelada
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-purple-500/20">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">Total Futuro Comprometido</span>
          <h3 className="text-2xl font-black text-white mt-1">{formatarMoeda(totalComprometido)}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">{parcelasPendentes.length} parcelas restantes</p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-gray-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">Compras Parceladas Ativas</span>
          <h3 className="text-2xl font-black text-cyan-300 mt-1">{comprasParceladas.length} compras</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Em andamento</p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-gray-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Parcelas Pagas</span>
          <h3 className="text-2xl font-black text-emerald-300 mt-1">
            {todasParcelas.filter(p => p.status === 'pago').length} de {todasParcelas.length}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Histórico liquidado</p>
        </div>
      </div>

      {/* Lista de Compras Parceladas com Dropdown de Parcelas Mês a Mês */}
      <div className="space-y-4">
        {comprasParceladas.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center text-gray-400">
            Nenhuma compra parcelada registrada. Cadastre sua primeira compra (ex: Notebook 12x de R$ 500).
          </div>
        ) : (
          comprasParceladas.map((compra) => {
            const isAberta = compraAberta === compra.id;
            const parcelasPagas = (compra.parcelas || []).filter(p => p.status === 'pago').length;
            const percentualConcluido = compra.total_parcelas > 0 ? (parcelasPagas / compra.total_parcelas) * 100 : 0;
            const cartaoVinculado = cartoes.find(c => c.id === compra.cartao_id);

            return (
              <div
                key={compra.id}
                className="glass-panel rounded-2xl border border-gray-800 overflow-hidden transition-all"
              >
                {/* Cabeçalho da Compra */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/40">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 mt-0.5">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{compra.descricao}</h3>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {compra.total_parcelas}x de {formatarMoeda(compra.valor_parcela)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span>Total: <strong className="text-white">{formatarMoeda(compra.valor_total)}</strong></span>
                        <span>•</span>
                        <span>Início: {formatarDataBR(compra.data_inicio)}</span>
                        {cartaoVinculado && (
                          <>
                            <span>•</span>
                            <span className="text-cyan-400 flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5" />
                              {cartaoVinculado.nome_cartao}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Progresso de quitação */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="w-48 sm:w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${percentualConcluido}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-300 font-semibold">
                          {parcelasPagas}/{compra.total_parcelas} pagas ({percentualConcluido.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-800">
                    <button
                      onClick={() => setCompraAberta(isAberta ? null : compra.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 transition-colors"
                    >
                      <span>{isAberta ? 'Ocultar Meses' : 'Ver Todas as Parcelas'}</span>
                      {isAberta ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => excluirCompraParcelada(compra.id)}
                      className="p-2 text-gray-500 hover:text-rose-400 hover:bg-gray-800 rounded-lg transition-colors"
                      title="Excluir parcelamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Grade detalhada das parcelas geradas automaticamente */}
                {isAberta && (
                  <div className="p-4 sm:p-5 border-t border-gray-800 bg-[#0a0f1d] animate-in fade-in duration-200">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Cronograma Automático das Parcelas:
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {(compra.parcelas || []).map((parc) => {
                        const isPago = parc.status === 'pago';

                        return (
                          <div
                            key={parc.id}
                            className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                              isPago
                                ? 'bg-emerald-950/20 border-emerald-500/30'
                                : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white">
                                  Parcela {parc.numero_parcela}/{compra.total_parcelas}
                                </span>
                                {isPago ? (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                                    PAGA
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                                    PENDENTE
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                Ref: {parc.mes_referencia} • Venc: {formatarDataBR(parc.data_vencimento)}
                              </p>
                              <p className="text-xs font-black text-purple-300 mt-1">
                                {formatarMoeda(parc.valor)}
                              </p>
                            </div>

                            <button
                              onClick={() => alternarStatusParcela(compra.id, parc.id)}
                              className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                                isPago
                                  ? 'bg-emerald-500 text-gray-950 hover:bg-emerald-400'
                                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                              }`}
                              title={isPago ? 'Marcar como pendente' : 'Marcar parcela como paga'}
                            >
                              {isPago ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Nova Compra Parcelada */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nova Compra Parcelada">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Descrição do Produto ou Serviço</label>
            <input
              type="text"
              required
              placeholder="Ex: Notebook Dell XPS, Smartphone, Geladeira..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Valor Total (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="6000,00"
                value={valorTotal}
                onChange={(e) => setValorTotal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Qtd. de Parcelas</label>
              <input
                type="number"
                min="2"
                max="72"
                required
                value={totalParcelas}
                onChange={(e) => setTotalParcelas(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Prévia automática do valor da parcela */}
          {valorTotalNum > 0 && numParcelasInt > 1 && (
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between text-xs">
              <span className="text-gray-300">Valor de cada parcela gerada:</span>
              <span className="font-extrabold text-purple-300 text-sm">
                {numParcelasInt}x de {formatarMoeda(Number(valorParcelaCalculado))}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Data da 1ª Parcela</label>
              <input
                type="date"
                required
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Vincular a Cartão</label>
              <select
                value={cartaoId}
                onChange={(e) => setCartaoId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="">Nenhum (Geral)</option>
                {cartoes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.banco} - {c.nome_cartao}
                  </option>
                ))}
              </select>
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
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-500 hover:bg-purple-400 text-white shadow-lg shadow-purple-500/20 transition-all"
            >
              Gerar Parcelas Automaticamente
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
