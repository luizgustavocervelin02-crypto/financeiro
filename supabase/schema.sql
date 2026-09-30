-- ==============================================================================
-- FINANCE AI - DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Suporte completo para FASE 1, FASE 2 e FASE 3
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis de Usuário (vinculada ao auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  preferencias JSONB DEFAULT '{
    "moeda": "BRL",
    "tema": "dark",
    "notificacoes_push": true,
    "alerta_limite_cartao": 80,
    "meta_reserva_meses": 6
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para criar perfil automaticamente no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Categorias Personalizadas e Padrão
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL significa categoria padrão do sistema
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  icone TEXT,
  cor TEXT DEFAULT '#10b981',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Cartões de Crédito
CREATE TABLE IF NOT EXISTS public.cartoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banco TEXT NOT NULL,
  nome_cartao TEXT NOT NULL,
  limite NUMERIC(12,2) NOT NULL CHECK (limite >= 0),
  fechamento INTEGER NOT NULL CHECK (fechamento BETWEEN 1 AND 31),
  vencimento INTEGER NOT NULL CHECK (vencimento BETWEEN 1 AND 31),
  cor TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Receitas
CREATE TABLE IF NOT EXISTS public.receitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),
  categoria TEXT NOT NULL, -- 'salario', 'renda_extra', 'investimentos', 'outros'
  data DATE NOT NULL,
  recorrencia TEXT DEFAULT 'unica' CHECK (recorrencia IN ('unica', 'mensal', 'anual')),
  status TEXT DEFAULT 'recebido' CHECK (status IN ('recebido', 'pendente')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Despesas
CREATE TABLE IF NOT EXISTS public.despesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),
  categoria TEXT NOT NULL, -- 'alimentacao', 'transporte', 'moradia', 'lazer', 'saude', 'compras', 'assinaturas', 'outros'
  data DATE NOT NULL,
  forma_pagamento TEXT NOT NULL CHECK (forma_pagamento IN ('pix', 'dinheiro', 'debito', 'credito', 'transferencia', 'boleto')),
  cartao_id UUID REFERENCES public.cartoes(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pago' CHECK (status IN ('pago', 'pendente')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Contas Futuras (Contas Fixas & Recorrentes)
CREATE TABLE IF NOT EXISTS public.contas_futuras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),
  vencimento_dia INTEGER NOT NULL CHECK (vencimento_dia BETWEEN 1 AND 31),
  data_proximo_vencimento DATE,
  categoria TEXT DEFAULT 'moradia',
  fixa BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Compras Parceladas
CREATE TABLE IF NOT EXISTS public.compras_parceladas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cartao_id UUID REFERENCES public.cartoes(id) ON DELETE SET NULL,
  descricao TEXT NOT NULL,
  valor_total NUMERIC(12,2) NOT NULL CHECK (valor_total > 0),
  total_parcelas INTEGER NOT NULL CHECK (total_parcelas > 1),
  valor_parcela NUMERIC(12,2) NOT NULL CHECK (valor_parcela > 0),
  data_inicio DATE NOT NULL,
  categoria TEXT DEFAULT 'compras',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Parcelas Individuais (geradas automaticamente)
CREATE TABLE IF NOT EXISTS public.parcelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compra_id UUID NOT NULL REFERENCES public.compras_parceladas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_parcela INTEGER NOT NULL,
  valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),
  mes_referencia TEXT NOT NULL, -- formato YYYY-MM
  data_vencimento DATE NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Empréstimos
CREATE TABLE IF NOT EXISTS public.emprestimos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banco TEXT NOT NULL,
  descricao TEXT,
  valor_contratado NUMERIC(12,2) NOT NULL CHECK (valor_contratado > 0),
  quantidade_parcelas INTEGER NOT NULL CHECK (quantidade_parcelas > 0),
  valor_parcela NUMERIC(12,2) NOT NULL CHECK (valor_parcela > 0),
  taxa_juros NUMERIC(6,2) DEFAULT 0.00,
  parcelas_pagas INTEGER DEFAULT 0 CHECK (parcelas_pagas >= 0),
  data_inicio DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Metas Financeiras
CREATE TABLE IF NOT EXISTS public.metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  valor_objetivo NUMERIC(12,2) NOT NULL CHECK (valor_objetivo > 0),
  valor_acumulado NUMERIC(12,2) DEFAULT 0 CHECK (valor_acumulado >= 0),
  prazo DATE NOT NULL,
  categoria TEXT DEFAULT 'patrimonio',
  cor TEXT DEFAULT '#10b981',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Notificações e Alertas Inteligentes (FASE 3)
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT DEFAULT 'info' CHECK (tipo IN ('info', 'alerta', 'urgente', 'ia_insight', 'sucesso')),
  lida BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Histórico Financeiro Mensal (FASE 2 & 3)
CREATE TABLE IF NOT EXISTS public.historico_financeiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mes_ano TEXT NOT NULL, -- formato YYYY-MM
  total_receitas NUMERIC(12,2) DEFAULT 0,
  total_despesas NUMERIC(12,2) DEFAULT 0,
  saldo NUMERIC(12,2) DEFAULT 0,
  total_guardado NUMERIC(12,2) DEFAULT 0,
  score_saude INTEGER DEFAULT 100 CHECK (score_saude BETWEEN 0 AND 100),
  resumo_ia TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mes_ano)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) - SEGURANÇA MÁXIMA
-- Cada usuário só acessa seus próprios dados
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cartoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_futuras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras_parceladas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emprestimos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_financeiro ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Users can manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own categories or see defaults" ON public.categorias
  FOR ALL USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can manage own cartoes" ON public.cartoes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own receitas" ON public.receitas
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own despesas" ON public.despesas
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own contas_futuras" ON public.contas_futuras
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own compras_parceladas" ON public.compras_parceladas
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own parcelas" ON public.parcelas
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own emprestimos" ON public.emprestimos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own metas" ON public.metas
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notificacoes" ON public.notificacoes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own historico" ON public.historico_financeiro
  FOR ALL USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_receitas_user_data ON public.receitas(user_id, data);
CREATE INDEX IF NOT EXISTS idx_despesas_user_data ON public.despesas(user_id, data);
CREATE INDEX IF NOT EXISTS idx_parcelas_user_mes ON public.parcelas(user_id, mes_referencia);
CREATE INDEX IF NOT EXISTS idx_contas_user_status ON public.contas_futuras(user_id, status);
