'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, ArrowRight, Download, Filter } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatarMoeda } from '@/lib/financial-engine/calculations';

interface CsvRow {
  data: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  forma_pagamento?: string;
}

export default function ImportacaoCsvPage() {
  const { importarTransacoesCSV, cartoes } = useFinance();
  const [arquivoNome, setArquivoNome] = useState<string | null>(null);
  const [transacoesLidas, setTransacoesLidas] = useState<CsvRow[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);
  const [cartaoDestino, setCartaoDestino] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErro(null);
    setSucessoMsg(null);
    setArquivoNome(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedData: CsvRow[] = [];

          results.data.forEach((row: any) => {
            // Mapear campos flexíveis comuns de extratos bancários brasileiros (Nubank, Itaú, Inter, Bradesco)
            const dataRaw = row.data || row.Data || row.Date || row['data lançamento'] || '';
            const descRaw = row.descricao || row.Descricao || row.Descrição || row.Title || row.estabelecimento || '';
            const valorRaw = row.valor || row.Valor || row.Amount || row['valor (r$)'] || '0';
            const catRaw = row.categoria || row.Categoria || row.Category || 'outros';

            let valorLimpo = typeof valorRaw === 'number' 
              ? valorRaw 
              : parseFloat(String(valorRaw).replace('R$', '').replace(/\./g, '').replace(',', '.').trim());

            if (!isNaN(valorLimpo) && descRaw) {
              const tipo: 'receita' | 'despesa' = valorLimpo >= 0 ? (valorLimpo > 0 && descRaw.toLowerCase().includes('pix recebido') ? 'receita' : 'despesa') : 'despesa';

              // Formatar data para YYYY-MM-DD se vier em DD/MM/YYYY
              let dataFinal = dataRaw;
              if (dataRaw.includes('/')) {
                const partes = dataRaw.split('/');
                if (partes.length === 3) {
                  dataFinal = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
                }
              }
              if (!dataFinal) {
                dataFinal = new Date().toISOString().split('T')[0];
              }

              parsedData.push({
                data: dataFinal,
                descricao: descRaw,
                valor: Math.abs(valorLimpo),
                tipo: valorLimpo > 0 && row.tipo === 'receita' ? 'receita' : 'despesa',
                categoria: catRaw.toLowerCase().trim() || 'outros',
                forma_pagamento: cartaoDestino ? 'credito' : 'debito',
              });
            }
          });

          if (parsedData.length === 0) {
            setErro('Nenhuma transação válida foi encontrada no arquivo. Verifique se o CSV possui colunas como "data", "descricao" e "valor".');
          } else {
            setTransacoesLidas(parsedData);
          }
        } catch (err: any) {
          setErro(`Erro ao processar o CSV: ${err.message}`);
        }
      },
      error: (err) => {
        setErro(`Falha ao ler arquivo: ${err.message}`);
      }
    });
  };

  const handleImportar = () => {
    if (transacoesLidas.length === 0) return;

    const payload = transacoesLidas.map(t => ({
      ...t,
      cartao_id: cartaoDestino || undefined,
    }));

    const res = importarTransacoesCSV(payload);
    setSucessoMsg(`Sucesso! ${res.totalImportados} transações foram importadas para o Finance AI.`);
    setTransacoesLidas([]);
    setArquivoNome(null);
  };

  const baixarModeloCSV = () => {
    const csvContent = "data,descricao,valor,categoria,tipo\n2026-09-05,Salário Mensal,8500.00,salario,receita\n2026-09-10,Supermercado Pão de Açúcar,450.20,alimentacao,despesa\n2026-09-12,Uber Viagens,48.50,transporte,despesa\n2026-09-15,Farmácia Raia,92.00,saude,despesa";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'modelo_extrato_finance_ai.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-black text-white">Importação de Extratos CSV</h1>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Importe extratos bancários do Nubank, Itaú, Bradesco, Inter e organize seus lançamentos automaticamente
        </p>
      </div>

      {/* Caixa de Upload */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 text-center relative">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto shadow-inner border border-amber-500/20">
            <Upload className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-white">
              {arquivoNome ? arquivoNome : 'Arraste seu arquivo CSV ou clique para selecionar'}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Formatos aceitos: extratos bancários em formato .csv delimitados por vírgula ou ponto-e-vírgula
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={baixarModeloCSV}
              className="relative z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-xs text-gray-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar Modelo CSV Exemplo
            </button>
          </div>
        </div>
      </div>

      {/* Mensagens de Sucesso / Erro */}
      {erro && (
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {sucessoMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{sucessoMsg}</span>
        </div>
      )}

      {/* Pré-visualização da Importação */}
      {transacoesLidas.length > 0 && (
        <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
            <div>
              <h4 className="text-sm font-bold text-white">Prévia das Transações Encontradas</h4>
              <p className="text-xs text-gray-400">{transacoesLidas.length} transações prontas para importar</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {cartoes.length > 0 && (
                <select
                  value={cartaoDestino}
                  onChange={(e) => setCartaoDestino(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white"
                >
                  <option value="">Extrato de Conta Corrente</option>
                  {cartoes.map(c => (
                    <option key={c.id} value={c.id}>Fatura Cartão: {c.nome_cartao}</option>
                  ))}
                </select>
              )}

              <button
                onClick={handleImportar}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all ml-auto"
              >
                <span>Confirmar Importação</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-800/60">
            {transacoesLidas.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-mono text-[11px]">{item.data}</span>
                  <span className="font-semibold text-white truncate">{item.descricao}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                    {item.categoria}
                  </span>
                </div>

                <div className="text-right">
                  <span className={`font-bold ${item.tipo === 'receita' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.tipo === 'receita' ? '+' : '-'}{formatarMoeda(item.valor)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
