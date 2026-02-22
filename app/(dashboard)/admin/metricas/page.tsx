import { createAdminSupabase } from '@/lib/supabase/server'
import { MetricasCharts } from './metricas-charts'
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function MetricasPage() {
  const supabase = await createAdminSupabase()

  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i)
    return {
      key: format(d, 'yyyy-MM'),
      label: format(d, 'MMM/yy', { locale: ptBR }),
      start: startOfMonth(d),
      end: endOfMonth(d),
    }
  })

  const avaliacoesPorMes = await Promise.all(
    months.map(async (m) => {
      const { count } = await supabase
        .from('avaliacoes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', m.start.toISOString())
        .lte('created_at', m.end.toISOString())
      return { mes: m.label, total: count ?? 0 }
    })
  )

  const simulacoesPorMes = await Promise.all(
    months.map(async (m) => {
      const { count } = await supabase
        .from('simulacoes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', m.start.toISOString())
        .lte('created_at', m.end.toISOString())
      return { mes: m.label, total: count ?? 0 }
    })
  )

  const { data: avaliacoesPorCorretor } = await supabase
    .from('avaliacoes')
    .select('corretor_id')

  const { data: simulacoesPorCorretor } = await supabase
    .from('simulacoes')
    .select('corretor_id')

  const countByCorretor = new Map<string, number>()
  for (const a of avaliacoesPorCorretor ?? []) {
    if (a.corretor_id) {
      countByCorretor.set(a.corretor_id, (countByCorretor.get(a.corretor_id) ?? 0) + 1)
    }
  }
  for (const s of simulacoesPorCorretor ?? []) {
    if (s.corretor_id) {
      countByCorretor.set(
        s.corretor_id,
        (countByCorretor.get(s.corretor_id) ?? 0) + 1
      )
    }
  }

  const topCorretoresIds = [...countByCorretor.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id)

  const { data: profiles } =
    topCorretoresIds.length > 0
      ? await supabase.from('profiles').select('id, nome').in('id', topCorretoresIds)
      : { data: [] }
  const nomePorId = new Map((profiles ?? []).map((p) => [p.id, p.nome]))

  const topCorretores = topCorretoresIds.map((id) => ({
    nome: nomePorId.get(id) ?? 'Corretor',
    total: countByCorretor.get(id) ?? 0,
  }))

  const { data: progressoConcluido } = await supabase
    .from('treinamento_progresso')
    .select('id')
    .eq('concluida', true)

  const { data: aulasAtivas } = await supabase
    .from('treinamento_aulas')
    .select('id')
    .eq('ativo', true)

  const { count: totalCorretores } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('ativo', true)

  const totalAulas = aulasAtivas?.length ?? 0
  const totalConcluido = progressoConcluido?.length ?? 0
  const totalPossivel = totalAulas * (totalCorretores ?? 0)
  const completionRate =
    totalPossivel > 0 ? ((totalConcluido / totalPossivel) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pharos-dark">Métricas</h1>
        <p className="text-gray-500 mt-0.5">Acompanhe o desempenho da plataforma</p>
      </div>

      <MetricasCharts
        avaliacoesPorMes={avaliacoesPorMes}
        simulacoesPorMes={simulacoesPorMes}
        topCorretores={topCorretores}
        completionRate={completionRate}
      />
    </div>
  )
}
