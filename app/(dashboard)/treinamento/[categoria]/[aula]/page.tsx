import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createServerSupabase } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'
import { VideoPlayer } from '@/components/treinamento/VideoPlayer'
import { QuizSection } from '@/components/treinamento/QuizSection'
import { AulaClientWrapper } from './AulaClientWrapper'
import type { TreinamentoCategoria, TreinamentoAula, TreinamentoQuiz, TreinamentoProgresso } from '@/types'

export default async function AulaPage({
  params,
}: {
  params: Promise<{ categoria: string; aula: string }>
}) {
  const { categoria: slugParam, aula: aulaId } = await params
  const supabase = await createServerSupabase()

  const { data: categoriasData } = await supabase
    .from('treinamento_categorias')
    .select('*')
    .eq('ativo', true)

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

  const { data: aulaData, error: aulaError } = await supabase
    .from('treinamento_aulas')
    .select('*')
    .eq('id', aulaId)
    .eq('ativo', true)
    .single()

  const aula = aulaData as unknown as TreinamentoAula | null
  if (aulaError || !aula) {
    return (
      <div className="-m-4 lg:-m-6 min-h-screen bg-pharos-dark text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Aula não encontrada</h1>
          <Link
            href={`/treinamento/${slugParam}`}
            className="text-pharos-gold hover:underline"
          >
            Voltar à categoria
          </Link>
        </div>
      </div>
    )
  }

  const { data: quizQuestionsData } = await supabase
    .from('treinamento_quiz')
    .select('*')
    .eq('aula_id', aulaId)
    .order('ordem', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()
  const corretorId = user?.id ?? null

  const { data: progressData } = corretorId
    ? await supabase
        .from('treinamento_progresso')
        .select('concluida, pontos_ganhos')
        .eq('corretor_id', corretorId)
        .eq('aula_id', aulaId)
        .single()
    : { data: null }

  const progress = progressData as unknown as (Pick<TreinamentoProgresso, 'concluida' | 'pontos_ganhos'> | null)
  const slug = slugify(categoria.nome)
  const questions = ((quizQuestionsData ?? []) as unknown as TreinamentoQuiz[]).map((q) => ({
    ...q,
    alternativas: (q.alternativas as string[]) ?? [],
    resposta_correta: q.resposta_correta ?? 0,
    explicacao: q.explicacao ?? null,
    pontos: q.pontos ?? 5,
    ordem: q.ordem ?? 0,
  }))

  return (
    <div className="-m-4 lg:-m-6 min-h-screen bg-pharos-dark text-white">
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <Link
          href={`/treinamento/${slug}`}
          className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 min-h-[48px]"
        >
          <ChevronLeft className="w-5 h-5" /> Voltar
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold">{aula.titulo}</h1>
          {aula.descricao && (
            <p className="text-white/70 mt-1">{aula.descricao}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-white/60">
            {aula.duracao_minutos && (
              <span>{aula.duracao_minutos} min</span>
            )}
            <span>{aula.pontos ?? 0} pontos</span>
            {progress?.concluida && (
              <span className="text-pharos-gold">
                ✓ Concluída — {progress.pontos_ganhos ?? 0} pts ganhos
              </span>
            )}
          </div>
        </div>

        <AulaClientWrapper
          aula={aula}
          questions={questions}
          corretorId={corretorId}
          progress={progress}
        />
      </div>
    </div>
  )
}
