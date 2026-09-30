# ⚡ Finance AI - Copiloto Financeiro Inteligente (PWA)

O **Finance AI** é um aplicativo web progressivo (PWA) de finanças pessoais desenvolvido com arquitetura moderna, escalável e mobile-first, projetado para funcionar como um verdadeiro **copiloto financeiro pessoal inteligente**.

Ele não se limita a registrar gastos: analisa o impacto das suas decisões financeiras em tempo real, projeta meses futuros, avalia compromissos de parcelas e cartões, simula compras antes de realizá-las e responde a dúvidas complexas utilizando Inteligência Artificial.

---

## 🚀 Arquitetura Planejada para as 3 Fases

O sistema foi concebido desde o início contemplando as **3 Fases de evolução**:

### ✅ FASE 1: Base do Sistema (100% Implementada)
1. **Autenticação & Usuários:**
   - Suporte completo ao **Supabase Auth** e tabela de perfis de usuário (`profiles`).
   - Modo demonstração e Local Storage interativo inteligente out-of-the-box.
2. **Dashboard Financeiro Consolidado:**
   - Saldo atual em conta, receitas do mês, despesas do mês e valor efetivamente disponível (sobra).
   - Contas fixas próximas do vencimento e compromissos futuros consolidados.
   - Gráficos responsivos de fluxo de caixa (Entradas vs Saídas) e distribuição por categoria.
3. **Módulo de Receitas:**
   - Cadastro e categorização: salário, renda extra, investimentos e outros ganhos.
   - Recorrência configurável (única, mensal ou anual) e totalizadores em tempo real.
4. **Módulo de Despesas:**
   - Categorias essenciais (alimentação, moradia, transporte, lazer, saúde, compras, assinaturas, educação).
   - Formas de pagamento (PIX, crédito, débito, boleto, dinheiro, transferência).
   - Busca em tempo real e filtros por categoria.
5. **Contas Futuras & Fixas:**
   - Cadastro de contas recorrentes (aluguel, condomínio, internet, energia, assinaturas).
   - Identificação de contas vencidas, contas do dia e dias restantes.
   - Liquidação e alternância de status em 1 clique.
6. **Cartões de Crédito:**
   - Cadastro de múltiplos cartões com limites, cores e datas de corte (fechamento) e vencimento.
   - Visualização estilo cartão moderno (mockup).
   - Controle dinâmico de fatura atual, limite utilizado e limite disponível.
7. **Compras Parceladas com Geração Automática:**
   - Cadastro de compras em até 72x (ex: Notebook R$ 6.000 em 12x).
   - Geração automática de parcelas mensais sucessivas (Janeiro: R$ 500, Fevereiro: R$ 500...).
   - Linha do tempo de quitação e marcação de parcelas individuais pagas/pendentes.
8. **Empréstimos & Financiamentos:**
   - Cadastro de contratos com taxas de juros, parcelas totais e pagas.
   - Monitoramento do saldo devedor atual e comprometimento futuro do orçamento.
   - Botão para amortizar parcelas extras.
9. **Metas Financeiras:**
   - Criação de metas (Reserva de Emergência, Comprar Carro, Viagem, Imóvel).
   - Barra de progresso visual, estimativa de conclusão e modal de aporte rápido.
10. **Importação CSV de Extratos Bancários:**
    - Leitor e interpretador com PapaParse compatível com extratos do Nubank, Itaú, Inter, etc.
    - Pré-visualização antes de importar e importação em massa para despesas e faturas.

---

### 🧠 FASE 2: Inteligência Financeira com IA (100% Implementada)
1. **Simulador "Antes de Comprar":**
   - Ferramenta dedicada para testar compras antes de gastar.
   - Calcula impacto no saldo imediato, impacto mensal no fluxo, comprometimento da renda e impacto nas metas.
   - Comparativo inteligente: **À Vista** (avaliação de desconto) vs **Parcelado** (avaliação de endividamento futuro).
2. **Assistente / Copiloto IA (Chat Integrado):**
   - Endpoint próprio de backend `/api/ai/chat`.
   - Injeção contextual dos dados do usuário (saldo, sobras, faturas, parcelas, metas e dívidas).
   - Integração com a API Google Gemini (plano gratuito) com fallback analítico local matemático.
   - Responde: *"Posso comprar isso?"*, *"Recebi R$ 5.000 extras, qual a melhor decisão?"*, *"Como reduzir gastos?"*, etc.
3. **Análise de Saúde Financeira (Score 0-100):**
   - 4 Pilares: Comprometimento de Renda, Capacidade de Poupança, Nível de Endividamento e Reserva de Emergência em meses.
   - Diagnósticos automáticos de pontos fortes e oportunidades de melhoria.

---

### 🔔 FASE 3: Automações & Alertas (100% Implementada)
1. **Progressive Web App (PWA) & Notificações Push:**
   - `manifest.json` completo e Service Worker `public/sw.js` com suporte a offline e Web Push.
   - Banner responsivo para instalação na tela inicial no Android, iOS (Safari) e Desktop (Chrome/Edge).
   - Ativação de notificações push e teste de alerta direto no dispositivo.
2. **Relatórios Automáticos Mensais:**
   - Consolidação de receitas, despesas, economia líquida e top 5 maiores gastos do mês.
   - Função de impressão e exportação direta para PDF.
3. **Alertas Inteligentes Automatizados:**
   - Disparo preventivo quando o cartão atingir o limite configurado (padrão: 80% ou 90%).
   - Alerta para contas que vencem nos próximos 3 dias ou hoje.
   - Alerta de comprometimento orçamentário excessivo.

---

## 🛠️ Tecnologias Utilizadas (Gratuitas)

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts.
- **Backend:** Next.js API Routes (`/api/ai/chat`, `/api/ai/analyze`).
- **Regras Financeiras:** Isoladas em `src/lib/financial-engine/`.
- **Banco de Dados:** Supabase PostgreSQL com script completo em `supabase/schema.sql` (RLS e Triggers).
- **Autenticação:** Supabase Auth + Profiles com LocalStorage Sync.
- **Inteligência Artificial:** Google Gemini Flash API (`generativelanguage.googleapis.com`) + Motor Analítico Local.
- **PWA:** Web App Manifest, Service Worker, Cache API e Web Push Notifications.

---

## 📦 Como Executar o Projeto Localmente

### 1. Iniciar o Servidor de Desenvolvimento:
```bash
npm run dev
```
Acesse no seu navegador: **http://localhost:3000**

### 2. Gerar a Build de Produção:
```bash
npm run build
npm run start
```

---

## 🗄️ Como Conectar seu Banco de Dados Supabase (Gratuito)

1. Crie uma conta gratuita em [supabase.com](https://supabase.com) e crie um novo projeto.
2. No painel do Supabase, clique em **SQL Editor** e abra o arquivo `supabase/schema.sql` presente na raiz deste projeto.
3. Execute o script para criar todas as 12 tabelas com Row Level Security (RLS), índices e triggers.
4. No arquivo `.env.local`, adicione suas credenciais:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-publica
```
5. *(Opcional)* No menu **Configurações** dentro do próprio aplicativo, você também pode visualizar o status da sua conexão em tempo real!

---

## 🤖 Como Ativar a API Gemini do Google (Gratuita)

1. Obtenha sua chave de API gratuitamente em [aistudio.google.com](https://aistudio.google.com).
2. Adicione-a ao arquivo `.env.local`:
```env
GEMINI_API_KEY=sua-chave-api-gemini
```
*(Ou insira a chave diretamente na tela de Configurações do app no navegador)*.

---

## 📱 Como Instalar no Celular (PWA)

- **No Android (Chrome):** Acesse a aplicação e toque no banner **"Instalar Finance AI"** ou nos 3 pontinhos do Chrome > *Instalar Aplicativo*.
- **No iPhone / iPad (Safari):** Acesse a aplicação no Safari, toque no botão **Compartilhar** (quadrado com seta para cima) e selecione **"Adicionar à Tela de Início"**.
