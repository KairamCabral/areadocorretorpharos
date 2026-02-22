'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VideoPlayer } from '@/components/treinamento/VideoPlayer'
import { QuizSection } from '@/components/treinamento/QuizSection'
import { CheckCircle2 } from 'lucide-react'
import type { TreinamentoAula, TreinamentoProgresso, TreinamentoQuiz } from '@/types'

interface Props {
  aula: TreinamentoAula
  questions: TreinamentoQuiz[]
  corretorId: string | null
  progress: { concluida: boolean; pontos_ganhos: number } | null
}

export function AulaClientWrapper({
  aula,
  questions,
  corretorId,
  progress,
}: Props) {
  const [completed, setCompleted] = useState(progress?.concluida ?? false)
  const [pointsEarned, setPointsEarned] = useState(progress?.pontos_ganhos ?? 0)
  const supabase = createClient()

  const hasVideo = !!aula.conteudo_url
  const hasText = !!aula.conteudo_texto
  const hasQuiz = questions.length > 0

  const saveProgress = async (pontos: number) => {
    if (!corretorId) return
    const { data } = await supabase
      .from('treinamento_progresso')
      .select('id, pontos_ganhos')
      .eq('corretor_id', corretorId)
      .eq('aula_id', aula.id)
      .single()

    const existing = data as unknown as (Pick<TreinamentoProgresso, 'id' | 'pontos_ganhos'> | null)
    const pontosGanhos = Math.max(existing?.pontos_ganhos ?? 0, pontos)

    if (existing) {
      await (supabase
        .from('treinamento_progresso') as any)
        .update({
          concluida: true,
          pontos_ganhos: pontosGanhos,
          concluida_em: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      await (supabase.from('treinamento_progresso') as any).insert({
        corretor_id: corretorId,
        aula_id: aula.id,
        concluida: true,
        pontos_ganhos: pontosGanhos,
        concluida_em: new Date().toISOString(),
      })
    }

    await (supabase.from('pontuacao') as any).insert({
      corretor_id: corretorId,
      tipo: 'treinamento',
      referencia_id: aula.id,
      pontos: pontosGanhos,
      descricao: `Aula concluída - ${pontosGanhos} pontos`,
    })

    setCompleted(true)
    setPointsEarned(pontosGanhos)
  }

  const handleVideoWatched = async () => {
    if (hasQuiz) return
    const pts = aula.pontos ?? 10
    await saveProgress(pts)
  }

  const handleQuizComplete = (nota: number, pontosGanhos: number) => {
    setCompleted(true)
    setPointsEarned(pontosGanhos)
  }

  const handleMarkComplete = async () => {
    if (!corretorId) return
    const pts = aula.pontos ?? 10
    await saveProgress(pts)
  }

  return (
    <div className="space-y-8">
      {hasVideo && (
        <VideoPlayer
          aula={aula}
          onWatched={handleVideoWatched}
        />
      )}

      {hasText && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 lg:p-6">
          <h3 className="text-lg font-bold text-white mb-4">Conteúdo</h3>
          {aula.conteudo_texto!.includes('<') ? (
            <div
              className="prose prose-invert prose-sm max-w-none text-white/90 [&_a]:text-pharos-gold [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: aula.conteudo_texto! }}
            />
          ) : (
            <div className="text-white/90 whitespace-pre-wrap">{aula.conteudo_texto}</div>
          )}
        </div>
      )}

      {hasQuiz && (
        corretorId ? (
          <QuizSection
            aulaId={aula.id}
            questions={questions}
            corretorId={corretorId}
            aulaPontos={aula.pontos ?? 10}
            onComplete={handleQuizComplete}
          />
        ) : (
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 lg:p-6">
            <p className="text-white/70">Faça login para fazer o quiz e ganhar pontos.</p>
          </div>
        )
      )}

      {!hasQuiz && !completed && corretorId && (hasVideo || hasText) && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 lg:p-6">
          <p className="text-white/80 mb-4">
            {hasVideo
              ? 'Assista o vídeo até o final para marcar como concluído.'
              : 'Clique no botão abaixo para marcar esta aula como concluída.'}
          </p>
          {hasVideo ? null : (
            <button
              onClick={handleMarkComplete}
              className="flex items-center gap-2 bg-pharos-gold text-pharos-dark px-6 py-3 rounded-xl font-semibold hover:bg-pharos-gold/90 transition min-h-[48px] min-w-[48px]"
            >
              <CheckCircle2 className="w-5 h-5" />
              Marcar como concluída
            </button>
          )}
        </div>
      )}

      {completed && (
        <div className="rounded-xl bg-green-500/20 border border-green-500/40 p-4 flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-green-400 shrink-0" />
          <div>
            <p className="font-semibold text-white">Aula concluída!</p>
            <p className="text-white/80 text-sm">+{pointsEarned} pontos ganhos</p>
          </div>
        </div>
      )}
    </div>
  )
}
