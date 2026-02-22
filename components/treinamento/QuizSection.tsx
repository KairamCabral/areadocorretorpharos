'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { TreinamentoProgresso, TreinamentoQuiz } from '@/types'

interface Props {
  aulaId: string
  questions: TreinamentoQuiz[]
  corretorId: string
  aulaPontos?: number
  onComplete?: (nota: number, pontosGanhos: number) => void
}

export function QuizSection({
  aulaId,
  questions,
  corretorId,
  aulaPontos = 10,
  onComplete,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [finished, setFinished] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const question = questions[currentIndex]

  const handleSelect = (index: number) => {
    if (answered) return
    setSelectedAnswer(index)
    setAnswered(true)
    const correct = index === question.resposta_correta
    if (correct) {
      const pts = question.pontos ?? 5
      setScore((s) => s + 1)
      setTotalPoints((p) => p + pts)
    }
  }

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
      setSelectedAnswer(null)
      setAnswered(false)
    } else {
      setFinished(true)
      if (corretorId && onComplete) {
        setSaving(true)
        const nota = questions.length > 0 ? (score / questions.length) * 100 : 0
        const quizPontos = totalPoints
        const pontosGanhos = aulaPontos + quizPontos

        const { data: existingData } = await supabase
          .from('treinamento_progresso')
          .select('id, pontos_ganhos')
          .eq('corretor_id', corretorId)
          .eq('aula_id', aulaId)
          .single()

        const existing = existingData as unknown as Pick<TreinamentoProgresso, 'id' | 'pontos_ganhos'> | null
        if (existing) {
          await (supabase
            .from('treinamento_progresso') as any)
            .update({
              concluida: true,
              nota_quiz: nota,
              pontos_ganhos: Math.max(existing.pontos_ganhos ?? 0, pontosGanhos),
              concluida_em: new Date().toISOString(),
            })
            .eq('id', existing.id)
        } else {
          await (supabase.from('treinamento_progresso') as any).insert({
            corretor_id: corretorId,
            aula_id: aulaId,
            concluida: true,
            nota_quiz: nota,
            pontos_ganhos: pontosGanhos,
            concluida_em: new Date().toISOString(),
          })
        }

        await (supabase.from('pontuacao') as any).insert({
          corretor_id: corretorId,
          tipo: 'treinamento',
          referencia_id: aulaId,
          pontos: pontosGanhos,
          descricao: `Quiz concluído - ${pontosGanhos} pontos`,
        })

        setSaving(false)
        onComplete(nota, pontosGanhos)
      }
    }
  }

  if (questions.length === 0) return null

  const alternativas = Array.isArray(question?.alternativas)
    ? question.alternativas
    : []

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4 lg:p-6">
      <h3 className="text-lg font-bold text-white mb-4">
        Quiz — Pergunta {currentIndex + 1} de {questions.length}
      </h3>

      {!finished ? (
        <>
          <p className="text-white/90 mb-4">{question?.pergunta}</p>
          <div className="space-y-2">
            {alternativas.map((alt, idx) => {
              const isSelected = selectedAnswer === idx
              const isCorrectOption = idx === question.resposta_correta
              const showResult = answered && (isSelected || isCorrectOption)

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={answered}
                  className={`w-full text-left p-4 rounded-lg border-2 transition min-h-[48px] flex items-center gap-3 ${
                    showResult
                      ? isCorrectOption
                        ? 'border-green-500 bg-green-500/20'
                        : isSelected
                          ? 'border-red-500 bg-red-500/20'
                          : 'border-white/10 bg-white/5'
                      : isSelected
                        ? 'border-pharos-gold bg-pharos-gold/20'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                >
                  {showResult && isCorrectOption && (
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                  )}
                  {showResult && isSelected && !isCorrectOption && (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                  <span className="text-white">{alt}</span>
                </button>
              )
            })}
          </div>

          {question?.explicacao && answered && (
            <div className="mt-4 p-4 rounded-lg bg-pharos-blue/20 border border-pharos-blue/40">
              <p className="text-sm text-white/90">{question.explicacao}</p>
            </div>
          )}

          {answered && (
            <button
              onClick={handleNext}
              className="mt-4 w-full py-3 bg-pharos-gold text-pharos-dark font-semibold rounded-xl hover:bg-pharos-gold/90 transition min-h-[48px]"
            >
              {currentIndex < questions.length - 1 ? 'Próxima' : 'Finalizar Quiz'}
            </button>
          )}
        </>
      ) : (
        <div className="text-center py-6">
          <p className="text-xl font-bold text-pharos-gold mb-2">
            Quiz concluído!
          </p>
          <p className="text-white/80">
            Você acertou {score} de {questions.length} perguntas.
          </p>
          <p className="text-pharos-gold font-semibold mt-2">
            +{aulaPontos + totalPoints} pontos
          </p>
          {saving && (
            <p className="text-white/60 text-sm mt-2">Salvando progresso...</p>
          )}
        </div>
      )}
    </div>
  )
}
