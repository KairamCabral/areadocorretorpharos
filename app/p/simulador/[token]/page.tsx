import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { formatCurrency, formatDate, formatPercent } from '@/lib/utils'
import { PHAROS } from '@/lib/constants'
import { calcularDadosGrafico, type SimulacaoInput } from '@/lib/calculadora-investimento'
import { SimuladorChart } from '@/components/simulador/SimuladorChart'
import type { Simulacao, SimulacaoCenario } from '@/types'

function diffMonths(d1: string | null, d2: string | null): number {
  if (!d1 || !d2) return 36
  const a = new Date(d1)
  const b = new Date(d2)
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24 * 30)))
}

export default async function PublicSimuladorPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createServerSupabase()

  const { data: simulacaoData, error } = await supabase
    .from('simulacoes')
    .select('*')
    .eq('token_publico', token)
    .single()

  const simulacao = simulacaoData as unknown as Simulacao | null
  if (error || !simulacao) notFound()

  const { data: cenariosData } = await supabase
    .from('simulacao_cenarios')
    .select('*')
    .eq('simulacao_id', simulacao.id)
    .order('mes_venda', { ascending: true })

  const cenarios = (cenariosData ?? []) as unknown as SimulacaoCenario[]

  const input: SimulacaoInput = {
    valorLancamento: Number(simulacao.valor_lancamento),
    entrada: Number(simulacao.entrada ?? 0),
    parcelasMensais: Number(simulacao.parcelas_mensais ?? 0),
    valorParcelaMensal: Number(simulacao.valor_parcela_mensal ?? 0),
    parcelasSemestrais: Number(simulacao.parcelas_semestrais ?? 0),
    valorParcelaSemestral: Number(simulacao.valor_parcela_semestral ?? 0),
    parcelasAnuais: Number(simulacao.parcelas_anuais ?? 0),
    valorParcelaAnual: Number(simulacao.valor_parcela_anual ?? 0),
    saldoChaves: Number(simulacao.saldo_chaves ?? 0),
    prazoObraMeses: diffMonths(simulacao.data_lancamento, simulacao.data_entrega_estimada),
    tipoCorrecao: (simulacao.tipo_correcao as 'CUB' | 'INCC' | 'IPCA' | 'manual') ?? 'IPCA',
    taxaCorrecaoAnual: Number(simulacao.taxa_correcao_anual ?? 4.5),
    posChavesIndice: simulacao.pos_chaves_indice ?? 'IPCA',
    posChavesJuros: Number(simulacao.pos_chaves_juros ?? 0),
    itbiPercentual: Number(simulacao.itbi_percentual ?? 2),
    registroCartorio: Number(simulacao.registro_cartorio ?? 3000),
    comissaoVendaPercentual: Number(simulacao.comissao_venda_percentual ?? 6),
    valorizacaoAnualEstimada: Number(simulacao.valorizacao_anual_estimada ?? 5),
    taxaSelic: Number(simulacao.taxa_selic ?? 13.25),
    taxaCdb: Number(simulacao.taxa_cdb ?? 13.15),
    taxaLci: Number(simulacao.taxa_lci ?? 12),
  }

  const dadosGrafico = calcularDadosGrafico(input)

  return (
    <div className="min-h-screen bg-pharos-dark">
      <div className="max-w-4xl mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="w-14 h-14 bg-pharos-blue rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{PHAROS.nome}</h1>
          <p className="text-pharos-gold text-sm mt-1">{PHAROS.creci}</p>
        </header>

        {/* Card principal */}
        <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-1">
              {simulacao.empreendimento_nome}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {simulacao.cidade}
              {simulacao.bairro && ` • ${simulacao.bairro}`}
              {simulacao.construtora && ` • ${simulacao.construtora}`}
            </p>

            {/* Dados do empreendimento */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                  Valor de lançamento
                </p>
                <p className="text-xl font-bold text-pharos-gold">
                  {formatCurrency(Number(simulacao.valor_lancamento))}
                </p>
              </div>
              {simulacao.data_lancamento && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                    Lançamento
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {formatDate(simulacao.data_lancamento)}
                  </p>
                </div>
              )}
              {simulacao.data_entrega_estimada && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                    Entrega estimada
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {formatDate(simulacao.data_entrega_estimada)}
                  </p>
                </div>
              )}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                  Valorização anual
                </p>
                <p className="text-lg font-semibold text-emerald-400">
                  {formatPercent(Number(simulacao.valorizacao_anual_estimada ?? 5))}
                </p>
              </div>
            </div>

            {/* Gráfico */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                Evolução do investimento
              </h3>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <SimuladorChart data={dadosGrafico} />
              </div>
            </div>

            {/* Tabela de cenários */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Cenários de venda
              </h3>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-2 font-medium text-gray-400">Momento</th>
                      <th className="text-right py-3 px-2 font-medium text-gray-400">
                        Lucro líquido
                      </th>
                      <th className="text-right py-3 px-2 font-medium text-gray-400">
                        Rentabilidade
                      </th>
                      <th className="text-right py-3 px-2 font-medium text-gray-400">
                        Renda fixa (Selic)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cenarios.map((c) => (
                      <tr key={c.id} className="border-b border-white/10">
                        <td className="py-3 px-2 text-white">{c.label}</td>
                        <td className="py-3 px-2 text-right font-medium text-pharos-gold">
                          {formatCurrency(Number(c.lucro_liquido ?? 0))}
                        </td>
                        <td className="py-3 px-2 text-right text-emerald-400">
                          {formatPercent(Number(c.rentabilidade_percentual ?? 0))}
                        </td>
                        <td className="py-3 px-2 text-right text-gray-400">
                          {formatCurrency(Number(c.rendimento_selic ?? 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-10 text-gray-500 text-sm">
          <p>{PHAROS.endereco}</p>
          <p className="mt-1">
            {PHAROS.telefone} • {PHAROS.email}
          </p>
          <p className="mt-2 text-pharos-gold">{PHAROS.instagram}</p>
        </footer>
      </div>
    </div>
  )
}
