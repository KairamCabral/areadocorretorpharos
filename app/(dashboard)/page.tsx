import Link from 'next/link'
import { Home, Calculator, DoorOpen, GraduationCap, ExternalLink, Trophy } from 'lucide-react'

const ferramentas = [
  { href: '/ferramentas/avaliacao', icon: Home, label: 'Avaliação de Imóvel', desc: 'Análise comparativa com IA', color: 'bg-blue-500' },
  { href: '/ferramentas/simulador', icon: Calculator, label: 'Simulador', desc: 'Investimento imobiliário', color: 'bg-emerald-500' },
  { href: '/ferramentas/open-house', icon: DoorOpen, label: 'Open House', desc: 'Avaliação de visitantes', color: 'bg-purple-500' },
  { href: '/treinamento', icon: GraduationCap, label: 'Treinamento', desc: 'Cursos e certificações', color: 'bg-amber-500' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Greeting - server component, profile fetched server-side */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Olá! 👋</h1>
        <p className="text-gray-500">O que vamos fazer hoje?</p>
      </div>

      {/* Tool cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {ferramentas.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-pharos-blue/20 transition group"
          >
            <div className={`w-10 h-10 lg:w-12 lg:h-12 ${tool.color} rounded-xl flex items-center justify-center mb-3`}>
              <tool.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <h3 className="font-semibold text-sm lg:text-base text-gray-900 group-hover:text-pharos-blue transition">
              {tool.label}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 hidden lg:block">{tool.desc}</p>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Links Rápidos</h2>
          <Link href="/links" className="text-pharos-blue text-sm">Ver todos</Link>
        </div>
        <div className="flex gap-2 overflow-x-auto carousel-scroll pb-2">
          {/* TODO: Fetch from Supabase */}
          {['CRM', 'Drive', 'WhatsApp Web', 'ZAP Imóveis', 'VivaReal'].map((link) => (
            <button
              key={link}
              className="flex-shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-pharos-blue hover:text-pharos-blue transition"
            >
              <ExternalLink className="w-3.5 h-3.5 inline mr-1.5" />
              {link}
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="bg-gradient-to-r from-pharos-blue to-pharos-blue-dark rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-pharos-gold" />
          <div>
            <p className="text-white/80 text-sm">Meu Progresso</p>
            <p className="text-xl font-bold">0 pontos</p>
          </div>
        </div>
        <div className="mt-3 flex gap-4 text-sm text-white/70">
          <span>0 avaliações</span>
          <span>0 simulações</span>
          <span>0 aulas</span>
        </div>
      </div>
    </div>
  )
}
