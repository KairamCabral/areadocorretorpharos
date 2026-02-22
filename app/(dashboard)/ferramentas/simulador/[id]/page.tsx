import { createServerSupabase } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { formatCurrency, formatDate, formatPercent, generateWhatsAppLink } from '@/lib/utils'
import { PHAROS } from '@/lib/constants'
import { calcularDadosGrafico, type SimulacaoInput } from '@/lib/calculadora-investimento'
import { SimuladorChart } from '@/components/simulador/SimuladorChart'
import { SimuladorShareButton } from '@/components/simulador/SimuladorShareButton'
import type { Simulacao, SimulacaoCenario } from '@/types'

function diffMonths(d1: string | null, d2: string | null): number {
  if (!d1 || !d2) return 36
  const a = new Date(d1)
  const b = new Date(d2)
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24 * 30)))
}

export default async function SimuladorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: simulacaoRaw, error } = await supabase
    .from('simulacoes')
    .select('*')
    .eq('id', id)
    .eq('corretor_id', user.id)
    .single()

  if (error || !simulacaoRaw) notFound()
  const simulacao = simulacaoRaw as unknown as Simulacao

  const { data: cenariosRaw } = await supabase
    .from('simulacao_cenarios')
    .select('*')
    .eq('simulacao_id', id)
    .order('mes_venda', { ascending: true })
  const cenarios = (cenariosRaw ?? []) as unknown as SimulacaoCenario[]

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
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.pharosnegocios.com.br'}/p/simulador/${simulacao.token_publico}`

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{simulacao.empreendimento_nome}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {simulacao.cidade}
            {simulacao.bairro && ` • ${simulacao.bairro}`}
          </p>
        </div>
        <SimuladorShareButton
          publicUrl={publicUrl}
          empreendimentoNome={simulacao.empreendimento_nome}
          phone={PHAROS.telefone}
        />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados do empreendimento</h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-gray-500">Valor de lançamento</dt>
            <dd className="font-medium">{formatCurrency(Number(simulacao.valor_lancamento))}</dd>
          </div>
          {simulacao.construtora && (
            <div>
              <dt className="text-sm text-gray-500">Construtora</dt>
              <dd className="font-medium">{simulacao.construtora}</dd>
            </div>
          )}
          {simulacao.data_lancamento && (
            <div>
              <dt className="text-sm text-gray-500">Data de lançamento</dt>
              <dd className="font-medium">{formatDate(simulacao.data_lancamento)}</dd>
            </div>
          )}
          {simulacao.data_entrega_estimada && (
            <div>
              <dt className="text-sm text-gray-500">Entrega estimada</dt>
              <dd className="font-medium">{formatDate(simulacao.data_entrega_estimada)}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm text-gray-500">Criado em</dt>
            <dd className="font-medium">{formatDate(simulacao.created_at)}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Evolução do investimento</h2>
        <SimuladorChart data={dadosGrafico} />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cenários de venda</h2>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-700">Momento</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Lucro líquido</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Rentabilidade</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Renda fixa</th>
              </tr>
            </thead>
            <tbody>
              {(cenarios ?? []).map((c) => (
                <tr key={c.id} className="border-b border-gray-100">
                  <td className="py-3 px-2 text-gray-900">{c.label}</td>
                  <td className="py-3 px-2 text-right font-medium">
                    {formatCurrency(Number(c.lucro_liquido ?? 0))}
                  </td>
                  <td className="py-3 px-2 text-right">
                    {formatPercent(Number(c.rentabilidade_percentual ?? 0))}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-500">
                    {formatCurrency(Number(c.rendimento_selic ?? 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
