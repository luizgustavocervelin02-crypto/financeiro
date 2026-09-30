'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
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
  Settings 
} from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';

interface SidebarItem {
  href: string;
  label: string;
  icon: any;
  cor?: string;
  destaque?: boolean;
  badge?: string;
}

interface SidebarGroup {
  titulo: string;
  itens: SidebarItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { notificacoes } = useFinance();
  const naoLidas = notificacoes.filter(n => !n.lida).length;

  const grupos: SidebarGroup[] = [
    {
      titulo: 'Principal',
      itens: [
        { href: '/', label: 'Visão Geral', icon: LayoutDashboard },
        { href: '/receitas', label: 'Receitas', icon: ArrowUpCircle, cor: 'text-emerald-400' },
        { href: '/despesas', label: 'Despesas', icon: ArrowDownCircle, cor: 'text-rose-400' },
        { href: '/cartoes', label: 'Cartões de Crédito', icon: CreditCard },
        { href: '/parcelas', label: 'Compras Parceladas', icon: Layers },
        { href: '/contas', label: 'Contas Futuras', icon: CalendarClock },
        { href: '/emprestimos', label: 'Empréstimos', icon: Landmark },
        { href: '/metas', label: 'Metas Financeiras', icon: Target },
      ]
    },
    {
      titulo: 'Inteligência Financeira (IA)',
      itens: [
        { href: '/simulador', label: 'Antes de Comprar', icon: Sparkles, destaque: true },
        { href: '/assistente', label: 'Copiloto IA', icon: Bot, destaque: true },
        { href: '/saude-financeira', label: 'Saúde Financeira', icon: ShieldCheck },
      ]
    },
    {
      titulo: 'Automações & Dados',
      itens: [
        { href: '/importacao-csv', label: 'Importação CSV', icon: FileSpreadsheet },
        { href: '/relatorios', label: 'Relatórios Mensais', icon: BarChart3 },
        { href: '/notificacoes', label: 'Alertas', icon: Bell, badge: naoLidas > 0 ? String(naoLidas) : undefined },
        { href: '/config', label: 'Configurações', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="hidden sm:flex flex-col w-64 min-h-[calc(100vh-4rem)] bg-[#0e1422] border-r border-gray-800/80 p-4 sticky top-16">
      <div className="flex-1 space-y-6 overflow-y-auto pr-1">
        {grupos.map((grupo, idx) => (
          <div key={idx}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3">
              {grupo.titulo}
            </span>
            <div className="mt-2 space-y-1">
              {grupo.itens.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 text-white border border-emerald-500/30 shadow-sm'
                        : item.destaque
                        ? 'text-cyan-300 hover:bg-cyan-950/40 hover:text-white'
                        : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : item.cor || (item.destaque ? 'text-cyan-400' : 'text-gray-400')}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {item.badge}
                      </span>
                    )}

                    {item.destaque && !isActive && (
                      <span className="text-[9px] font-bold uppercase px-1 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        IA
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Mini Financial Score Card on bottom of sidebar */}
      <div className="pt-4 border-t border-gray-800/80 mt-auto">
        <Link
          href="/saude-financeira"
          className="block p-3 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-emerald-500/30 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">Score de Saúde</span>
            <span className="text-xs font-bold text-emerald-400">Ver Diagnóstico →</span>
          </div>
          <p className="text-sm font-semibold text-white mt-1">Copiloto Ativo ⚡</p>
        </Link>
      </div>
    </aside>
  );
}
