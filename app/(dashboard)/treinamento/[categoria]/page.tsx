import Link from 'next/link'
import { ChevronLeft, Play, CheckCircle2 } from 'lucide-react'
import { createServerSupabase } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'
import type { TreinamentoCategoria, TreinamentoAula, TreinamentoProgresso } from '@/types'

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>
}) {
  const { categoria: slugParam } = await params
  const supabase = await createServerSupabase()

  const { data: categoriasData } = await supabase
    .from('treinamento_categorias')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })

  const categorias = (categoriasData ?? []) as unknown as TreinamentoCategoria[]
  const categoria = categorias.find(
    (c) => slugify(c.nome) === slugParam
  )

  if (!categoria) {
    return (
      <div className="-m-4 lg:-m-6 min-h-screen bg-pharos-dark text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Categoria não encontrada</h1>
          <Link href="/treinamento" className="text-pharos-gold hover:underline">
            Voltar ao Treinamento
          </Link>
        </div>
      </div>
    )
  }

  const { data: aulasData } = await supabase
    .from('treinamento_aulas')
    .select('*')
    .eq('categoria_id', categoria.id)
    .eq('ativo', true)
    .order('ordem', { ascending: true })

  const aulasList = (aulasData ?? []) as unknown as TreinamentoAula[]

  let progressMap: Record<string, { concluida: boolean; pontos_ganhos: number }> = {}
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.id) {
    const { data: progressData } = await supabase
      .from('treinamento_progresso')
      .select('aula_id, concluida, pontos_ganhos')
      .eq('corretor_id', user.id)
      .in('aula_id', aulasList.map((a) => a.id))

    const progressList = (progressData ?? []) as unknown as Pick<TreinamentoProgresso, 'aula_id' | 'concluida' | 'pontos_ganhos'>[]
    progressMap = progressList.reduce(
      (acc, p) => {
        if (p.aula_id) acc[p.aula_id] = { concluida: p.concluida ?? false, pontos_ganhos: p.pontos_ganhos ?? 0 }
        return acc
      },
      {} as Record<string, { concluida: boolean; pontos_ganhos: number }>
    )
  }

  const concluidas = aulasList.filter((a) => progressMap[a.id]?.concluida).length
  const totalPontos = aulasList.reduce((sum, a) => sum + (a.pontos ?? 0), 0)
  const pontosGanhos = aulasList.reduce(
    (sum, a) => sum + (progressMap[a.id]?.pontos_ganhos ?? 0),
    0
  )
  const percentual =
    aulasList.length > 0 ? Math.round((concluidas / aulasList.length) * 100) : 0

  const slug = slugify(categoria.nome)
  const cor = categoria.cor ?? '#1B4DDB'

  return (
    <div className="-m-4 lg:-m-6 min-h-screen bg-pharos-dark text-white">
      <div className="p-4 lg:p-6">
        <Link
          href="/treinamento"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 min-h-[48px] min-w-[48px]"
        >
          <ChevronLeft className="w-5 h-5" /> Voltar
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold">{categoria.nome}</h1>
        {categoria.descricao && (
          <p className="text-white/70 mt-1 text-sm">{categoria.descricao}</p>
        )}
        <div className="mt-4 flex items-center gap-3 text-sm text-white/60">
          <span>{percentual}% concluído</span>
          <div className="flex-1 max-w-xs h-1.5 bg-white/10 rounded-full">
            <div
              className="h-full bg-pharos-gold rounded-full transition-all"
              style={{ width: `${percentual}%` }}
            />
          </div>
          <span>{pontosGanhos} / {totalPontos} pts</span>
        </div>
      </div>
      <div className="px-4 lg:px-6 pb-8">
        {aulasList.length === 0 ? (
          <p className="text-white/50 text-center py-12">
            Nenhuma aula cadastrada ainda.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aulasList.map((aula) => {
              const progress = progressMap[aula.id]
              const concluida = progress?.concluida ?? false

              return (
                <Link
                  key={aula.id}
                  href={`/treinamento/${slug}/${aula.id}`}
                  className="group block rounded-xl overflow-hidden bg-white/5 hover:bg-white/10 transition min-h-[48px]"
                >
                  <div
                    className="relative aspect-video"
                    style={{ backgroundColor: `${cor}30` }}
                  >
                    {aula.thumbnail_url ? (
                      <img
                        src={aula.thumbnail_url}
                        alt={aula.titulo}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center min-w-[48px] min-h-[48px]">
                        <Play className="w-7 h-7 text-pharos-dark fill-current ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      {concluida && (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      )}
                      <span className="text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                        {aula.duracao_minutos ? `${aula.duracao_minutos} min` : '—'}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-2">
                      <span className="text-xs bg-pharos-gold/90 text-pharos-dark px-2 py-0.5 rounded font-medium">
                        {aula.pontos ?? 0} pts
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-white group-hover:text-pharos-gold transition truncate">
                      {aula.titulo}
                    </h3>
                    {aula.descricao && (
                      <p className="text-white/60 text-xs mt-1 line-clamp-2">
                        {aula.descricao}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
