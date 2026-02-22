'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ChartDataPoint {
  mes: number
  valorImovel: number
  totalInvestido: number
  lucroLiquido: number
  rendaFixa: number
}

interface SimuladorChartProps {
  data: ChartDataPoint[]
}

export function SimuladorChart({ data }: SimuladorChartProps) {
  return (
    <div className="w-full h-[300px] min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="mes"
            tickFormatter={(v) => `Mês ${v}`}
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis
            tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
            stroke="#64748b"
            fontSize={12}
          />
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(value)
            }
            labelFormatter={(label) => `Mês ${label}`}
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="valorImovel"
            name="Valor do imóvel"
            stroke="#1B4DDB"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="totalInvestido"
            name="Total investido"
            stroke="#64748b"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="rendaFixa"
            name="Renda fixa (Selic)"
            stroke="#C9A84C"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
