import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type TypedSupabase = SupabaseClient<Database>

/**
 * Registra pontos para um corretor na tabela pontuacao.
 */
export async function registrarPontos(
  supabase: TypedSupabase,
  corretorId: string,
  tipo: string,
  referenciaId: string | null,
  pontos: number,
  descricao: string | null = null
) {
  const { error } = await (supabase.from('pontuacao') as any).insert({
    corretor_id: corretorId,
    tipo,
    referencia_id: referenciaId,
    pontos,
    descricao,
  })
  if (error) throw error
}

/**
 * Verifica se o corretor atende ao critério do badge e concede o badge se aplicável.
 * Retorna true se o badge foi concedido, false caso contrário.
 */
export async function verificarBadge(
  supabase: TypedSupabase,
  corretorId: string,
  criterio: string
): Promise<boolean> {
  const { data: badge } = await supabase
    .from('badges')
    .select('id, pontos_bonus')
    .eq('criterio', criterio)
    .single()

  if (!badge) return false

  const { data: jaTem } = await supabase
    .from('corretor_badges')
    .select('id')
    .eq('corretor_id', corretorId)
    .eq('badge_id', badge.id)
    .single()

  if (jaTem) return false

  let atende = false

  switch (criterio) {
    case 'primeira_avaliacao': {
      const { count } = await supabase
        .from('avaliacoes')
        .select('*', { count: 'exact', head: true })
        .eq('corretor_id', corretorId)
      atende = (count ?? 0) >= 1
      break
    }
    case '10_simulacoes': {
      const { count } = await supabase
        .from('simulacoes')
        .select('*', { count: 'exact', head: true })
        .eq('corretor_id', corretorId)
      atende = (count ?? 0) >= 10
      break
    }
    case 'completar_vendas':
    case 'completar_marketing': {
      const termo = criterio === 'completar_vendas' ? 'vendas' : 'marketing'
      const { data: cats } = await supabase
        .from('treinamento_categorias')
        .select('id')
        .ilike('nome', `%${termo}%`)
      const cat = (cats ?? [])[0]
      if (!cat?.id) break
      const { data: aulas } = await supabase
        .from('treinamento_aulas')
        .select('id')
        .eq('categoria_id', cat.id)
        .eq('ativo', true)
      const aulaIds = (aulas ?? []).map((a) => a.id)
      if (aulaIds.length === 0) break
      const { data: progresso } = await supabase
        .from('treinamento_progresso')
        .select('aula_id')
        .eq('corretor_id', corretorId)
        .eq('concluida', true)
      const concluidas = new Set((progresso ?? []).map((p) => p.aula_id))
      atende = aulaIds.every((id) => concluidas.has(id))
      break
    }
    case 'quiz_master_5': {
      const { data: progresso } = await supabase
        .from('treinamento_progresso')
        .select('nota_quiz')
        .eq('corretor_id', corretorId)
        .not('nota_quiz', 'is', null)
      const comNota = (progresso ?? []).filter((p) => p.nota_quiz != null && p.nota_quiz >= 80)
      atende = comNota.length >= 5
      break
    }
    case 'corretor_do_mes':
      atende = false
      break
    default:
      atende = false
  }

  if (!atende) return false

  const { error } = await (supabase.from('corretor_badges') as any).insert({
    corretor_id: corretorId,
    badge_id: badge.id,
  })
  if (error) throw error

  if (badge.pontos_bonus && badge.pontos_bonus > 0) {
    await registrarPontos(
      supabase,
      corretorId,
      'badge',
      badge.id,
      badge.pontos_bonus,
      `Badge: ${criterio}`
    )
  }

  return true
}

/**
 * Retorna o total de pontos do corretor (soma da tabela pontuacao).
 */
export async function getTotalPontos(
  supabase: TypedSupabase,
  corretorId: string
): Promise<number> {
  const { data } = await supabase
    .from('pontuacao')
    .select('pontos')
    .eq('corretor_id', corretorId)

  const total = (data ?? []).reduce((acc, row) => acc + (row.pontos ?? 0), 0)
  return total
}

/**
 * Retorna o ranking dos corretores por total de pontos (top N).
 */
export async function getRanking(
  supabase: TypedSupabase,
  limit = 10
): Promise<{ corretor_id: string; nome: string; total_pontos: number }[]> {
  const { data } = await supabase
    .from('pontuacao')
    .select('corretor_id, pontos')

  const byCorretor = new Map<string, number>()
  for (const row of data ?? []) {
    const id = row.corretor_id
    if (!id) continue
    byCorretor.set(id, (byCorretor.get(id) ?? 0) + (row.pontos ?? 0))
  }

  const sorted = [...byCorretor.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)

  if (sorted.length === 0) return []

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nome')
    .in('id', sorted.map(([id]) => id))

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.nome ?? '']))

  return sorted.map(([corretor_id, total_pontos]) => ({
    corretor_id,
    nome: profileMap.get(corretor_id) ?? 'Corretor',
    total_pontos,
  }))
}
