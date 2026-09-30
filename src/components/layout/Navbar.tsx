'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Database, Settings, ShieldCheck, Wallet, Bot } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { NotificationBell } from '../notifications/NotificationBell';

export function Navbar() {
  const { profile, isSupabaseConnected } = useFinance();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-gray-800/80 bg-[#0b0f19]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-purple-600 p-[2px] shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">Finance</span>
                <span className="font-black text-lg bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">AI</span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PWA
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-gray-400 font-medium">Copiloto Financeiro Pessoal</p>
            </div>
          </Link>
        </div>

        {/* Central Fast Shortcuts (Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/simulador"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-800/50 rounded-lg hover:bg-cyan-900/50 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Antes de Comprar
          </Link>
          <Link
            href="/assistente"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-300 bg-purple-950/40 border border-purple-800/50 rounded-lg hover:bg-purple-900/50 transition-colors"
          >
            <Bot className="w-3.5 h-3.5" />
            Copiloto IA
          </Link>
          <Link
            href="/saude-financeira"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 rounded-lg hover:bg-emerald-900/50 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Saúde Financeira
          </Link>
        </div>

        {/* Right Section: Status, Notification & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Supabase status badge */}
          <Link
            href="/config"
            title={isSupabaseConnected ? 'Conectado ao Supabase PostgreSQL' : 'Modo Local Ativo (Clique para configurar Supabase)'}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full border transition-colors bg-gray-900/80 border-gray-800 text-gray-300 hover:border-gray-700"
          >
            <Database className={`w-3 h-3 ${isSupabaseConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>{isSupabaseConnected ? 'Supabase Conectado' : 'Modo Local'}</span>
          </Link>

          {/* Notification Bell */}
          <NotificationBell />

          {/* Profile / Settings */}
          <Link
            href="/config"
            className="flex items-center gap-2 p-1 pl-2 text-gray-300 hover:text-white rounded-xl hover:bg-gray-800/60 transition-colors"
            title="Configurações e Perfil"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow">
              {profile.nome?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="hidden lg:inline text-xs font-medium text-gray-200">{profile.nome?.split(' ')[0]}</span>
            <Settings className="w-4 h-4 text-gray-400 hidden sm:inline" />
          </Link>
        </div>
      </div>
    </header>
  );
}
