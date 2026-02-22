import { createAdminSupabase } from '@/lib/supabase/server'
import { TreinamentoManager } from './treinamento-manager'
import type { TreinamentoCategoria, TreinamentoAula } from '@/types'

interface CategoriaComAulas extends TreinamentoCategoria {
  aulas: TreinamentoAula[]
}

export default async function TreinamentoPage() {
  const supabase = await createAdminSupabase()

  const { data: categorias } = await supabase
    .from('treinamento_categorias')
    .select('*')
    .order('ordem')

  const { data: aulas } = await supabase
    .from('treinamento_aulas')
    .select('*')
    .order('ordem')

  const categoriasComAulas = (categorias ?? []).map((cat) => ({
    ...cat,
    aulas: (aulas ?? []).filter((a) => a.categoria_id === cat.id),
  })) as CategoriaComAulas[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pharos-dark">Treinamento</h1>
        <p className="text-gray-500 mt-0.5">Gerencie categorias e aulas de treinamento</p>
      </div>
      <TreinamentoManager categorias={categoriasComAulas} />
    </div>
  )
}
