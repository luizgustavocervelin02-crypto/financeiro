'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatarMoeda, getMesAnoAtual } from '@/lib/financial-engine/calculations';

const CORES_CATEGORIAS: Record<string, string> = {
  alimentacao: '#10b981',
  moradia: '#3b82f6',
  transporte: '#f59e0b',
  lazer: '#ec4899',
  saude: '#ef4444',
  compras: '#8b5cf6',
  assinaturas: '#06b6d4',
  educacao: '#14b8a6',
  outros: '#6b7280',
};

const NOMES_CATEGORIAS: Record<string, string> = {
  alimentacao: 'Alimentação',
  moradia: 'Moradia',
  transporte: 'Transporte',
  lazer: 'Lazer',
  saude: 'Saúde',
  compras: 'Compras',
  assinaturas: 'Assinaturas',
  educacao: 'Educação',
  outros: 'Outros',
};

export function FinancialCharts() {
  const { receitas, despesas, contasFuturas, resumo } = useFinance();
  const mesAtual = getMesAnoAtual();

  // 1. Agrupar despesas por categoria
  const categoriasMap: Record<string, number> = {};
  despesas
    .filter(d => d.data.startsWith(mesAtual))
    .forEach(d => {
      categoriasMap[d.categoria] = (categoriasMap[d.categoria] || 0) + d.valor;
    });

  // Incluir contas fixas pendentes na categoria correspondente
  contasFuturas.forEach(c => {
    categoriasMap[c.categoria] = (categoriasMap[c.categoria] || 0) + c.valor;
  });

  const dadosCategorias = Object.entries(categoriasMap).map(([chave, valor]) => ({
    name: NOMES_CATEGORIAS[chave] || chave,
    valor,
    color: CORES_CATEGORIAS[chave] || '#8b5cf6',
  })).sort((a, b) => b.valor - a.valor);

  // 2. Dados comparativos de Fluxo
  const dadosFluxo = [
    {
      tipo: 'Receitas',
      valor: resumo.totalReceitasMes,
      fill: '#10b981',
    },
    {
      tipo: 'Despesas',
      valor: resumo.totalDespesasMes + resumo.contasProximasTotal + resumo.faturaCartoesTotal,
      fill: '#ef4444',
    },
    {
      tipo: 'Disponível',
      valor: Math.max(0, resumo.valorDisponivel),
      fill: '#8b5cf6',
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Gráfico 1: Comparativo de Fluxo de Caixa */}
      <div className="glass-panel rounded-2xl p-5 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-white">Fluxo do Mês</h4>
            <p className="text-xs text-gray-400">Entradas vs Saídas Previstas</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400">
            {resumo.taxaPoupancaMes.toFixed(0)}% Economizado
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosFluxo} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="tipo" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={11} tickLine={false} tickFormatter={(v) => `R$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }}
                formatter={(val: any) => [formatarMoeda(Number(val)), 'Valor']}
              />
              <Bar dataKey="valor" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 2: Distribuição por Categoria (Donut) */}
      <div className="glass-panel rounded-2xl p-5 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-white">Gastos por Categoria</h4>
            <p className="text-xs text-gray-400">Onde seu dinheiro está sendo alocado</p>
          </div>
        </div>

        {dadosCategorias.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-xs text-gray-400">
            Nenhuma despesa registrada para o mês atual.
          </div>
        ) : (
          <div className="h-56 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosCategorias}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="valor"
                  >
                    {dadosCategorias.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }}
                    formatter={(val: any) => [formatarMoeda(Number(val)), 'Total']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legenda compacta */}
            <div className="w-full sm:w-1/2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {dadosCategorias.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-300 truncate">{item.name}</span>
                  </div>
                  <span className="font-semibold text-white ml-2">{formatarMoeda(item.valor)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
