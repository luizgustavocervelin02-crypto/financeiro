'use client';

import React, { useState } from 'react';
import { Settings, User, Database, Sparkles, Sliders, RotateCcw, Download, CheckCircle2, Shield } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';

export default function ConfigPage() {
  const { profile, atualizarPerfil, restaurarDadosPadrao, isSupabaseConnected } = useFinance();

  const [nome, setNome] = useState(profile.nome || '');
  const [email, setEmail] = useState(profile.email || '');
  const [geminiKey, setGeminiKey] = useState(profile.preferencias.geminiApiKey || '');
  const [limiteAlerta, setLimiteAlerta] = useState(String(profile.preferencias.alerta_limite_cartao || 80));
  const [salvoMsg, setSalvoMsg] = useState(false);

  const handleSalvarPerfil = (e: React.FormEvent) => {
    e.preventDefault();
    atualizarPerfil({
      nome,
      email,
      preferencias: {
        ...profile.preferencias,
        geminiApiKey: geminiKey.trim() || undefined,
        alerta_limite_cartao: parseInt(limiteAlerta) || 80,
      }
    });

    setSalvoMsg(true);
    setTimeout(() => setSalvoMsg(false), 3000);
  };

  const handleExportarBackup = () => {
    try {
      const data = localStorage.getItem('finance_ai_store_v1');
      if (!data) return;
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_finance_ai_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Erro ao exportar backup');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-400" />
          <h1 className="text-2xl font-black text-white">Configurações & Conexões</h1>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Gerencie seu perfil, conexão com o banco de dados Supabase e chave de Inteligência Artificial Gemini
        </p>
      </div>

      {salvoMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Configurações salvas com sucesso!</span>
        </div>
      )}

      {/* 1. Perfil e Preferências */}
      <div className="glass-panel rounded-3xl p-6 border border-gray-800 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
          <User className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Perfil do Usuário</h3>
        </div>

        <form onSubmit={handleSalvarPerfil} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Seu Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <label className="text-xs font-bold text-white">Chave API Google Gemini (Gratuita)</label>
            </div>
            <input
              type="password"
              placeholder="Cole sua Gemini API Key (opcional, já há motor inteligente ativo)"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-purple-500"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Obtenha gratuitamente em <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-purple-400 underline">aistudio.google.com</a>. Caso não informe, o app utiliza o motor analítico local integrado.
            </p>
          </div>

          <div className="pt-2 border-t border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <label className="text-xs font-bold text-white">Alerta de Limite do Cartão (%)</label>
            </div>
            <input
              type="number"
              min="50"
              max="99"
              value={limiteAlerta}
              onChange={(e) => setLimiteAlerta(e.target.value)}
              className="w-48 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Dispara alerta quando qualquer cartão atingir este percentual de uso (padrão: 80%).
            </p>
          </div>

          <div className="pt-4 border-t border-gray-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow-lg shadow-emerald-500/20 transition-all"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>

      {/* 2. Banco de Dados Supabase */}
      <div className="glass-panel rounded-3xl p-6 border border-gray-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
          <Database className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Banco de Dados Supabase (PostgreSQL)</h3>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <div>
              <p className="text-xs font-bold text-white">
                {isSupabaseConnected ? 'Conectado ao Supabase PostgreSQL' : 'Modo Demonstração & Local Storage Ativo'}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {isSupabaseConnected
                  ? 'Seus dados estão sendo sincronizados com sua nuvem PostgreSQL segura.'
                  : 'Seus dados estão sendo salvos com segurança no seu navegador. O script SQL completo está pronto em /supabase/schema.sql.'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-gray-300 space-y-2">
          <p className="font-bold text-cyan-300">Como conectar seu Supabase gratuito:</p>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-400">
            <li>Crie uma conta gratuita em <strong className="text-white">supabase.com</strong> e crie um novo projeto.</li>
            <li>No SQL Editor do Supabase, cole e execute o script gerado em <strong className="text-white">supabase/schema.sql</strong>.</li>
            <li>Insira as chaves em seu arquivo <strong className="text-white">.env.local</strong> (<code className="text-cyan-400">NEXT_PUBLIC_SUPABASE_URL</code> e <code className="text-cyan-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>).</li>
          </ol>
        </div>
      </div>

      {/* 3. Manutenção e Backup */}
      <div className="glass-panel rounded-3xl p-6 border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white">Backup e Restauração</h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={handleExportarBackup}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-xs font-semibold text-gray-200 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Exportar Backup JSON
          </button>

          <button
            onClick={() => {
              if (confirm('Deseja restaurar os dados de exemplo padrão? Todas as alterações manuais serão resetadas.')) {
                restaurarDadosPadrao();
              }
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-rose-950/40 border border-gray-700 hover:border-rose-500/30 text-xs font-semibold text-rose-400 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar Dados Iniciais de Demonstração
          </button>
        </div>
      </div>
    </div>
  );
}
