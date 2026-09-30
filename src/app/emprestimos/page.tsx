'use client';

import React, { useState } from 'react';
import { Landmark, Plus, Trash2, CheckCircle2, AlertTriangle, Percent, Calendar } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatarMoeda, formatarDataBR, calcularMetricasEmprestimo } from '@/lib/financial-engine/calculations';
import { Modal } from '@/components/ui/Modal';

export default function EmprestimosPage() {
  const { emprestimos, adicionarEmprestimo, registrarPagamentoEmprestimo, excluirEmprestimo } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const hoje = new Date().toISOString().split('T')[0];
  const [banco, setBanco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valorContratado, setValorContratado] = useState('');
  const [quantidadeParcelas, setQuantidadeParcelas] = useState('24');
  const [valorParcela, setValorParcela] = useState('');
  const [taxaJuros, setTaxaJuros] = useState('1.5');
  const [parcelasPagas, setParcelasPagas] = useState('0');
  const [dataInicio, setDataInicio] = useState(hoje);

  // Totais
  const totalDividaAtual = emprestimos.reduce((sum, e) => {
    const met = calcularMetricasEmprestimo(e);
    return sum + met.dividaAtual;
  }, 0);

  const totalComprometimentoMensal = emprestimos.reduce((sum, e) => {
    const met = calcularMetricasEmprestimo(e);
    return sum + (met.parcelasRestantes > 0 ? e.valor_parcela : 0);
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valContr = parseFloat(valorContratado.replace(',', '.'));
    const qtdParc = parseInt(quantidadeParcelas);
    const valParc = parseFloat(valorParcela.replace(',', '.'));
    const juros = parseFloat(taxaJuros.replace(',', '.')) || 0;
    const pagas = parseInt(parcelasPagas) || 0;

    if (!banco.trim() || isNaN(valContr) || isNaN(qtdParc) || isNaN(valParc)) return;

    adicionarEmprestimo({
      banco: banco.trim(),
      descricao: descricao.trim() || 'Empréstimo Pessoal',
      valor_contratado: valContr,
      quantidade_parcelas: qtdParc,
      valor_parcela: valParc,
      taxa_juros: juros,
      parcelas_pagas: pagas,
      data_inicio: dataInicio,
    });

    setBanco('');
    setDescricao('');
    setValorContratado('');
    setValorParcela('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-6 h-6 text-rose-400" />
            <h1 className="text-2xl font-black text-white">Empréstimos & Financiamentos</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Controle de saldo devedor, juros, amortização e comprometimento futuro
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Novo Empréstimo
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-rose-500/20">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">Dívida Atual Restante</span>
          <h3 className="text-2xl font-black text-white mt-1">{formatarMoeda(totalDividaAtual)}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Saldo devedor total acumulado</p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-gray-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">Parcelas Mensais</span>
          <h3 className="text-2xl font-black text-amber-300 mt-1">{formatarMoeda(totalComprometimentoMensal)}/mês</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Impacto no fluxo mensal</p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-gray-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">Contratos Ativos</span>
          <h3 className="text-2xl font-black text-cyan-300 mt-1">{emprestimos.length} contratos</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Instituições bancárias</p>
        </div>
      </div>

      {/* Lista de Empréstimos */}
      <div className="space-y-4">
        {emprestimos.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center text-gray-400">
            Nenhum empréstimo cadastrado. Ótima notícia! Se tiver algum financiamento ou empréstimo, registre-o aqui.
          </div>
        ) : (
          emprestimos.map((emp) => {
            const met = calcularMetricasEmprestimo(emp);
            const quitado = met.parcelasRestantes === 0;

            return (
              <div
                key={emp.id}
                className="glass-panel rounded-2xl p-5 border border-gray-800 hover:border-gray-700 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{emp.banco}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                          {emp.descricao || 'Empréstimo'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Início: {formatarDataBR(emp.data_inicio)} • Taxa: <strong className="text-amber-300">{emp.taxa_juros}% a.m.</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!quitado && (
                      <button
                        onClick={() => registrarPagamentoEmprestimo(emp.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Pagar +1 Parcela
                      </button>
                    )}

                    <button
                      onClick={() => excluirEmprestimo(emp.id)}
                      className="p-2 text-gray-500 hover:text-rose-400 hover:bg-gray-800 rounded-lg transition-colors"
                      title="Excluir empréstimo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Métricas do Empréstimo */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-gray-900/60 border border-gray-800/80">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase">Valor Contratado</span>
                    <span className="text-sm font-bold text-white">{formatarMoeda(emp.valor_contratado)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase">Valor da Parcela</span>
                    <span className="text-sm font-bold text-amber-300">{formatarMoeda(emp.valor_parcela)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase">Parcelas Restantes</span>
                    <span className="text-sm font-bold text-white">
                      {met.parcelasRestantes} de {emp.quantidade_parcelas}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase">Dívida Atual Restante</span>
                    <span className="text-sm font-black text-rose-400">{formatarMoeda(met.dividaAtual)}</span>
                  </div>
                </div>

                {/* Barra de Progresso da Quitação */}
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Progresso de Quitação: {met.progressoQuitacao.toFixed(0)}%</span>
                    <span>{emp.parcelas_pagas} pagas ({formatarMoeda(emp.parcelas_pagas * emp.valor_parcela)})</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${met.progressoQuitacao}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Novo Empréstimo */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Cadastrar Empréstimo ou Financiamento">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Banco / Financeira</label>
              <input
                type="text"
                required
                placeholder="Ex: Banco do Brasil, Caixa, Nubank..."
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Finalidade / Descrição</label>
              <input
                type="text"
                placeholder="Ex: Financiamento Veicular, Reforma..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Valor Contratado (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="Ex: 15000"
                value={valorContratado}
                onChange={(e) => setValorContratado(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Valor da Parcela (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="Ex: 750"
                value={valorParcela}
                onChange={(e) => setValorParcela(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Qtd. Parcelas</label>
              <input
                type="number"
                min="1"
                required
                value={quantidadeParcelas}
                onChange={(e) => setQuantidadeParcelas(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Parcelas Pagas</label>
              <input
                type="number"
                min="0"
                required
                value={parcelasPagas}
                onChange={(e) => setParcelasPagas(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Juros (% a.m.)</label>
              <input
                type="number"
                step="0.01"
                value={taxaJuros}
                onChange={(e) => setTaxaJuros(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Data de Início</label>
            <input
              type="date"
              required
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
            />
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
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20 transition-all"
            >
              Salvar Empréstimo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
