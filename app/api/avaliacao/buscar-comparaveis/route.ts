import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { gerarPromptBuscaComparaveis } from '@/lib/avaliacao-mca'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const prompt = gerarPromptBuscaComparaveis({
      cidade: body.cidade, bairro: body.bairro, tipo: body.tipo || 'apartamento',
      m2Privativo: body.m2_privativo, quartos: body.quartos || 0,
      suites: body.suites || 0, banheiros: body.banheiros || 0,
      vagas: body.vagas || 0, mobilia: body.mobilia || 'vazio',
      infraLazer: body.infra_lazer || 'basico',
    })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Você é um avaliador imobiliário. Responda APENAS com JSON válido, sem markdown.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content || '{"comparaveis":[]}'
    let comparaveis = []
    try {
      const parsed = JSON.parse(content)
      comparaveis = Array.isArray(parsed) ? parsed : parsed.comparaveis || []
    } catch { console.error('Parse error:', content) }

    comparaveis = comparaveis.map((c: Record<string, unknown>, i: number) => ({
      ...c, codigo: c.codigo || `COMP-${String(i + 1).padStart(3, '0')}`, origem: 'ia', ativo: true, ordem: i + 1,
    }))

    return NextResponse.json({ comparaveis })
  } catch (error) {
    console.error('Erro busca comparáveis:', error)
    return NextResponse.json({ error: 'Erro ao buscar comparáveis', comparaveis: [] }, { status: 500 })
  }
}
