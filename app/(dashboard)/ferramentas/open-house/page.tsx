import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Plus, DoorOpen, MapPin, Calendar } from 'lucide-react'
import type { OpenHouse } from '@/types'

const STATUS_CONFIG = {
  agendado: { label: 'Agendado', className: 'bg-amber-100 text-amber-800' },
  em_andamento: { label: 'Em andamento', className: 'bg-pharos-blue/10 text-pharos-blue' },
  finalizado: { label: 'Finalizado', className: 'bg-emerald-100 text-emerald-700' },
} as const

export default async function OpenHouseListPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: openHouses } = await supabase
    .from('open_houses')
    .select(`
      *,
      open_house_avaliacoes(count)
    `)
    .eq('criado_por', user.id)
    .order('data_evento', { ascending: false })

  const items = (openHouses ?? []) as (OpenHouse & { open_house_avaliacoes: { count: number }[] })[]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Open House</h1>
          <p className="text-gray-500 mt-0.5">Gerencie visitas e colete avaliações de corretores</p>
        </div>
        <Link
          href="/ferramentas/open-house/novo"
          className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 bg-pharos-blue text-white font-semibold rounded-xl hover:bg-pharos-blue/90 transition shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Novo Open House
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 lg:p-12 border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-pharos-blue/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <DoorOpen className="w-8 h-8 text-pharos-blue" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Nenhum Open House ainda</h2>
          <p className="text-gray-500 mt-1 max-w-sm mx-auto">
            Crie seu primeiro Open House para coletar avaliações de corretores visitantes e gerar relatórios para o proprietário.
          </p>
          <Link
            href="/ferramentas/open-house/novo"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] mt-6 px-6 py-3 bg-pharos-blue text-white font-semibold rounded-xl hover:bg-pharos-blue/90 transition"
          >
            <Plus className="w-5 h-5" />
            Criar Open House
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((oh) => {
            const status = (STATUS_CONFIG[oh.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.agendado) as { label: string; className: string }
            const avaliacoesCount = Array.isArray(oh.open_house_avaliacoes)
              ? (oh.open_house_avaliacoes[0] as { count: number })?.count ?? 0
              : 0

            return (
              <Link
                key={oh.id}
                href={`/ferramentas/open-house/${oh.id}`}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-pharos-blue/20 transition group block"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-pharos-blue transition truncate">
                      {oh.empreendimento}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      {oh.endereco}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {formatDate(oh.data_evento)}
                  </span>
                  <span className="font-medium text-pharos-blue">
                    {avaliacoesCount} {avaliacoesCount === 1 ? 'avaliação' : 'avaliações'}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                  {oh.cidade}{oh.bairro ? ` • ${oh.bairro}` : ''}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
