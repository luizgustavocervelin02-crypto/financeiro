import { NextRequest, NextResponse } from 'next/server';
import { calcularSaudeFinanceira } from '@/lib/financial-engine/healthScore';
import { ResumoFinanceiroGeral } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumo } = body;

    if (!resumo) {
      return NextResponse.json({ error: 'Resumo financeiro não informado' }, { status: 400 });
    }

    const saude = calcularSaudeFinanceira(resumo as ResumoFinanceiroGeral);

    return NextResponse.json({ saude });
  } catch (err: any) {
    console.error('Erro na API de Análise:', err);
    return NextResponse.json({ error: 'Falha ao analisar saúde financeira' }, { status: 500 });
  }
}
