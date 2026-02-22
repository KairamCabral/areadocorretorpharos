import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function CategoriaPage({ params }: { params: { categoria: string } }) {
  return (
    <div className="-m-4 lg:-m-6 min-h-screen bg-pharos-dark text-white">
      <div className="p-4 lg:p-6">
        <Link href="/treinamento" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4">
          <ChevronLeft className="w-5 h-5" /> Voltar
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold capitalize">{params.categoria}</h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-white/60">
          <span>0% concluído</span>
          <div className="flex-1 max-w-xs h-1.5 bg-white/10 rounded-full">
            <div className="h-full bg-pharos-gold rounded-full" style={{ width: '0%' }} />
          </div>
          <span>0 pontos</span>
        </div>
      </div>
      <div className="px-4 lg:px-6 space-y-3 pb-8">
        <p className="text-white/50 text-center py-12">Nenhuma aula cadastrada ainda.</p>
      </div>
    </div>
  )
}
