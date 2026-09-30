'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowDownCircle, Sparkles, Bot, Menu } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Início', icon: LayoutDashboard },
    { href: '/despesas', label: 'Despesas', icon: ArrowDownCircle },
    { href: '/simulador', label: 'Simulador', icon: Sparkles, highlight: true },
    { href: '/assistente', label: 'Copiloto IA', icon: Bot },
    { href: '/menu', label: 'Mais', icon: Menu },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d131f]/95 backdrop-blur-lg border-t border-gray-800/80 px-2 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around">
        {links.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-5 group"
              >
                <div className={`w-12 h-12 rounded-full p-[2px] shadow-lg transition-transform group-active:scale-95 ${
                  isActive 
                    ? 'bg-gradient-to-tr from-cyan-400 via-emerald-400 to-purple-500 shadow-cyan-500/20' 
                    : 'bg-gradient-to-tr from-cyan-500 to-purple-600 shadow-purple-500/20'
                }`}>
                  <div className="w-full h-full bg-[#0b0f19] rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-cyan-300" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-cyan-300 mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
