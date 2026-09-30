'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  CreditCard, 
  Layers, 
  CalendarClock, 
  Landmark, 
  Target, 
  Sparkles, 
  Bot, 
  ShieldCheck, 
  FileSpreadsheet, 
  BarChart3, 
  Bell, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';

interface MenuItem {
  href: string;
  label: string;
  icon: any;
  cor: string;
  desc: string;
  destaque?: boolean;
  badge?: string;
}

interface MenuGroup {
  titulo: string;
  itens: MenuItem[];
}

export default function MobileMenuPage() {
  const { notificacoes } = useFinance();
  const naoLidas = notificacoes.filter(n => !n.lida).length;

  const grupos: MenuGroup[] = [
    {
      titulo: 'Finanças do Dia a Dia',
      itens: [
        { href: '/receitas', label: 'Receitas & Ganhos', icon: ArrowUpCircle, cor: 'text-emerald-400', desc: 'Salários, rendas extras e proventos' },
        { href: '/despesas', label: 'Despesas & Gastos', icon: ArrowDownCircle, cor: 'text-rose-400', desc: 'Saídas categorizadas' },
        { href: '/cartoes', label: 'Cartões de Crédito', icon: CreditCard, cor: 'text-blue-400', desc: 'Faturas e limites disponíveis' },
        { href: '/parcelas', label: 'Compras Parceladas', icon: Layers, cor: 'text-purple-400', desc: 'Cronograma automático das parcelas' },
        { href: '/contas', label: 'Contas Futuras & Fixas', icon: CalendarClock, cor: 'text-amber-400', desc: 'Vencimentos e despesas recorrentes' },
        { href: '/emprestimos', label: 'Empréstimos', icon: Landmark, cor: 'text-rose-400', desc: 'Amortizações e juros' },
        { href: '/metas', label: 'Metas Financeiras', icon: Target, cor: 'text-emerald-400', desc: 'Reserva e grandes objetivos' },
      ]
    },
    {
      titulo: 'Inteligência Financeira (IA)',
      itens: [
        { href: '/simulador', label: 'Antes de Comprar (Simulador)', icon: Sparkles, cor: 'text-cyan-300', desc: 'Consulte o impacto antes de comprar', destaque: true },
        { href: '/assistente', label: 'Copiloto IA Financeiro', icon: Bot, cor: 'text-purple-300', desc: 'Perguntas e respostas em tempo real', destaque: true },
        { href: '/saude-financeira', label: 'Diagnóstico de Saúde', icon: ShieldCheck, cor: 'text-emerald-400', desc: 'Score 0-100 e comprometimento de renda' },
      ]
    },
    {
      titulo: 'Automações & Sistema',
      itens: [
        { href: '/importacao-csv', label: 'Importação de Extrato CSV', icon: FileSpreadsheet, cor: 'text-amber-400', desc: 'Importe arquivos de qualquer banco' },
        { href: '/relatorios', label: 'Relatórios Mensais', icon: BarChart3, cor: 'text-cyan-400', desc: 'Resumo e evolução patrimonial' },
        { href: '/notificacoes', label: 'Central de Alertas', icon: Bell, cor: 'text-rose-400', desc: 'Notificações push e limites', badge: naoLidas > 0 ? `${naoLidas} novos` : undefined },
        { href: '/config', label: 'Configurações & Supabase', icon: Settings, cor: 'text-gray-400', desc: 'Perfil, chaves de API e backup' },
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-black text-white">Menu Completo</h1>
        <p className="text-xs text-gray-400 mt-1">Todos os módulos e recursos do Finance AI</p>
      </div>

      <div className="space-y-6">
        {grupos.map((g, gIdx) => (
          <div key={gIdx} className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">
              {g.titulo}
            </h3>

            <div className="glass-panel rounded-2xl border border-gray-800 divide-y divide-gray-800/60 overflow-hidden">
              {g.itens.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="p-3.5 flex items-center justify-between hover:bg-gray-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 flex-shrink-0">
                        <Icon className={`w-5 h-5 ${item.cor}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              {item.badge}
                            </span>
                          )}
                          {item.destaque && (
                            <span className="text-[9px] font-bold uppercase px-1 py-0.5 rounded bg-purple-500/20 text-purple-300">
                              IA
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 truncate">{item.desc}</p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
