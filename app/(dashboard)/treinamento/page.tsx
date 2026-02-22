import { NetflixHero } from '@/components/treinamento/NetflixHero'
import { NetflixCarousel } from '@/components/treinamento/NetflixCarousel'
import { createServerSupabase } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'
import type { TreinamentoCategoria } from '@/types'

export default async function TreinamentoPage() {
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .from('treinamento_categorias')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })

  const cats = (data ?? []) as unknown as TreinamentoCategoria[]

  return (
    <div className="-m-4 lg:-m-6 min-h-screen bg-pharos-dark">
      <NetflixHero categorias={cats} />
      <div className="space-y-8 px-4 lg:px-8 pb-8 -mt-16 relative z-10">
        {cats.map((cat) => (
          <NetflixCarousel
            key={cat.id}
            titulo={cat.nome}
            slug={slugify(cat.nome)}
            cor={cat.cor ?? '#1B4DDB'}
            categoriaId={cat.id}
          />
        ))}
      </div>
    </div>
  )
}
