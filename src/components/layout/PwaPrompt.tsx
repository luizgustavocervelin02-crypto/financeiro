'use client';

import React, { useEffect, useState } from 'react';
import { Download, Smartphone, X, CheckCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Registro do Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Finance AI Service Worker registrado com sucesso:', reg.scope);
        })
        .catch((err) => {
          console.warn('Erro ao registrar Service Worker:', err);
        });
    }

    // Detectar se já está instalado em modo standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detectar iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Evento de instalação PWA (Chrome/Edge/Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || isDismissed || (!deferredPrompt && !isIOS)) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
        <div className="glass-panel rounded-2xl p-4 shadow-2xl border border-emerald-500/30 bg-[#0d131f]/95 backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white flex-shrink-0 shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Instalar Finance AI</h5>
              <p className="text-xs text-gray-300 mt-0.5 leading-snug">
                Instale o app no seu celular ou computador para acesso instantâneo e notificações.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs shadow-md transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Instalar Aplicativo
                </button>
                <button
                  onClick={() => setIsDismissed(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs transition-colors"
                >
                  Agora não
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsDismissed(true)}
              className="text-gray-500 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Guia para iOS Safari */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#111827] border border-gray-800 p-6 text-center">
            <Smartphone className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">Como instalar no iPhone / iPad:</h4>
            <div className="text-xs text-gray-300 text-left space-y-2 mt-4 bg-gray-900/60 p-4 rounded-xl border border-gray-800">
              <p>1. Toque no botão de <strong>Compartilhar</strong> (ícone de quadrado com seta para cima) na barra do Safari.</p>
              <p>2. Role a lista para baixo e selecione <strong>&quot;Adicionar à Tela de Início&quot;</strong>.</p>
              <p>3. Toque em <strong>Adicionar</strong> no canto superior direito.</p>
            </div>
            <button
              onClick={() => setShowIosGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
