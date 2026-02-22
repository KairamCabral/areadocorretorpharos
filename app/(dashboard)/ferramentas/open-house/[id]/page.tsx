import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { ShareLinks } from '@/components/open-house/ShareLinks'
import { ArrowLeft, MapPin, Calendar, Clock, User, Phone, Star } from 'lucide-react'
import type { OpenHouse, OpenHouseAvaliacao } from '@/types'

const STATUS_CONFIG = {
  agendado: { label: 'Agendado', className: 'bg-amber-100 text-amber-800' },
  em_andamento: { label: 'Em andamento', className: 'bg-pharos-blue/10 text-pharos-blue' },
  finalizado: { label: 'Finalizado', className: 'bg-emerald-100 text-emerald-700' },
} as const

const COMPRARIA_LABELS = {
  sim: 'Sim',
  nao: 'Não',
  talvez: 'Talvez',
} as const

export default async function OpenHouseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: openHouse } = await supabase
    .from('open_houses')
    .select('*')
    .eq('id', id)
    .eq('criado_por', user.id)
    .single()

  if (!openHouse) notFound()

  const { data: avaliacoes } = await supabase
    .from('open_house_avaliacoes')
    .select('*')
    .eq('open_house_id', id)
    .order('created_at', { ascending: false })

  const oh = openHouse as OpenHouse
  const avals = (avaliacoes ?? []) as OpenHouseAvaliacao[]
  const status = (STATUS_CONFIG[oh.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.agendado) as { label: string; className: string }

  const mediaGeral = avals.length > 0
    ? avals.reduce((s, a) => s + (a.nota_media ?? 0), 0) / avals.length
    : 0
  const comprariaBreakdown = avals.reduce(
    (acc, a) => {
      const k = (a.compraria ?? 'talvez') as keyof typeof COMPRARIA_LABELS
      acc[k] = (acc[k] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link
          href="/ferramentas/open-house"
          className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 truncate">{oh.empreendimento}</h1>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${status.className}`}>
              {status.label}
            </span>
          </div>
          <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
            {oh.endereco}
            {oh.bairro && ` • ${oh.bairro}`} • {oh.cidade}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Total de avaliações</p>
          <p className="text-2xl font-bold text-pharos-blue mt-1">{avals.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Média geral</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {avals.length > 0 ? mediaGeral.toFixed(1) : '-'}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm sm:col-span-2">
          <p className="text-sm text-gray-500 mb-2">Compraria</p>
          <div className="flex gap-3 flex-wrap">
            {(['sim', 'nao', 'talvez'] as const).map((k) => (
              <span key={k} className="text-sm">
                <span className="font-medium text-gray-900">{COMPRARIA_LABELS[k]}:</span>{' '}
                <span className="text-gray-600">{comprariaBreakdown[k] ?? 0}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Detalhes do evento</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formatDate(oh.data_evento)}</span>
          </div>
          {(oh.horario_inicio || oh.horario_fim) && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>
                {(oh.horario_inicio ?? '').slice(0, 5) || '--:--'} às {(oh.horario_fim ?? '').slice(0, 5) || '--:--'}
              </span>
            </div>
          )}
          {oh.unidade && (
            <p>
              <span className="text-gray-500">Unidade:</span> {oh.unidade}
            </p>
          )}
          {(oh.proprietario_nome || oh.proprietario_telefone) && (
            <div className="flex flex-wrap gap-4 pt-2">
              {oh.proprietario_nome && (
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4 text-gray-400" />
                  {oh.proprietario_nome}
                </span>
              )}
              {oh.proprietario_telefone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {oh.proprietario_telefone}
                </span>
              )}
            </div>
          )}
          {oh.observacoes && (
            <p className="pt-2 text-gray-600">{oh.observacoes}</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Compartilhar links</h2>
        <ShareLinks
          tokenAvaliacao={oh.token_avaliacao ?? ''}
          tokenResultado={oh.token_resultado ?? ''}
          empreendimento={oh.empreendimento}
        />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Avaliações recebidas</h2>
        {avals.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma avaliação ainda. Compartilhe o link do formulário com os corretores visitantes.</p>
        ) : (
          <ul className="space-y-4">
            {avals.map((a) => (
              <li
                key={a.id}
                className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{a.nome_corretor}</p>
                  <p className="text-sm text-gray-500">{a.imobiliaria}</p>
                  {a.telefone && (
                    <p className="text-xs text-gray-400 mt-0.5">{a.telefone}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Star className="w-4 h-4 fill-pharos-gold text-pharos-gold" />
                  <span className="font-semibold text-gray-900">
                    {(a.nota_media ?? 0).toFixed(1)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
