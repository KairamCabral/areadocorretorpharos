import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Calculator, ChevronRight } from 'lucide-react'
import type { Simulacao } from '@/types'

export default async function SimuladorPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('simulacoes')
    .select('id, empreendimento_nome, cidade, valor_lancamento, status, created_at')
    .eq('corretor_id', user.id)
    .order('created_at', { ascending: false })

  const simulacoes = (data ?? []) as unknown as Simulacao[]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Simulador de Investimento</h1>
        <Link
          href="/ferramentas/simulador/novo"
          className="flex items-center gap-2 px-4 py-3 bg-pharos-blue text-white font-medium rounded-xl hover:bg-pharos-blue-dark transition min-h-[48px]"
        >
          <Plus className="w-5 h-5" />
          Nova simulação
        </Link>
      </div>

      {!simulacoes?.length ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-pharos-blue/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Calculator className="w-8 h-8 text-pharos-blue" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma simulação ainda
          </h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Crie sua primeira simulação para comparar investimento imobiliário com renda fixa.
          </p>
          <Link
            href="/ferramentas/simulador/novo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-pharos-blue text-white font-medium rounded-xl hover:bg-pharos-blue-dark transition min-h-[48px]"
          >
            <Plus className="w-5 h-5" />
            Criar simulação
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {simulacoes.map((s) => (
            <Link
              key={s.id}
              href={`/ferramentas/simulador/${s.id}`}
              className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-pharos-blue/10 flex items-center justify-center flex-shrink-0">
                <Calculator className="w-6 h-6 text-pharos-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-pharos-blue transition truncate">
                  {s.empreendimento_nome}
                </h3>
                <p className="text-sm text-gray-500">
                  {s.cidade} • {formatCurrency(Number(s.valor_lancamento))}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-lg ${
                    s.status === 'concluida'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {s.status === 'concluida' ? 'Concluída' : 'Rascunho'}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDate(s.created_at)}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
