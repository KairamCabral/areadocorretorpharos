import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { AvaliacaoForm } from '@/components/open-house/AvaliacaoForm'
import { PHAROS } from '@/lib/constants'
import { MapPin, Calendar, Clock } from 'lucide-react'
import type { OpenHouse } from '@/types'

export default async function OpenHouseFormPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createServerSupabase()

  const { data: openHouse } = await supabase
    .from('open_houses')
    .select('*')
    .eq('token_avaliacao', token)
    .single()

  if (!openHouse) notFound()

  const oh = openHouse as OpenHouse

  return (
    <div className="min-h-screen bg-pharos-dark">
      <div className="max-w-lg mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="w-14 h-14 bg-pharos-blue rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-xl font-bold text-white">{PHAROS.nome}</h1>
          <p className="text-white/70 text-sm mt-1">Avaliação de visita — Open House</p>
        </header>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 mb-6">
          <h2 className="font-semibold text-white text-lg mb-3">{oh.empreendimento}</h2>
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
            {(oh.horario_inicio || oh.horario_fim) && (
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-pharos-gold flex-shrink-0" />
                {(oh.horario_inicio ?? '').slice(0, 5) || '--:--'} às {(oh.horario_fim ?? '').slice(0, 5) || '--:--'}
              </p>
            )}
          </div>
        </div>

        <AvaliacaoForm openHouse={oh} />

        <p className="text-center text-white/50 text-xs mt-8">
          {PHAROS.nome} • {PHAROS.creci}
        </p>
      </div>
    </div>
  )
}
