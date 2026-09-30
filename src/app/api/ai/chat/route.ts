import { NextRequest, NextResponse } from 'next/server';
import { consultarGeminiIA, ContextoFinanceiroIA } from '@/lib/gemini/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pergunta, contexto, apiKey } = body;

    if (!pergunta) {
      return NextResponse.json({ error: 'Pergunta é obrigatória' }, { status: 400 });
    }

    const resposta = await consultarGeminiIA(pergunta, contexto as ContextoFinanceiroIA, apiKey);

    return NextResponse.json({ resposta });
  } catch (err: any) {
    console.error('Erro na API de Chat IA:', err);
    return NextResponse.json(
      { error: 'Falha ao processar solicitação de IA', details: err?.message },
      { status: 500 }
    );
  }
}
