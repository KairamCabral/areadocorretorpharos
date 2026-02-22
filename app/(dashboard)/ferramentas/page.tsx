import Link from 'next/link'
import { Home, Calculator, DoorOpen, ChevronRight } from 'lucide-react'

const ferramentas = [
  { href: '/ferramentas/avaliacao', icon: Home, label: 'Avaliação de Imóvel', desc: 'Análise comparativa de mercado com IA. Gere laudos profissionais para proprietários.', color: 'text-blue-600 bg-blue-50' },
  { href: '/ferramentas/simulador', icon: Calculator, label: 'Simulador de Investimento', desc: 'Compare investimento imobiliário vs renda fixa com dados reais.', color: 'text-emerald-600 bg-emerald-50' },
  { href: '/ferramentas/open-house', icon: DoorOpen, label: 'Open House', desc: 'Colete avaliações de corretores visitantes e gere relatórios para proprietários.', color: 'text-purple-600 bg-purple-50' },
]

export default function FerramentasPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Ferramentas</h1>
      {ferramentas.map((f) => (
        <Link key={f.href} href={f.href} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.color}`}>
            <f.icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-pharos-blue transition">{f.label}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{f.desc}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>
      ))}
    </div>
  )
}
