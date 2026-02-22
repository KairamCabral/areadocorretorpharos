import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Home, FileText } from 'lucide-react'
import type { Avaliacao } from '@/types'

const STATUS_CONFIG = {
  rascunho: { label: 'Rascunho', className: 'bg-gray-100 text-gray-700' },
  concluida: { label: 'Concluída', className: 'bg-emerald-100 text-emerald-700' },
  enviada: { label: 'Enviada', className: 'bg-pharos-blue/10 text-pharos-blue' },
} as const

export default async function AvaliacaoListPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: avaliacoes } = await supabase
    .from('avaliacoes')
    .select('*')
    .eq('corretor_id', user.id)
    .order('created_at', { ascending: false })

  const items = (avaliacoes ?? []) as Avaliacao[]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Avaliação de Imóvel</h1>
          <p className="text-gray-500 mt-0.5">Análise comparativa com IA pelo método MCA</p>
        </div>
        <Link
          href="/ferramentas/avaliacao/nova"
          className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 bg-pharos-blue text-white font-semibold rounded-xl hover:bg-pharos-blue-dark transition shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nova avaliação
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 lg:p-12 border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-pharos-blue/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Home className="w-8 h-8 text-pharos-blue" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Nenhuma avaliação ainda</h2>
          <p className="text-gray-500 mt-1 max-w-sm mx-auto">
            Crie sua primeira avaliação de imóvel usando inteligência artificial para buscar comparáveis no mercado.
          </p>
          <Link
            href="/ferramentas/avaliacao/nova"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] mt-6 px-6 py-3 bg-pharos-blue text-white font-semibold rounded-xl hover:bg-pharos-blue-dark transition"
          >
            <Plus className="w-5 h-5" />
            Criar avaliação
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => {
            const status = STATUS_CONFIG[a.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.rascunho
            return (
              <Link
                key={a.id}
                href={`/ferramentas/avaliacao/${a.id}`}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-pharos-blue/20 transition group block"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-pharos-blue transition truncate">
                      {a.bairro}, {a.cidade}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">
                      {a.endereco || 'Sem endereço'}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <span className="text-gray-500">
                    {a.m2_privativo} m²
                  </span>
                  {a.valor_avaliado != null && (
                    <span className="font-semibold text-pharos-blue">
                      {formatCurrency(a.valor_avaliado)}
                    </span>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>{formatDate(a.created_at)}</span>
                  <FileText className="w-3.5 h-3.5" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
