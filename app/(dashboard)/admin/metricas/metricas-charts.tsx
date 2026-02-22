'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface MetricasChartsProps {
  avaliacoesPorMes: { mes: string; total: number }[]
  simulacoesPorMes: { mes: string; total: number }[]
  topCorretores: { nome: string; total: number }[]
  completionRate: string
}

export function MetricasCharts({
  avaliacoesPorMes,
  simulacoesPorMes,
  topCorretores,
  completionRate,
}: MetricasChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-pharos-dark mb-4">Avaliações por mês</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={avaliacoesPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                  formatter={(value: number) => [value, 'Avaliações']}
                />
                <Bar dataKey="total" fill="#1B4DDB" radius={[4, 4, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-pharos-dark mb-4">Simulações por mês</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={simulacoesPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                  formatter={(value: number) => [value, 'Simulações']}
                />
                <Bar dataKey="total" fill="#C9A84C" radius={[4, 4, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-pharos-dark mb-4">Top 5 corretores mais ativos</h2>
          {topCorretores.length === 0 ? (
            <p className="text-gray-500 py-8">Nenhum dado ainda.</p>
          ) : (
            <ul className="space-y-3">
              {topCorretores.map((c, i) => (
                <li
                  key={c.nome}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-pharos-blue/10 text-pharos-blue font-bold text-sm flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="font-medium text-gray-900">{c.nome}</span>
                  </div>
                  <span className="text-pharos-blue font-semibold">{c.total} atividades</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-pharos-dark mb-4">Taxa de conclusão do treinamento</h2>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full border-4 border-pharos-blue/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-pharos-blue">{completionRate}%</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Aulas concluídas em relação ao total esperado (aulas × corretores ativos)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
