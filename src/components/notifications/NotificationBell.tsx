'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, AlertTriangle, AlertCircle, Sparkles, CheckCircle2, Info, Check, Trash2 } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';

export function NotificationBell() {
  const { notificacoes, marcarNotificacaoLida, limparTodasNotificacoes } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const naoLidas = notificacoes.filter(n => !n.lida);
  const totalNaoLidas = naoLidas.length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcone = (tipo: string) => {
    switch (tipo) {
      case 'urgente':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'alerta':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'ia_insight':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'sucesso':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white rounded-xl hover:bg-gray-800/80 transition-colors focus:outline-none"
        title="Alertas e Notificações"
      >
        <Bell className="w-5 h-5" />
        {totalNaoLidas > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
            {totalNaoLidas > 9 ? '9+' : totalNaoLidas}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#111827] border border-gray-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/60">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white">Alertas Inteligentes</h4>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                {totalNaoLidas} novos
              </span>
            </div>
            {notificacoes.length > 0 && (
              <button
                onClick={limparTodasNotificacoes}
                className="text-xs text-gray-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                title="Limpar todos os alertas"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-800/60">
            {notificacoes.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mx-auto mb-2" />
                Nenhum alerta pendente no momento. Suas finanças estão sob controle!
              </div>
            ) : (
              notificacoes.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 transition-colors hover:bg-gray-800/50 ${
                    item.lida ? 'opacity-60 bg-gray-900/20' : 'bg-gray-900/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">{getIcone(item.tipo)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white">{item.titulo}</p>
                      <p className="text-xs text-gray-300 mt-1 leading-relaxed">{item.mensagem}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {item.link && (
                          <Link
                            href={item.link}
                            onClick={() => {
                              marcarNotificacaoLida(item.id);
                              setIsOpen(false);
                            }}
                            className="text-[11px] font-medium text-emerald-400 hover:underline"
                          >
                            Ver detalhes →
                          </Link>
                        )}
                        {!item.lida && (
                          <button
                            onClick={() => marcarNotificacaoLida(item.id)}
                            className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Marcar lida
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-gray-900/80 border-t border-gray-800 text-center">
            <Link
              href="/notificacoes"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
            >
              Ver Central de Notificações Completa
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
