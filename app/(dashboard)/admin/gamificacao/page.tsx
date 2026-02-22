import { createAdminSupabase } from '@/lib/supabase/server'
import { getRanking } from '@/lib/gamificacao'
import { GamificacaoManager } from './gamificacao-manager'
import type { Badge } from '@/types'

export default async function GamificacaoPage() {
  const supabase = await createAdminSupabase()

  const ranking = await getRanking(supabase, 20)

  const { data: badges } = await supabase
    .from('badges')
    .select('*')
    .order('nome')

  const { data: pontuacaoTotal } = await supabase
    .from('pontuacao')
    .select('pontos')

  const totalPontos = (pontuacaoTotal ?? []).reduce((acc, p) => acc + (p.pontos ?? 0), 0)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nome')
    .eq('ativo', true)
    .order('nome')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pharos-dark">Gamificação</h1>
        <p className="text-gray-500 mt-0.5">Ranking, badges e pontos da plataforma</p>
      </div>

      <GamificacaoManager
        ranking={ranking}
        badges={(badges ?? []) as Badge[]}
        totalPontos={totalPontos}
        corretores={(profiles ?? []).map((p) => ({ id: p.id, nome: p.nome }))}
      />
    </div>
  )
}
