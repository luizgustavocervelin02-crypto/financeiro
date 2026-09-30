'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, ShieldCheck, RefreshCw, Key } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatarMoeda } from '@/lib/financial-engine/calculations';

interface MensagemChat {
  id: string;
  autor: 'usuario' | 'ia';
  texto: string;
  data: string;
}

export default function AssistenteIaPage() {
  const { resumo, saude, metas, comprasParceladas, emprestimos, profile } = useFinance();

  const [mensagens, setMensagens] = useState<MensagemChat[]>([
    {
      id: 'msg_welcome',
      autor: 'ia',
      texto: `Olá, ${profile.nome?.split(' ')[0] || 'Investidor'}! Sou seu copiloto Finance AI ⚡
Analisei seu fluxo financeiro deste mês:
- **Saldo Atual:** ${formatarMoeda(resumo.saldoAtual)}
- **Disponível no Mês:** ${formatarMoeda(resumo.valorDisponivel)}
- **Score Financeiro:** ${saude.score}/100 (${saude.classificacao})
- **Comprometimento de Renda:** ${saude.comprometimento_renda}%

Como posso te ajudar a tomar as melhores decisões hoje? Escolha uma das perguntas rápidas abaixo ou digite sua dúvida!`,
      data: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const [inputTexto, setInputTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const sugestoes = [
    'Posso comprar um celular de R$ 3.500 parcelado?',
    'Recebi R$ 5.000 extras, qual a melhor decisão?',
    'Como posso reduzir meus gastos este mês?',
    'Quando consigo atingir minha meta financeira?',
  ];

  const enviarMensagem = async (texto: string) => {
    if (!texto.trim() || carregando) return;

    const novaMsgUsuario: MensagemChat = {
      id: `usr_${Date.now()}`,
      autor: 'usuario',
      texto: texto.trim(),
      data: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMensagens(prev => [...prev, novaMsgUsuario]);
    setInputTexto('');
    setCarregando(true);

    try {
      const contexto = {
        resumo,
        saude,
        metas,
        comprasParceladas,
        emprestimos,
      };

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pergunta: texto,
          contexto,
          apiKey: profile.preferencias.geminiApiKey,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao comunicar com o servidor');
      }

      const data = await response.json();

      const novaMsgIa: MensagemChat = {
        id: `ia_${Date.now()}`,
        autor: 'ia',
        texto: data.resposta || 'Não foi possível gerar uma resposta para esta pergunta no momento.',
        data: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMensagens(prev => [...prev, novaMsgIa]);
    } catch (err: any) {
      setMensagens(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          autor: 'ia',
          texto: `⚠️ Ocorreu um erro ao processar sua pergunta: ${err.message}. Tente novamente.`,
          data: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-black text-white">Copiloto Financeiro IA</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Inteligência artificial personalizada com contexto em tempo real das suas receitas, dívidas e metas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Gemini Flash / Local Engine
          </span>
        </div>
      </div>

      {/* Caixa de Mensagens do Chat */}
      <div className="flex-1 glass-panel rounded-3xl p-4 sm:p-6 border border-gray-800 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {mensagens.map((msg) => {
            const isUser = msg.autor === 'usuario';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                    isUser
                      ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white'
                      : 'bg-gradient-to-tr from-purple-600 to-emerald-500 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-[#151c2e] border border-gray-800 text-gray-100 rounded-tl-none space-y-2'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.texto}
                  </div>
                  <span className="block text-[10px] opacity-60 text-right mt-1">
                    {msg.data}
                  </span>
                </div>
              </div>
            );
          })}

          {carregando && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#151c2e] border border-gray-800 rounded-2xl rounded-tl-none p-4 text-xs text-gray-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>O copiloto está analisando seus números e gerando o parecer...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sugestões de Perguntas Rápidas */}
        <div className="pt-3 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {sugestoes.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => enviarMensagem(sug)}
              disabled={carregando}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-full bg-gray-900 hover:bg-gray-800 border border-purple-500/20 text-purple-300 transition-colors disabled:opacity-50"
            >
              ⚡ {sug}
            </button>
          ))}
        </div>

        {/* Formulário de Envio */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enviarMensagem(inputTexto);
          }}
          className="pt-2 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputTexto}
            onChange={(e) => setInputTexto(e.target.value)}
            disabled={carregando}
            placeholder="Pergunte qualquer coisa sobre suas finanças (ex: 'Posso comprar X?')..."
            className="flex-1 px-4 py-3 rounded-2xl bg-gray-900 border border-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputTexto.trim() || carregando}
            className="p-3 rounded-2xl bg-purple-500 hover:bg-purple-400 disabled:bg-gray-800 text-white disabled:text-gray-600 transition-all shadow-lg shadow-purple-500/20 active:scale-95 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
