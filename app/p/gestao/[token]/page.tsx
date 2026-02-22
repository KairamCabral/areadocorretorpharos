import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PHAROS } from '@/lib/constants'
import type { Simulacao, SimulacaoCenario } from '@/types'

export default async function GestaoPublicPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createServerSupabase()

  const { data: simulacaoData } = await supabase
    .from('simulacoes')
    .select('*')
    .eq('token_publico', token)
    .single()

  const simulacao = simulacaoData as unknown as Simulacao | null
  if (!simulacao) notFound()

  const { data: cenariosData } = await supabase
    .from('simulacao_cenarios')
    .select('*')
    .eq('simulacao_id', simulacao.id)
    .order('mes_venda')

  const cenarios = (cenariosData ?? []) as unknown as SimulacaoCenario[]

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto p-4 lg:p-8">
        <header className="text-center py-8 border-b border-gray-100">
          <div className="w-12 h-12 bg-pharos-blue rounded-xl mx-auto mb-3 flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{PHAROS.nome}</h1>
          <p className="text-sm text-gray-500 mt-1">Relatório de Gestão Patrimonial</p>
        </header>

        <div className="py-6 space-y-6">
          <div className="bg-gray-50 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">{simulacao.empreendimento_nome}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Cidade:</span> <span className="font-medium">{simulacao.cidade}</span></div>
              {simulacao.construtora && <div><span className="text-gray-500">Construtora:</span> <span className="font-medium">{simulacao.construtora}</span></div>}
              <div><span className="text-gray-500">Valor:</span> <span className="font-medium">{formatCurrency(simulacao.valor_lancamento)}</span></div>
              {simulacao.data_entrega_estimada && <div><span className="text-gray-500">Entrega:</span> <span className="font-medium">{formatDate(simulacao.data_entrega_estimada)}</span></div>}
            </div>
          </div>

          {cenarios.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Cenários de Venda</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="py-2 pr-4">Cenário</th>
                      <th className="py-2 pr-4">Lucro Líquido</th>
                      <th className="py-2 pr-4">Rentabilidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cenarios.map((c) => (
                      <tr key={c.id} className="border-b border-gray-100">
                        <td className="py-2 pr-4 font-medium">{c.label}</td>
                        <td className="py-2 pr-4 text-green-600">{formatCurrency(c.lucro_liquido ?? 0)}</td>
                        <td className="py-2 pr-4">{(c.rentabilidade_percentual ?? 0).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <footer className="text-center py-6 border-t border-gray-100 text-xs text-gray-400">
          <p>{PHAROS.nome} — {PHAROS.creci}</p>
          <p className="mt-1">Documento gerado em {formatDate(new Date())}</p>
        </footer>
      </div>
    </div>
  )
}
