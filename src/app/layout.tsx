import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FinanceProvider } from '@/lib/context/FinanceContext';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { PwaPrompt } from '@/components/layout/PwaPrompt';

export const metadata: Metadata = {
  title: 'Finance AI - Copiloto Financeiro Inteligente',
  description: 'Controle de finanças pessoais com Inteligência Artificial, cartões de crédito, parcelas, contas futuras e simulador de compras.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Finance AI',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0b0f19',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#0b0f19] text-gray-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-black">
        <FinanceProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />

            <div className="flex-1 flex max-w-7xl w-full mx-auto">
              <Sidebar />

              <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 sm:pb-8 overflow-x-hidden">
                {children}
              </main>
            </div>

            <BottomNav />
            <PwaPrompt />
          </div>
        </FinanceProvider>
      </body>
    </html>
  );
}
