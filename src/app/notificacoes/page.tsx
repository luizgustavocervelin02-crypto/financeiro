'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, AlertTriangle, AlertCircle, Sparkles, CheckCircle2, Info, Check, Trash2, Smartphone, ShieldCheck } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';

export default function NotificacoesPage() {
  const { notificacoes, marcarNotificacaoLida, limparTodasNotificacoes, profile, atualizarPerfil } = useFinance();
  const [permissaoPush, setPermissaoPush] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  const [testeMsg, setTesteMsg] = useState<string | null>(null);

  const solicitarPermissaoPush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Seu navegador não suporta notificações web.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissaoPush(permission);
      if (permission === 'granted') {
        atualizarPerfil({ preferencias: { ...profile.preferencias, notificacoes_push: true } });
        new Notification('Finance AI', {
          body: 'Notificações push ativadas com sucesso! Você receberá alertas de faturas e limites.',
          icon: '/icons/icon.svg',
        });
        setTesteMsg('Notificações ativadas com sucesso!');
      }
    } catch (e: any) {
      console.warn('Erro ao solicitar permissão de notificações:', e);
    }
  };

  const dispararAlertaTeste = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Alerta Finance AI', {
        body: 'Atenção: Seu cartão Nubank atingiu 82% do limite disponível!',
        icon: '/icons/icon.svg',
      });
      setTesteMsg('Notificação enviada para a tela do seu dispositivo!');
    } else {
      solicitarPermissaoPush();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-black text-white">Central de Alertas & Notificações</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Automações inteligentes para limites de cartão, vencimentos de contas e metas (Fase 3)
          </p>
        </div>

        {notificacoes.length > 0 && (
          <button
            onClick={limparTodasNotificacoes}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-xs text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpar Alertas
          </button>
        )}
      </div>

      {/* Card de Configuração de Notificações Push do PWA */}
      <div className="glass-panel rounded-3xl p-6 border border-purple-500/20 bg-gradient-to-r from-purple-950/20 to-cyan-950/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Notificações Push no Celular e Navegador</h4>
              <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                Receba alertas instantâneos antes de contas vencerem e quando cartões atingirem 80% do limite.
              </p>
              {permissaoPush === 'granted' ? (
                <span className="inline-block mt-2 text-[11px] font-bold text-emerald-400">
                  ✅ Permissão concedida para este aparelho
                </span>
              ) : (
                <span className="inline-block mt-2 text-[11px] text-amber-300">
                  ⚠️ Notificações push ainda não ativadas no navegador
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {permissaoPush !== 'granted' ? (
              <button
                onClick={solicitarPermissaoPush}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all"
              >
                Ativar Notificações
              </button>
            ) : (
              <button
                onClick={dispararAlertaTeste}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-xs font-semibold text-purple-300 transition-colors"
              >
                Enviar Alerta de Teste
              </button>
            )}
          </div>
        </div>

        {testeMsg && (
          <p className="text-xs text-emerald-400 mt-3 pt-3 border-t border-gray-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            {testeMsg}
          </p>
        )}
      </div>

      {/* Lista de Notificações e Alertas Gerados */}
      <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-gray-900/40 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">
            Alertas em Aberto ({notificacoes.filter(n => !n.lida).length})
          </h4>
        </div>

        <div className="divide-y divide-gray-800/60">
          {notificacoes.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mx-auto mb-2" />
              Nenhum alerta pendente. Todas as contas e limites estão em conformidade!
            </div>
          ) : (
            notificacoes.map((item) => (
              <div
                key={item.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  item.lida ? 'opacity-50 bg-gray-900/20' : 'bg-gray-900/40 hover:bg-gray-800/40'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5">
                    {item.tipo === 'urgente' ? (
                      <AlertCircle className="w-5 h-5 text-rose-400" />
                    ) : item.tipo === 'alerta' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    ) : item.tipo === 'sucesso' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Info className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.titulo}</h4>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">{item.mensagem}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {item.link && (
                    <Link
                      href={item.link}
                      className="text-xs font-semibold text-emerald-400 hover:underline"
                    >
                      Acessar Módulo →
                    </Link>
                  )}
                  {!item.lida && (
                    <button
                      onClick={() => marcarNotificacaoLida(item.id)}
                      className="p-1.5 text-xs text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1"
                      title="Marcar como lida"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
