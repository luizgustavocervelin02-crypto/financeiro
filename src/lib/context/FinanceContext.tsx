'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Receita, 
  Despesa, 
  CartaoCredito, 
  CompraParcelada, 
  Parcela, 
  ContaFutura, 
  Emprestimo, 
  MetaFinanceira, 
  UserProfile, 
  Notificacao,
  ResumoFinanceiroGeral,
  IndicadoresSaudeFinanceira
} from '../types';
import { 
  mockProfile, 
  mockReceitas, 
  mockDespesas, 
  mockCartoes, 
  mockComprasParceladas, 
  mockContasFuturas, 
  mockEmprestimos, 
  mockMetas 
} from '../mockData';
import { 
  calcularResumoGeral, 
  gerarParcelasAutomaticas 
} from '../financial-engine/calculations';
import { calcularSaudeFinanceira } from '../financial-engine/healthScore';
import { gerarAlertasInteligentes } from '../financial-engine/alertEngine';
import { isSupabaseConfigured, supabase } from '../supabase/client';

interface FinanceContextType {
  // Estado
  profile: UserProfile;
  receitas: Receita[];
  despesas: Despesa[];
  cartoes: CartaoCredito[];
  comprasParceladas: CompraParcelada[];
  contasFuturas: ContaFutura[];
  emprestimos: Emprestimo[];
  metas: MetaFinanceira[];
  notificacoes: Notificacao[];
  isLoaded: boolean;
  isSupabaseConnected: boolean;

  // Cálculos reativos
  resumo: ResumoFinanceiroGeral;
  saude: IndicadoresSaudeFinanceira;

  // Ações CRUD Receitas
  adicionarReceita: (receita: Omit<Receita, 'id'>) => void;
  editarReceita: (id: string, receita: Partial<Receita>) => void;
  excluirReceita: (id: string) => void;

  // Ações CRUD Despesas
  adicionarDespesa: (despesa: Omit<Despesa, 'id'>) => void;
  editarDespesa: (id: string, despesa: Partial<Despesa>) => void;
  excluirDespesa: (id: string) => void;

  // Ações CRUD Cartões
  adicionarCartao: (cartao: Omit<CartaoCredito, 'id'>) => void;
  editarCartao: (id: string, cartao: Partial<CartaoCredito>) => void;
  excluirCartao: (id: string) => void;

  // Ações CRUD Compras Parceladas
  adicionarCompraParcelada: (compra: {
    descricao: string;
    valor_total: number;
    total_parcelas: number;
    data_inicio: string;
    cartao_id?: string;
    categoria: any;
  }) => void;
  excluirCompraParcelada: (id: string) => void;
  alternarStatusParcela: (compraId: string, parcelaId: string) => void;

  // Ações CRUD Contas Futuras
  adicionarContaFutura: (conta: Omit<ContaFutura, 'id'>) => void;
  alternarStatusConta: (id: string) => void;
  excluirContaFutura: (id: string) => void;

  // Ações CRUD Empréstimos
  adicionarEmprestimo: (emp: Omit<Emprestimo, 'id'>) => void;
  registrarPagamentoEmprestimo: (id: string) => void;
  excluirEmprestimo: (id: string) => void;

  // Ações CRUD Metas
  adicionarMeta: (meta: Omit<MetaFinanceira, 'id'>) => void;
  aportarMeta: (id: string, valor: number) => void;
  excluirMeta: (id: string) => void;

  // Importação CSV
  importarTransacoesCSV: (transacoes: {
    data: string;
    descricao: string;
    valor: number;
    tipo: 'receita' | 'despesa';
    categoria: string;
    forma_pagamento?: any;
    cartao_id?: string;
  }[]) => { totalImportados: number };

  // Notificações
  marcarNotificacaoLida: (id: string) => void;
  limparTodasNotificacoes: () => void;

  // Configurações
  atualizarPerfil: (novoPerfil: Partial<UserProfile>) => void;
  restaurarDadosPadrao: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'finance_ai_store_v1';

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [receitas, setReceitas] = useState<Receita[]>(mockReceitas);
  const [despesas, setDespesas] = useState<Despesa[]>(mockDespesas);
  const [cartoes, setCartoes] = useState<CartaoCredito[]>(mockCartoes);
  const [comprasParceladas, setComprasParceladas] = useState<CompraParcelada[]>(mockComprasParceladas);
  const [contasFuturas, setContasFuturas] = useState<ContaFutura[]>(mockContasFuturas);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>(mockEmprestimos);
  const [metas, setMetas] = useState<MetaFinanceira[]>(mockMetas);
  const [customNotificacoes, setCustomNotificacoes] = useState<Notificacao[]>([]);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(isSupabaseConfigured);

  // Carregar dados salvos no localStorage no boot
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.receitas) setReceitas(parsed.receitas);
        if (parsed.despesas) setDespesas(parsed.despesas);
        if (parsed.cartoes) setCartoes(parsed.cartoes);
        if (parsed.comprasParceladas) setComprasParceladas(parsed.comprasParceladas);
        if (parsed.contasFuturas) setContasFuturas(parsed.contasFuturas);
        if (parsed.emprestimos) setEmprestimos(parsed.emprestimos);
        if (parsed.metas) setMetas(parsed.metas);
        if (parsed.customNotificacoes) setCustomNotificacoes(parsed.customNotificacoes);
      }
    } catch (e) {
      console.warn('Falha ao ler dados do localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Salvar no localStorage sempre que houver alteração
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const dataToSave = {
        profile,
        receitas,
        despesas,
        cartoes,
        comprasParceladas,
        contasFuturas,
        emprestimos,
        metas,
        customNotificacoes,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Falha ao persistir no localStorage:', e);
    }
  }, [
    isLoaded, 
    profile, 
    receitas, 
    despesas, 
    cartoes, 
    comprasParceladas, 
    contasFuturas, 
    emprestimos, 
    metas, 
    customNotificacoes
  ]);

  // Cálculos dinâmicos
  const resumo = useMemo(() => {
    return calcularResumoGeral(
      receitas,
      despesas,
      contasFuturas,
      cartoes,
      comprasParceladas,
      emprestimos,
      metas
    );
  }, [receitas, despesas, contasFuturas, cartoes, comprasParceladas, emprestimos, metas]);

  const saude = useMemo(() => {
    return calcularSaudeFinanceira(resumo);
  }, [resumo]);

  // Alertas Inteligentes automatizados
  const notificacoes = useMemo(() => {
    const todasParcelas = comprasParceladas.flatMap(c => c.parcelas || []);
    const alertas = gerarAlertasInteligentes(
      resumo,
      cartoes,
      contasFuturas,
      metas,
      despesas,
      todasParcelas,
      profile.preferencias.alerta_limite_cartao || 80
    );

    // Mesclar alertas dinâmicos com notificações do usuário
    const idsLidas = new Set(customNotificacoes.filter(n => n.lida).map(n => n.id));
    return [
      ...customNotificacoes,
      ...alertas.filter(a => !idsLidas.has(a.id))
    ];
  }, [resumo, cartoes, contasFuturas, metas, despesas, comprasParceladas, customNotificacoes, profile]);

  // ===================== CRUD RECEITAS =====================
  const adicionarReceita = (rec: Omit<Receita, 'id'>) => {
    const nova: Receita = {
      ...rec,
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setReceitas(prev => [nova, ...prev]);
  };

  const editarReceita = (id: string, dados: Partial<Receita>) => {
    setReceitas(prev => prev.map(r => r.id === id ? { ...r, ...dados } : r));
  };

  const excluirReceita = (id: string) => {
    setReceitas(prev => prev.filter(r => r.id !== id));
  };

  // ===================== CRUD DESPESAS =====================
  const adicionarDespesa = (desp: Omit<Despesa, 'id'>) => {
    const nova: Despesa = {
      ...desp,
      id: `desp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setDespesas(prev => [nova, ...prev]);
  };

  const editarDespesa = (id: string, dados: Partial<Despesa>) => {
    setDespesas(prev => prev.map(d => d.id === id ? { ...d, ...dados } : d));
  };

  const excluirDespesa = (id: string) => {
    setDespesas(prev => prev.filter(d => d.id !== id));
  };

  // ===================== CRUD CARTÕES =====================
  const adicionarCartao = (card: Omit<CartaoCredito, 'id'>) => {
    const novo: CartaoCredito = {
      ...card,
      id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setCartoes(prev => [...prev, novo]);
  };

  const editarCartao = (id: string, dados: Partial<CartaoCredito>) => {
    setCartoes(prev => prev.map(c => c.id === id ? { ...c, ...dados } : c));
  };

  const excluirCartao = (id: string) => {
    setCartoes(prev => prev.filter(c => c.id !== id));
  };

  // ===================== CRUD COMPRAS PARCELADAS =====================
  const adicionarCompraParcelada = ({
    descricao,
    valor_total,
    total_parcelas,
    data_inicio,
    cartao_id,
    categoria
  }: {
    descricao: string;
    valor_total: number;
    total_parcelas: number;
    data_inicio: string;
    cartao_id?: string;
    categoria: any;
  }) => {
    const compraId = `comp_${Date.now()}`;
    const valorParcela = Math.floor((valor_total / total_parcelas) * 100) / 100;
    const parcelas = gerarParcelasAutomaticas(compraId, valor_total, total_parcelas, data_inicio);

    const novaCompra: CompraParcelada = {
      id: compraId,
      descricao,
      valor_total,
      total_parcelas,
      valor_parcela: valorParcela,
      data_inicio,
      cartao_id,
      categoria,
      parcelas,
    };

    setComprasParceladas(prev => [novaCompra, ...prev]);
  };

  const excluirCompraParcelada = (id: string) => {
    setComprasParceladas(prev => prev.filter(c => c.id !== id));
  };

  const alternarStatusParcela = (compraId: string, parcelaId: string) => {
    setComprasParceladas(prev => prev.map(compra => {
      if (compra.id !== compraId) return compra;
      const novasParcelas = (compra.parcelas || []).map(p => {
        if (p.id !== parcelaId) return p;
        return {
          ...p,
          status: (p.status === 'pago' ? 'pendente' : 'pago') as 'pago' | 'pendente'
        };
      });
      return { ...compra, parcelas: novasParcelas };
    }));
  };

  // ===================== CRUD CONTAS FUTURAS =====================
  const adicionarContaFutura = (conta: Omit<ContaFutura, 'id'>) => {
    const nova: ContaFutura = {
      ...conta,
      id: `conta_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setContasFuturas(prev => [...prev, nova]);
  };

  const alternarStatusConta = (id: string) => {
    setContasFuturas(prev => prev.map(c => {
      if (c.id !== id) return c;
      return {
        ...c,
        status: (c.status === 'pago' ? 'pendente' : 'pago') as 'pago' | 'pendente'
      };
    }));
  };

  const excluirContaFutura = (id: string) => {
    setContasFuturas(prev => prev.filter(c => c.id !== id));
  };

  // ===================== CRUD EMPRÉSTIMOS =====================
  const adicionarEmprestimo = (emp: Omit<Emprestimo, 'id'>) => {
    const novo: Emprestimo = {
      ...emp,
      id: `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setEmprestimos(prev => [...prev, novo]);
  };

  const registrarPagamentoEmprestimo = (id: string) => {
    setEmprestimos(prev => prev.map(e => {
      if (e.id !== id) return e;
      const pagas = Math.min(e.quantidade_parcelas, e.parcelas_pagas + 1);
      return { ...e, parcelas_pagas: pagas };
    }));
  };

  const excluirEmprestimo = (id: string) => {
    setEmprestimos(prev => prev.filter(e => e.id !== id));
  };

  // ===================== CRUD METAS =====================
  const adicionarMeta = (m: Omit<MetaFinanceira, 'id'>) => {
    const nova: MetaFinanceira = {
      ...m,
      id: `meta_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setMetas(prev => [...prev, nova]);
  };

  const aportarMeta = (id: string, valor: number) => {
    setMetas(prev => prev.map(m => {
      if (m.id !== id) return m;
      return { ...m, valor_acumulado: Math.max(0, m.valor_acumulado + valor) };
    }));
  };

  const excluirMeta = (id: string) => {
    setMetas(prev => prev.filter(m => m.id !== id));
  };

  // ===================== IMPORTAÇÃO CSV =====================
  const importarTransacoesCSV = (transacoes: {
    data: string;
    descricao: string;
    valor: number;
    tipo: 'receita' | 'despesa';
    categoria: string;
    forma_pagamento?: any;
    cartao_id?: string;
  }[]) => {
    let totalImportados = 0;
    const novasReceitas: Receita[] = [];
    const novasDespesas: Despesa[] = [];

    transacoes.forEach(t => {
      if (t.tipo === 'receita') {
        novasReceitas.push({
          id: `rec_csv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          descricao: t.descricao,
          valor: Math.abs(t.valor),
          categoria: (t.categoria as any) || 'outros',
          data: t.data,
          recorrencia: 'unica',
          status: 'recebido',
        });
      } else {
        novasDespesas.push({
          id: `desp_csv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          descricao: t.descricao,
          valor: Math.abs(t.valor),
          categoria: (t.categoria as any) || 'outros',
          data: t.data,
          forma_pagamento: t.forma_pagamento || 'debito',
          cartao_id: t.cartao_id,
          status: 'pago',
        });
      }
      totalImportados++;
    });

    if (novasReceitas.length > 0) {
      setReceitas(prev => [...novasReceitas, ...prev]);
    }
    if (novasDespesas.length > 0) {
      setDespesas(prev => [...novasDespesas, ...prev]);
    }

    return { totalImportados };
  };

  // ===================== NOTIFICAÇÕES =====================
  const marcarNotificacaoLida = (id: string) => {
    setCustomNotificacoes(prev => {
      const jaExiste = prev.find(n => n.id === id);
      if (jaExiste) {
        return prev.map(n => n.id === id ? { ...n, lida: true } : n);
      }
      return [...prev, { id, titulo: '', mensagem: '', tipo: 'info', data: new Date().toISOString(), lida: true }];
    });
  };

  const limparTodasNotificacoes = () => {
    setCustomNotificacoes([]);
  };

  // ===================== CONFIGURAÇÕES & RESET =====================
  const atualizarPerfil = (novo: Partial<UserProfile>) => {
    setProfile(prev => ({
      ...prev,
      ...novo,
      preferencias: {
        ...prev.preferencias,
        ...(novo.preferencias || {}),
      }
    }));
  };

  const restaurarDadosPadrao = () => {
    setProfile(mockProfile);
    setReceitas(mockReceitas);
    setDespesas(mockDespesas);
    setCartoes(mockCartoes);
    setComprasParceladas(mockComprasParceladas);
    setContasFuturas(mockContasFuturas);
    setEmprestimos(mockEmprestimos);
    setMetas(mockMetas);
    setCustomNotificacoes([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <FinanceContext.Provider
      value={{
        profile,
        receitas,
        despesas,
        cartoes,
        comprasParceladas,
        contasFuturas,
        emprestimos,
        metas,
        notificacoes,
        isLoaded,
        isSupabaseConnected,
        resumo,
        saude,
        adicionarReceita,
        editarReceita,
        excluirReceita,
        adicionarDespesa,
        editarDespesa,
        excluirDespesa,
        adicionarCartao,
        editarCartao,
        excluirCartao,
        adicionarCompraParcelada,
        excluirCompraParcelada,
        alternarStatusParcela,
        adicionarContaFutura,
        alternarStatusConta,
        excluirContaFutura,
        adicionarEmprestimo,
        registrarPagamentoEmprestimo,
        excluirEmprestimo,
        adicionarMeta,
        aportarMeta,
        excluirMeta,
        importarTransacoesCSV,
        marcarNotificacaoLida,
        limparTodasNotificacoes,
        atualizarPerfil,
        restaurarDadosPadrao,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de um FinanceProvider');
  }
  return context;
}
