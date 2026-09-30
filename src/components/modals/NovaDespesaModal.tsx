'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useFinance } from '@/lib/context/FinanceContext';
import { CategoriaDespesa, FormaPagamento } from '@/lib/types';

interface NovaDespesaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NovaDespesaModal({ isOpen, onClose }: NovaDespesaModalProps) {
  const { adicionarDespesa, cartoes } = useFinance();
  const hoje = new Date().toISOString().split('T')[0];

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState<CategoriaDespesa>('alimentacao');
  const [data, setData] = useState(hoje);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('pix');
  const [cartaoId, setCartaoId] = useState(cartoes[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valNumerico = parseFloat(valor.replace(',', '.'));
    if (!descricao.trim() || isNaN(valNumerico) || valNumerico <= 0) return;

    adicionarDespesa({
      descricao: descricao.trim(),
      valor: valNumerico,
      categoria,
      data,
      forma_pagamento: formaPagamento,
      cartao_id: formaPagamento === 'credito' ? cartaoId : undefined,
      status: 'pago',
    });

    setDescricao('');
    setValor('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Nova Despesa">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Descrição</label>
          <input
            type="text"
            required
            placeholder="Ex: Supermercado, Gasolina, Almoço..."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Data</label>
            <input
              type="date"
              required
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaDespesa)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
            >
              <option value="alimentacao">Alimentação</option>
              <option value="transporte">Transporte</option>
              <option value="moradia">Moradia</option>
              <option value="lazer">Lazer</option>
              <option value="saude">Saúde</option>
              <option value="compras">Compras</option>
              <option value="assinaturas">Assinaturas</option>
              <option value="educacao">Educação</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Forma de Pagamento</label>
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
            >
              <option value="pix">PIX</option>
              <option value="credito">Cartão de Crédito</option>
              <option value="debito">Cartão de Débito</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="boleto">Boleto</option>
              <option value="transferencia">Transferência</option>
            </select>
          </div>
        </div>

        {formaPagamento === 'credito' && (
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Selecionar Cartão</label>
            <select
              value={cartaoId}
              onChange={(e) => setCartaoId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
            >
              {cartoes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.banco} - {c.nome_cartao}
                </option>
              ))}
            </select>
          </div>
        )}

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
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20 transition-all"
          >
            Salvar Despesa
          </button>
        </div>
      </form>
    </Modal>
  );
}
