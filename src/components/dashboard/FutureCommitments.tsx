'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, CreditCard, Landmark, ChevronRight } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatarMoeda, calcularMetricasCartao, calcularMetricasEmprestimo } from '@/lib/financial-engine/calculations';

export function FutureCommitments() {
  const { cartoes, comprasParceladas, emprestimos, despesas } = useFinance();

  const todasParcelas = comprasParceladas.flatMap(c => c.parcelas || []);
  const parcelasPendentes = todasParcelas.filter(p => p.status === 'pendente');
  const totalParcelasFuturas = parcelasPendentes.reduce((sum, p) => sum + p.valor, 0);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-gray-800 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          <h4 className="text-sm font-bold text-white">Compromissos Futuros</h4>
        </div>
        <Link href="/parcelas" className="text-xs text-purple-400 hover:underline font-medium">
          Ver parcelas →
        </Link>
      </div>

      <div className="mt-3 space-y-4 flex-1">
        {/* Bloco 1: Cartões e Limites */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Cartões de Crédito</span>
            <Link href="/cartoes" className="text-[11px] text-gray-400 hover:text-white flex items-center">
              Detalhes <ChevronRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>

          {cartoes.slice(0, 2).map(cartao => {
            const metrica = calcularMetricasCartao(cartao, despesas, todasParcelas);
            return (
              <div key={cartao.id} className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cartao.cor }} />
                    <span className="text-xs font-bold text-white">{cartao.nome_cartao}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-200">
                    {formatarMoeda(metrica.faturaAtual)} <span className="text-[10px] text-gray-400">neste mês</span>
                  </span>
                </div>

                {/* Barra de Limite */}
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span>Uso: {metrica.percentualUtilizado.toFixed(0)}%</span>
                    <span>Disponível: {formatarMoeda(metrica.limiteDisponivel)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, metrica.percentualUtilizado)}%`,
                        backgroundColor: metrica.percentualUtilizado > 80 ? '#ef4444' : cartao.cor
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bloco 2: Resumo de Compras Parceladas */}
        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300">Total em Parcelas Futuras</span>
            <span className="text-sm font-bold text-white">{formatarMoeda(totalParcelasFuturas)}</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Distribuído em {comprasParceladas.length} compras parceladas ativas
          </p>
        </div>

        {/* Bloco 3: Empréstimos Ativos */}
        {emprestimos.length > 0 && (
          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
            {emprestimos.slice(0, 1).map(emp => {
              const met = calcularMetricasEmprestimo(emp);
              return (
                <div key={emp.id}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-cyan-300">{emp.banco} ({emp.descricao || 'Empréstimo'})</span>
                    <span className="text-xs font-bold text-white">{formatarMoeda(emp.valor_parcela)}/mês</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1.5">
                    <span>{emp.parcelas_pagas} de {emp.quantidade_parcelas} parcelas pagas</span>
                    <span>Dívida Restante: {formatarMoeda(met.dividaAtual)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
