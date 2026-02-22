'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Play, Lock, CheckCircle2 } from 'lucide-react'

interface Props { titulo: string; slug: string; cor: string }

export function NetflixCarousel({ titulo, slug, cor }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })
  }

  const cards = Array.from({ length: 6 }, (_, i) => ({
    id: `${slug}-${i}`, titulo: `Aula ${i + 1}`, duracao: `${5 + i * 3} min`,
    status: i < 2 ? 'concluida' : i === 2 ? 'em_andamento' : 'bloqueada',
  }))

  return (
    <div className="group/carousel">
      <div className="flex items-center justify-between mb-3">
        <Link href={`/treinamento/${slug}`} className="text-white text-lg lg:text-xl font-bold hover:text-pharos-gold transition">
          {titulo}<ChevronRight className="inline w-5 h-5 ml-1 opacity-0 group-hover/carousel:opacity-100 transition" />
        </Link>
      </div>
      <div className="relative group/scroll">
        <button onClick={() => scroll('left')} className="absolute left-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-r from-pharos-dark to-transparent hidden group-hover/scroll:flex items-center justify-center">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button onClick={() => scroll('right')} className="absolute right-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-l from-pharos-dark to-transparent hidden group-hover/scroll:flex items-center justify-center">
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto carousel-scroll scrollbar-netflix">
          {cards.map((card) => (
            <Link key={card.id} href={`/treinamento/${slug}/${card.id}`} className="flex-shrink-0 w-[200px] lg:w-[240px] group/card">
              <div className="relative aspect-video rounded-lg overflow-hidden mb-2 transition-transform group-hover/card:scale-105" style={{ backgroundColor: `${cor}20` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-2 right-2">
                  {card.status === 'concluida' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                  {card.status === 'bloqueada' && <Lock className="w-4 h-4 text-white/50" />}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition">
                  <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                    <Play className="w-5 h-5 text-pharos-dark fill-current ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">{card.duracao}</span>
                {card.status === 'em_andamento' && (
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20"><div className="h-full bg-pharos-gold" style={{ width: '40%' }} /></div>
                )}
              </div>
              <h3 className="text-white text-sm font-medium truncate group-hover/card:text-pharos-gold transition">{card.titulo}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
