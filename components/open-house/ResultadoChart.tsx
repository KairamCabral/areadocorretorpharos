'use client'

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const CRITERIOS = [
  { key: 'nota_tamanho', label: 'Tamanho' },
  { key: 'nota_disposicao', label: 'Disposição' },
  { key: 'nota_acabamento', label: 'Acabamento' },
  { key: 'nota_conservacao', label: 'Conservação' },
  { key: 'nota_areas_comuns', label: 'Áreas comuns' },
  { key: 'nota_localizacao', label: 'Localização' },
  { key: 'nota_preco', label: 'Preço' },
] as const

interface ResultadoChartProps {
  medias: Record<string, number>
}

export function ResultadoChart({ medias }: ResultadoChartProps) {
  const data = CRITERIOS.map((c) => ({
    subject: c.label,
    Média: Math.round((medias[c.key] ?? 0) * 10) / 10,
    fullMark: 5,
  }))

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#64748B" strokeOpacity={0.3} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#64748B', fontSize: 11 }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fill: '#64748B', fontSize: 10 }}
          />
          <Radar
            name="Média"
            dataKey="Média"
            stroke="#1B4DDB"
            fill="#1B4DDB"
            fillOpacity={0.4}
            strokeWidth={2}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
