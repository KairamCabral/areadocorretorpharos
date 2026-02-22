import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { ResultadoChart } from '@/components/open-house/ResultadoChart'
import { PHAROS } from '@/lib/constants'
import { MapPin, Calendar, Star, ThumbsUp, ThumbsDown } from 'lucide-react'
import type { OpenHouse, OpenHouseAvaliacao } from '@/types'

const CRITERIOS = [
  'nota_tamanho',
  'nota_disposicao',
  'nota_acabamento',
  'nota_conservacao',
  'nota_areas_comuns',
  'nota_localizacao',
  'nota_preco',
] as const

const COMPRARIA_LABELS = { sim: 'Sim', nao: 'Não', talvez: 'Talvez' } as const

export default async function OpenHouseResultadoPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createServerSupabase()

  const { data: openHouseData } = await supabase
    .from('open_houses')
    .select('*')
    .eq('token_resultado', token)
    .single()

  const openHouse = openHouseData as unknown as OpenHouse | null
  if (!openHouse) notFound()

  const { data: avaliacoesData } = await supabase
    .from('open_house_avaliacoes')
    .select('*')
    .eq('open_house_id', openHouse.id)
    .order('created_at', { ascending: false })

  const oh = openHouse
  const avals = (avaliacoesData ?? []) as unknown as OpenHouseAvaliacao[]

  const mediaGeral =
    avals.length > 0
      ? avals.reduce((s, a) => s + (a.nota_media ?? 0), 0) / avals.length
      : 0

  const mediasPorCriterio = CRITERIOS.reduce(
    (acc, key) => {
      const sum = avals.reduce((s, a) => s + ((a as unknown as Record<string, number>)[key] ?? 0), 0)
      acc[key] = avals.length > 0 ? sum / avals.length : 0
      return acc
    },
    {} as Record<string, number>
  )

  const comprariaBreakdown = avals.reduce(
    (acc, a) => {
      const k = (a.compraria ?? 'talvez') as keyof typeof COMPRARIA_LABELS
      acc[k] = (acc[k] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const comentariosMais = avals
    .map((a) => a.mais_gostou)
    .filter((c): c is string => !!c?.trim())
  const comentariosMenos = avals
    .map((a) => a.menos_gostou)
    .filter((c): c is string => !!c?.trim())

  return (
    <div className="min-h-screen bg-pharos-dark">
      <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
        <header className="text-center mb-8">
          <div className="w-14 h-14 bg-pharos-blue rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-xl font-bold text-white">{PHAROS.nome}</h1>
          <p className="text-white/70 text-sm mt-1">Relatório Open House</p>
        </header>

        <div className="space-y-6">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="font-semibold text-white text-lg mb-4">{oh.empreendimento}</h2>
            <div className="space-y-2 text-white/80 text-sm">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pharos-gold flex-shrink-0" />
                {oh.endereco}
                {oh.bairro && `, ${oh.bairro}`} — {oh.cidade}
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pharos-gold flex-shrink-0" />
                {formatDate(oh.data_evento)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Resumo das avaliações</h3>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-sm text-gray-500">Total de avaliações</p>
                <p className="text-2xl font-bold text-pharos-blue">{avals.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Média geral</p>
                <p className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                  <Star className="w-7 h-7 fill-pharos-gold text-pharos-gold" />
                  {avals.length > 0 ? mediaGeral.toFixed(1) : '-'}
                </p>
              </div>
            </div>
          </div>

          {avals.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Avaliação por critério</h3>
              <ResultadoChart medias={mediasPorCriterio} />
            </div>
          )}

          {avals.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Compraria este imóvel?</h3>
              <div className="flex gap-6 flex-wrap">
                {(['sim', 'nao', 'talvez'] as const).map((k) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">{COMPRARIA_LABELS[k]}:</span>
                    <span className="text-lg font-bold text-pharos-blue">
                      {comprariaBreakdown[k] ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(comentariosMais.length > 0 || comentariosMenos.length > 0) && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
              {comentariosMais.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-emerald-600" />
                    O que mais gostaram
                  </h3>
                  <ul className="space-y-2">
                    {comentariosMais.map((c, i) => (
                      <li
                        key={i}
                        className="text-gray-600 text-sm pl-4 border-l-2 border-pharos-blue/30"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {comentariosMenos.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ThumbsDown className="w-5 h-5 text-amber-600" />
                    O que menos gostaram
                  </h3>
                  <ul className="space-y-2">
                    {comentariosMenos.map((c, i) => (
                      <li
                        key={i}
                        className="text-gray-600 text-sm pl-4 border-l-2 border-amber-500/30"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {avals.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
              <p className="text-gray-500">Nenhuma avaliação recebida ainda.</p>
            </div>
          )}
        </div>

        <p className="text-center text-white/50 text-xs mt-8">
          {PHAROS.nome} • {PHAROS.creci}
        </p>
      </div>
    </div>
  )
}
