'use client';

import React, { useState } from 'react';
import { CalendarClock, Plus, Check, Clock, Trash2, Home, Wifi, Zap, Repeat } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatarMoeda } from '@/lib/financial-engine/calculations';
import { Modal } from '@/components/ui/Modal';
import { CategoriaDespesa } from '@/lib/types';

export default function ContasPage() {
  const { contasFuturas, adicionarContaFutura, alternarStatusConta, excluirContaFutura } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [vencimentoDia, setVencimentoDia] = useState('10');
  const [categoria, setCategoria] = useState<CategoriaDespesa>('moradia');
  const [fixa, setFixa] = useState(true);

  const hoje = new Date();
  const diaHoje = hoje.getDate();

  const totalPendentes = contasFuturas
    .filter(c => c.status === 'pendente')
    .reduce((sum, c) => sum + c.valor, 0);

  const totalPagas = contasFuturas
    .filter(c => c.status === 'pago')
    .reduce((sum, c) => sum + c.valor, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valor.replace(',', '.'));
    const dia = parseInt(vencimentoDia);
    if (!descricao.trim() || isNaN(val) || val <= 0 || isNaN(dia)) return;

    adicionarContaFutura({
      descricao: descricao.trim(),
      valor: val,
      vencimento_dia: dia,
      data_proximo_vencimento: `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`,
      categoria,
      fixa,
      status: 'pendente',
    });

    setDescricao('');
    setValor('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-black text-white">Contas Futuras & Fixas</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">Gerencie vencimentos, contas recorrentes e compromissos do mês</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nova Conta Fixa
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-amber-500/20">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">Total a Pagar no Mês</span>
          <h3 className="text-2xl font-black text-amber-300 mt-1">{formatarMoeda(totalPendentes)}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {contasFuturas.filter(c => c.status === 'pendente').length} contas pendentes
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-emerald-500/20">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Total Já Liquidado</span>
          <h3 className="text-2xl font-black text-emerald-300 mt-1">{formatarMoeda(totalPagas)}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {contasFuturas.filter(c => c.status === 'pago').length} contas pagas
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-gray-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Custo Fixo Total</span>
          <h3 className="text-2xl font-black text-white mt-1">{formatarMoeda(totalPendentes + totalPagas)}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Orçamento mensal comprometido</p>
        </div>
      </div>

      {/* Lista de Contas Futuras */}
      <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-gray-900/40 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">Compromissos Recorrentes</h4>
          <span className="text-xs text-gray-400">{contasFuturas.length} contas cadastradas</span>
        </div>

        <div className="divide-y divide-gray-800/60">
          {contasFuturas.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-400">
              Nenhuma conta futura cadastrada. Registre contas como Internet, Aluguel, Luz, etc.
            </div>
          ) : (
            contasFuturas.map((conta) => {
              const isPago = conta.status === 'pago';
              const dias = conta.vencimento_dia - diaHoje;
              const vencido = !isPago && dias < 0;
              const venceHoje = !isPago && dias === 0;

              return (
                <div
                  key={conta.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => alternarStatusConta(conta.id)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all mt-0.5 ${
                        isPago
                          ? 'bg-emerald-500 text-gray-950 font-bold shadow-md shadow-emerald-500/20'
                          : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                      }`}
                      title={isPago ? 'Marcar como pendente' : 'Marcar como pago'}
                    >
                      {isPago ? <Check className="w-5 h-5 stroke-[3]" /> : <Clock className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold ${isPago ? 'line-through text-gray-500' : 'text-white'}`}>
                          {conta.descricao}
                        </h4>
                        {conta.fixa && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                            <Repeat className="w-2.5 h-2.5" />
                            Fixa
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-gray-300 font-medium">
                          Vencimento todo dia {conta.vencimento_dia}
                        </span>

                        {venceHoje && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            VENCE HOJE
                          </span>
                        )}
                        {vencido && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            ATRASADA
                          </span>
                        )}
                        {!isPago && dias > 0 && (
                          <span className="text-[11px] text-gray-400">
                            (em {dias} dias)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <span className={`text-base font-extrabold ${isPago ? 'text-gray-500' : 'text-amber-400'}`}>
                        {formatarMoeda(conta.valor)}
                      </span>
                      <p className="text-[10px] text-gray-400">
                        Status: <strong className={isPago ? 'text-emerald-400' : 'text-amber-400'}>{isPago ? 'Liquidado' : 'A Pagar'}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => excluirContaFutura(conta.id)}
                      className="p-2 text-gray-500 hover:text-rose-400 hover:bg-gray-800 rounded-lg transition-colors"
                      title="Excluir conta"
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

      {/* Modal Nova Conta */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Cadastrar Nova Conta Fixa / Futura">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Descrição</label>
            <input
              type="text"
              required
              placeholder="Ex: Internet Fibra, Aluguel, Luz, Netflix..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Valor Mensal (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="100,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Dia do Vencimento (1 a 31)</label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={vencimentoDia}
                onChange={(e) => setVencimentoDia(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaDespesa)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="moradia">Moradia (Aluguel, Condomínio, IPTU)</option>
              <option value="assinaturas">Assinaturas & Telecom (Internet, Streaming)</option>
              <option value="transporte">Transporte (IPVA, Seguro)</option>
              <option value="saude">Saúde (Plano de Saúde)</option>
              <option value="educacao">Educação (Faculdade, Cursos)</option>
              <option value="outros">Outros Fixos</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="fixaCheck"
              checked={fixa}
              onChange={(e) => setFixa(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-gray-900 border-gray-700"
            />
            <label htmlFor="fixaCheck" className="text-xs text-gray-300 cursor-pointer">
              Conta fixa mensal recorrente
            </label>
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
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-gray-950 shadow-lg shadow-amber-500/20 transition-all"
            >
              Salvar Conta Fixa
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
