import { notFound } from 'next/navigation'
import { createAdminSupabase } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PHAROS } from '@/lib/constants'
import { Home, Ruler, Building2 } from 'lucide-react'

export default async function PublicAvaliacaoPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createAdminSupabase()

  const { data: avaliacao, error } = await supabase
    .from('avaliacoes')
    .select('*')
    .eq('token_publico', token)
    .single()

  if (error || !avaliacao) notFound()

  const { data: comparaveis } = await supabase
    .from('avaliacao_comparaveis')
    .select('*')
    .eq('avaliacao_id', avaliacao.id)
    .eq('ativo', true)
    .order('ordem', { ascending: true })

  const comps = comparaveis ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
        {/* Header - Pharos branding */}
        <header className="text-center mb-8">
          <div className="w-14 h-14 bg-pharos-blue rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-xl font-bold text-pharos-dark">{PHAROS.nome}</h1>
          <p className="text-pharos-gray text-sm mt-1">{PHAROS.endereco}</p>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Avaliação de Imóvel</h2>
            <p className="text-gray-500 text-sm">Método Comparativo de Mercado (MCA)</p>
          </div>
        </header>

        {/* Property details */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-pharos-blue" />
            Dados do imóvel avaliado
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Localização</p>
              <p className="font-medium text-gray-900">
                {avaliacao.bairro}, {avaliacao.cidade}
              </p>
              {avaliacao.endereco && (
                <p className="text-sm text-gray-600">{avaliacao.endereco}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Tipo</p>
              <p className="font-medium text-gray-900 capitalize">{avaliacao.tipo}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pharos-blue/10 flex items-center justify-center">
                <Ruler className="w-5 h-5 text-pharos-blue" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Área privativa</p>
                <p className="font-semibold">{avaliacao.m2_privativo} m²</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pharos-blue/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-pharos-blue" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Quartos / Suítes / Banheiros / Vagas</p>
                <p className="font-semibold">
                  {avaliacao.quartos ?? '-'} / {avaliacao.suites ?? '-'} / {avaliacao.banheiros ?? '-'} / {avaliacao.vagas ?? '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparáveis summary */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Comparáveis utilizados</h3>
          <p className="text-sm text-gray-600 mb-4">
            Análise baseada em {comps.length} imóvel(is) comparável(is) no mesmo bairro ou adjacentes.
          </p>
          {comps.length > 0 && (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full min-w-[400px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 font-medium text-gray-600">Empreendimento</th>
                    <th className="text-right py-2 px-2 font-medium text-gray-600">Valor</th>
                    <th className="text-right py-2 px-2 font-medium text-gray-600">m²</th>
                  </tr>
                </thead>
                <tbody>
                  {comps.slice(0, 10).map((c) => (
                    <tr key={c.id} className="border-b border-gray-100">
                      <td className="py-2 px-2">{c.empreendimento || '-'}</td>
                      <td className="py-2 px-2 text-right font-medium">
                        {c.valor_total != null ? formatCurrency(c.valor_total) : '-'}
                      </td>
                      <td className="py-2 px-2 text-right">{c.m2_privativo ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {comps.length > 10 && (
                <p className="text-xs text-gray-500 mt-2">+ {comps.length - 10} comparáveis</p>
              )}
            </div>
          )}
        </div>

        {/* Result - 3 values */}
        <div className="bg-gradient-to-br from-pharos-blue to-pharos-blue-dark rounded-2xl p-6 lg:p-8 text-white shadow-lg mb-6">
          <h3 className="font-semibold text-white/90 mb-4">Resultado da avaliação</h3>
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-white/70 text-sm">Valor comercial (referência)</p>
              <p className="text-2xl font-bold mt-1">
                {avaliacao.valor_comercial != null
                  ? formatCurrency(avaliacao.valor_comercial)
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Valor avaliado</p>
              <p className="text-2xl font-bold mt-1 text-pharos-gold">
                {avaliacao.valor_avaliado != null
                  ? formatCurrency(avaliacao.valor_avaliado)
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Valor máximo</p>
              <p className="text-2xl font-bold mt-1">
                {avaliacao.valor_maximo != null
                  ? formatCurrency(avaliacao.valor_maximo)
                  : '-'}
              </p>
            </div>
          </div>
          {avaliacao.valor_m2_medio != null && (
            <p className="text-sm text-white/70 mt-4">
              Valor/m² médio: {formatCurrency(avaliacao.valor_m2_medio)}/m²
            </p>
          )}
        </div>

        {/* Disclaimer */}
        <footer className="text-center text-xs text-gray-500 pt-6 border-t border-gray-200">
          <p className="font-medium text-gray-600 mb-1">Aviso importante</p>
          <p>
            Esta avaliação é uma estimativa de mercado baseada no Método Comparativo de Mercado (MCA)
            e em dados de imóveis similares. Não substitui uma avaliação técnica formal.
            Valores sujeitos a confirmação. {PHAROS.nome} · {PHAROS.creci}
          </p>
          <p className="mt-2">
            Gerado em {formatDate(avaliacao.created_at ?? '')}
          </p>
        </footer>
      </div>
    </div>
  )
}
