'use client';

import React, { ReactNode } from 'react';

interface StatCardProps {
  titulo: string;
  valor: string;
  subtitulo?: string;
  icone: ReactNode;
  corIcone?: string;
  badge?: {
    texto: string;
    tipo?: 'positivo' | 'negativo' | 'neutro' | 'alerta';
  };
  onClick?: () => void;
}

export function StatCard({
  titulo,
  valor,
  subtitulo,
  icone,
  corIcone = 'bg-emerald-500/10 text-emerald-400',
  badge,
  onClick,
}: StatCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`glass-panel rounded-2xl p-5 relative overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-gray-700 hover:bg-gray-800/40 active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">{titulo}</span>
        <div className={`p-2.5 rounded-xl ${corIcone} flex items-center justify-center shadow-inner`}>
          {icone}
        </div>
      </div>

      <div className="mt-3">
        <h4 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{valor}</h4>
        
        <div className="flex items-center gap-2 mt-2">
          {badge && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                badge.tipo === 'positivo'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : badge.tipo === 'negativo'
                  ? 'bg-rose-500/15 text-rose-400'
                  : badge.tipo === 'alerta'
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {badge.texto}
            </span>
          )}
          {subtitulo && <p className="text-xs text-gray-400">{subtitulo}</p>}
        </div>
      </div>
    </div>
  );
}
