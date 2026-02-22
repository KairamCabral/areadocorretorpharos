'use client'
import { Play, Info } from 'lucide-react'
import Link from 'next/link'

export function NetflixHero() {
  return (
    <div className="relative h-[50vh] lg:h-[60vh] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-pharos-blue/80 via-pharos-dark/60 to-pharos-dark" />
      <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12 z-10">
        <div className="max-w-xl">
          <p className="text-pharos-gold font-semibold text-sm mb-2 uppercase tracking-wider">Treinamento Pharos</p>
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-3 leading-tight">Domine o Mercado Imobiliário</h1>
          <p className="text-white/70 text-sm lg:text-base mb-6 max-w-md">Cursos exclusivos de vendas, marketing, jurídico e financeiro.</p>
          <div className="flex gap-3">
            <Link href="/treinamento/vendas" className="flex items-center gap-2 bg-white text-pharos-dark px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition">
              <Play className="w-5 h-5 fill-current" />Começar
            </Link>
            <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition backdrop-blur-sm">
              <Info className="w-5 h-5" />Meu Progresso
            </button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-pharos-dark to-transparent" />
    </div>
  )
}
