'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useFinance } from '@/lib/context/FinanceContext';
import { CategoriaReceita, Recorrencia } from '@/lib/types';

interface NovaReceitaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NovaReceitaModal({ isOpen, onClose }: NovaReceitaModalProps) {
  const { adicionarReceita } = useFinance();
  const hoje = new Date().toISOString().split('T')[0];

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState<CategoriaReceita>('salario');
  const [data, setData] = useState(hoje);
  const [recorrencia, setRecorrencia] = useState<Recorrencia>('mensal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valNumerico = parseFloat(valor.replace(',', '.'));
    if (!descricao.trim() || isNaN(valNumerico) || valNumerico <= 0) return;

    adicionarReceita({
      descricao: descricao.trim(),
      valor: valNumerico,
      categoria,
      data,
      recorrencia,
      status: 'recebido',
    });

    setDescricao('');
    setValor('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Nova Receita">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Descrição</label>
          <input
            type="text"
            required
            placeholder="Ex: Salário da Empresa, Consultoria, Rendimentos..."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Data</label>
            <input
              type="date"
              required
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Categoria de Ganho</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaReceita)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="salario">Salário Fixo</option>
              <option value="renda_extra">Renda Extra / Freelance</option>
              <option value="investimentos">Investimentos & Dividendos</option>
              <option value="outros">Outros Ganhos</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Recorrência</label>
            <select
              value={recorrencia}
              onChange={(e) => setRecorrencia(e.target.value as Recorrencia)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="mensal">Mensal (Recorrente)</option>
              <option value="unica">Única (Pontual)</option>
              <option value="anual">Anual (13º / Bônus)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow-lg shadow-emerald-500/20 transition-all"
          >
            Salvar Receita
          </button>
        </div>
      </form>
    </Modal>
  );
}
