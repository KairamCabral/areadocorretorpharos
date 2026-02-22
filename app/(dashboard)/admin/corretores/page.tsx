import { createAdminSupabase } from '@/lib/supabase/server'
import { CorretoresTable } from './corretores-table'
import type { Profile } from '@/types'

export default async function CorretoresPage() {
  const supabase = await createAdminSupabase()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nome, telefone, role, ativo, created_at')
    .order('nome')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pharos-dark">Corretores</h1>
        <p className="text-gray-500 mt-0.5">Gerencie perfis, funções e status dos corretores</p>
      </div>
      <CorretoresTable profiles={(profiles ?? []) as Profile[]} />
    </div>
  )
}
