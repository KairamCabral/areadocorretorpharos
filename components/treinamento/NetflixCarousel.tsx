'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Play, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import type { TreinamentoAula } from '@/types'

interface Props {
  titulo: string
  slug: string
  cor: string
  categoriaId: string
}

interface AulaWithProgress extends TreinamentoAula {
  concluida?: boolean
  progresso_percentual?: number
}

export function NetflixCarousel({ titulo, slug, cor, categoriaId }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [aulas, setAulas] = useState<AulaWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: aulasDataRaw } = await supabase
        .from('treinamento_aulas')
        .select('*')
        .eq('categoria_id', categoriaId)
        .eq('ativo', true)
        .order('ordem', { ascending: true })

      const aulasData = (aulasDataRaw ?? []) as unknown as TreinamentoAula[]

      if (!aulasData?.length) {
        setAulas([])
        setLoading(false)
        return
      }

      let aulasWithProgress = aulasData as AulaWithProgress[]

      if (user?.id) {
        const { data: progressDataRaw } = await supabase
          .from('treinamento_progresso')
          .select('aula_id, concluida')
          .eq('corretor_id', user.id)
          .in('aula_id', aulasData.map((a) => a.id))

        const progressData = (progressDataRaw ?? []) as unknown as { aula_id: string; concluida: boolean }[]
        const progressMap = new Map(
          progressData.map((p) => [p.aula_id, p.concluida])
        )
        aulasWithProgress = aulasData.map((a) => ({
          ...a,
          concluida: progressMap.get(a.id) ?? false,
          progresso_percentual: progressMap.get(a.id) ? 100 : 0,
        })) as AulaWithProgress[]
      }

      setAulas(aulasWithProgress)
      setLoading(false)
    }

    fetchData()
  }, [categoriaId, user?.id])

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="group/carousel">
        <div className="flex items-center justify-between mb-3">
          <Link href={`/treinamento/${slug}`} className="text-white text-lg lg:text-xl font-bold hover:text-pharos-gold transition">
            {titulo}<ChevronRight className="inline w-5 h-5 ml-1 opacity-0 group-hover/carousel:opacity-100 transition" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-[200px] lg:w-[240px] animate-pulse">
              <div className="aspect-video rounded-lg bg-white/10" />
              <div className="h-4 bg-white/10 rounded mt-2 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (aulas.length === 0) return null

  return (
    <div className="group/carousel">
      <div className="flex items-center justify-between mb-3">
        <Link href={`/treinamento/${slug}`} className="text-white text-lg lg:text-xl font-bold hover:text-pharos-gold transition">
          {titulo}<ChevronRight className="inline w-5 h-5 ml-1 opacity-0 group-hover/carousel:opacity-100 transition" />
        </Link>
      </div>
      <div className="relative group/scroll">
        <button onClick={() => scroll('left')} className="absolute left-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-r from-pharos-dark to-transparent hidden group-hover/scroll:flex items-center justify-center min-h-[120px]">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button onClick={() => scroll('right')} className="absolute right-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-l from-pharos-dark to-transparent hidden group-hover/scroll:flex items-center justify-center min-h-[120px]">
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto carousel-scroll scrollbar-netflix">
          {aulas.map((aula) => (
            <Link key={aula.id} href={`/treinamento/${slug}/${aula.id}`} className="flex-shrink-0 w-[200px] lg:w-[240px] group/card min-h-[48px]">
              <div className="relative aspect-video rounded-lg overflow-hidden mb-2 transition-transform group-hover/card:scale-105" style={{ backgroundColor: `${cor}20` }}>
                {aula.thumbnail_url ? (
                  <img src={aula.thumbnail_url} alt={aula.titulo} className="absolute inset-0 w-full h-full object-cover" />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-2 right-2">
                  {aula.concluida && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center min-w-[48px] min-h-[48px]">
                    <Play className="w-6 h-6 text-pharos-dark fill-current ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                  {aula.duracao_minutos ? `${aula.duracao_minutos} min` : '—'}
                </span>
                {aula.concluida && (
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20"><div className="h-full bg-pharos-gold" style={{ width: '100%' }} /></div>
                )}
              </div>
              <h3 className="text-white text-sm font-medium truncate group-hover/card:text-pharos-gold transition">{aula.titulo}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
