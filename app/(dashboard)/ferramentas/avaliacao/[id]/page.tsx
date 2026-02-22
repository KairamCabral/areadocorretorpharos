import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { formatCurrency, formatDate, generateWhatsAppLink } from '@/lib/utils'
import { PHAROS } from '@/lib/constants'
import {
  ArrowLeft,
  Share2,
  Home,
  MapPin,
  Ruler,
  Bed,
  Car,
  Building2,
} from 'lucide-react'
import type { Avaliacao, AvaliacaoComparavel } from '@/types'

const STATUS_CONFIG = {
  rascunho: { label: 'Rascunho', className: 'bg-gray-100 text-gray-700' },
  concluida: { label: 'Concluída', className: 'bg-emerald-100 text-emerald-700' },
  enviada: { label: 'Enviada', className: 'bg-pharos-blue/10 text-pharos-blue' },
} as const

export default async function AvaliacaoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: avaliacao, error } = await supabase
    .from('avaliacoes')
    .select('*')
    .eq('id', id)
    .eq('corretor_id', user.id)
    .single()

  if (error || !avaliacao) notFound()

  const { data: comparaveis } = await supabase
    .from('avaliacao_comparaveis')
    .select('*')
    .eq('avaliacao_id', id)
    .order('ordem', { ascending: true })

  const av = avaliacao as Avaliacao
  const comps = (comparaveis ?? []) as AvaliacaoComparavel[]
  const status = STATUS_CONFIG[av.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.rascunho
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.VERCEL_URL || 'localhost:3000'}`
  const publicUrl = `${baseUrl}/p/avaliacao/${av.token_publico}`
  const whatsappMsg = `Olá! Segue o link da avaliação do imóvel: ${publicUrl}`
  const rawPhone = (av.proprietario_telefone || PHAROS.telefone || '').replace(/\D/g, '')
  const fullPhone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`
  const shareLink = fullPhone ? generateWhatsAppLink(fullPhone, whatsappMsg) : '#'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/ferramentas/avaliacao"
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {av.bairro}, {av.cidade}
            </h1>
            <p className="text-gray-500 text-sm">{av.endereco || 'Sem endereço'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${status.className}`}>
            {status.label}
          </span>
          <a
            href={shareLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-[48px] px-4 py-2 bg-pharos-blue text-white font-semibold rounded-xl hover:bg-pharos-blue-dark transition"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Property info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Dados do imóvel</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pharos-blue/10 flex items-center justify-center">
                  <Home className="w-5 h-5 text-pharos-blue" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tipo</p>
                  <p className="font-medium capitalize">{av.tipo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pharos-blue/10 flex items-center justify-center">
                  <Ruler className="w-5 h-5 text-pharos-blue" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Área privativa</p>
                  <p className="font-medium">{av.m2_privativo} m²</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pharos-blue/10 flex items-center justify-center">
                  <Bed className="w-5 h-5 text-pharos-blue" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Quartos / Suítes / Banheiros</p>
                  <p className="font-medium">
                    {av.quartos ?? '-'} / {av.suites ?? '-'} / {av.banheiros ?? '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pharos-blue/10 flex items-center justify-center">
                  <Car className="w-5 h-5 text-pharos-blue" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Vagas</p>
                  <p className="font-medium">{av.vagas ?? '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pharos-blue/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-pharos-blue" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Infraestrutura / Mobília</p>
                  <p className="font-medium">
                    {av.infra_lazer ?? '-'} / {av.mobilia ?? '-'}
                  </p>
                </div>
              </div>
              {av.idade_predio != null && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pharos-blue/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-pharos-blue" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Idade do prédio</p>
                    <p className="font-medium">{av.idade_predio} anos</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comparáveis */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Comparáveis ({comps.length})</h2>
            {comps.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum comparável cadastrado.</p>
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-medium text-gray-600">Código</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600">Empreendimento</th>
                      <th className="text-right py-3 px-2 font-medium text-gray-600">Valor</th>
                      <th className="text-right py-3 px-2 font-medium text-gray-600">m²</th>
                      <th className="text-center py-3 px-2 font-medium text-gray-600">Peso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comps.map((c) => (
                      <tr key={c.id} className="border-b border-gray-100">
                        <td className="py-3 px-2">{c.codigo || '-'}</td>
                        <td className="py-3 px-2">{c.empreendimento || '-'}</td>
                        <td className="py-3 px-2 text-right font-medium">
                          {c.valor_total != null ? formatCurrency(c.valor_total) : '-'}
                        </td>
                        <td className="py-3 px-2 text-right">{c.m2_privativo ?? '-'}</td>
                        <td className="py-3 px-2 text-center">{c.peso ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Results sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Resultado da avaliação</h2>
            <div className="space-y-4">
              {av.valor_m2_medio != null && (
                <div>
                  <p className="text-xs text-gray-500">Valor/m² médio</p>
                  <p className="text-lg font-bold text-pharos-blue">
                    {formatCurrency(av.valor_m2_medio)}/m²
                  </p>
                </div>
              )}
              {av.valor_comercial != null && (
                <div>
                  <p className="text-xs text-gray-500">Valor comercial</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {formatCurrency(av.valor_comercial)}
                  </p>
                </div>
              )}
              {av.valor_avaliado != null && (
                <div>
                  <p className="text-xs text-gray-500">Valor avaliado</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(av.valor_avaliado)}
                  </p>
                </div>
              )}
              {av.valor_maximo != null && (
                <div>
                  <p className="text-xs text-gray-500">Valor máximo</p>
                  <p className="text-lg font-bold text-amber-600">
                    {formatCurrency(av.valor_maximo)}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Criado em {formatDate(av.created_at)}
          </div>
        </div>
      </div>
    </div>
  )
}
