'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarClock, Check, CheckCircle2, Clock } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatarMoeda } from '@/lib/financial-engine/calculations';

export function UpcomingBills() {
  const { contasFuturas, alternarStatusConta } = useFinance();

  const hoje = new Date();
  const diaHoje = hoje.getDate();

  // Ordenar por vencimento
  const contasOrdenadas = [...contasFuturas].sort((a, b) => a.vencimento_dia - b.vencimento_dia);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-gray-800 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-amber-400" />
          <h4 className="text-sm font-bold text-white">Contas Próximas & Fixas</h4>
        </div>
        <Link href="/contas" className="text-xs text-emerald-400 hover:underline font-medium">
          Gerenciar todas →
        </Link>
      </div>

      <div className="mt-3 divide-y divide-gray-800/60 overflow-y-auto max-h-72 flex-1">
        {contasOrdenadas.length === 0 ? (
          <p className="text-xs text-gray-500 py-6 text-center">Nenhuma conta cadastrada.</p>
        ) : (
          contasOrdenadas.map((conta) => {
            const isPago = conta.status === 'pago';
            const diasParaVencer = conta.vencimento_dia - diaHoje;
            const vencido = !isPago && diasParaVencer < 0;
            const venceHoje = !isPago && diasParaVencer === 0;

            return (
              <div key={conta.id} className="py-2.5 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => alternarStatusConta(conta.id)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isPago 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                        : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                    }`}
                    title={isPago ? 'Marcar como pendente' : 'Marcar como pago'}
                  >
                    {isPago ? <Check className="w-4 h-4 stroke-[3]" /> : <Clock className="w-3.5 h-3.5" />}
                  </button>

                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${isPago ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                      {conta.descricao}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-400">Venc. dia {conta.vencimento_dia}</span>
                      {venceHoje && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                          HOJE
                        </span>
                      )}
                      {vencido && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">
                          ATRASADO
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className={`text-xs font-bold ${isPago ? 'text-gray-500' : 'text-white'}`}>
                    {formatarMoeda(conta.valor)}
                  </span>
                  <p className="text-[10px] text-gray-400">
                    {isPago ? 'Pago' : 'Pendente'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
