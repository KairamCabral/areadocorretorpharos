'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { useSimulador } from '@/hooks/use-simulador'
import {
  calcularCenarios,
  calcularDadosGrafico,
  type SimulacaoInput,
} from '@/lib/calculadora-investimento'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { SimuladorChart } from '@/components/simulador/SimuladorChart'

const schema = z.object({
  empreendimento_nome: z.string().min(1, 'Nome obrigatório'),
  construtora: z.string().optional(),
  cidade: z.string().min(1, 'Cidade obrigatória'),
  bairro: z.string().optional(),
  valor_lancamento: z.coerce.number().min(1, 'Valor obrigatório'),
  data_lancamento: z.string().optional(),
  data_entrega_estimada: z.string().optional(),
  entrada: z.coerce.number().min(0).default(0),
  parcelas_mensais: z.coerce.number().min(0).default(0),
  valor_parcela_mensal: z.coerce.number().min(0).default(0),
  parcelas_semestrais: z.coerce.number().min(0).default(0),
  valor_parcela_semestral: z.coerce.number().min(0).default(0),
  parcelas_anuais: z.coerce.number().min(0).default(0),
  valor_parcela_anual: z.coerce.number().min(0).default(0),
  saldo_chaves: z.coerce.number().min(0).default(0),
  tipo_correcao: z.enum(['CUB', 'INCC', 'IPCA', 'manual']),
  taxa_correcao_anual: z.coerce.number().min(0).default(0),
  valorizacao_anual_estimada: z.coerce.number().default(5),
  taxa_selic: z.coerce.number().default(13.25),
  taxa_cdb: z.coerce.number().default(13.15),
  taxa_lci: z.coerce.number().default(12),
})

type FormValues = z.infer<typeof schema>

const defaultValues: FormValues = {
  empreendimento_nome: '',
  construtora: '',
  cidade: '',
  bairro: '',
  valor_lancamento: 0,
  data_lancamento: '',
  data_entrega_estimada: '',
  entrada: 0,
  parcelas_mensais: 0,
  valor_parcela_mensal: 0,
  parcelas_semestrais: 0,
  valor_parcela_semestral: 0,
  parcelas_anuais: 0,
  valor_parcela_anual: 0,
  saldo_chaves: 0,
  tipo_correcao: 'IPCA',
  taxa_correcao_anual: 4.5,
  valorizacao_anual_estimada: 5,
  taxa_selic: 13.25,
  taxa_cdb: 13.15,
  taxa_lci: 12,
}

function diffMonths(d1: string, d2: string): number {
  if (!d1 || !d2) return 36
  const a = new Date(d1)
  const b = new Date(d2)
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24 * 30)))
}

export default function SimuladorNovoPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { loading, buscarIndices, salvarSimulacao, salvarCenarios } = useSimulador()
  const [indicesLoaded, setIndicesLoaded] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const watchValues = form.watch()

  useEffect(() => {
    if (!indicesLoaded) {
      buscarIndices().then((data) => {
        if (data?.selic != null) form.setValue('taxa_selic', data.selic)
        if (data?.ipca != null) form.setValue('taxa_correcao_anual', data.ipca)
        if (data?.cdi != null) form.setValue('taxa_cdb', data.cdi)
        setIndicesLoaded(true)
      })
    }
  }, [buscarIndices, form, indicesLoaded])

  const inputForCalc = (): SimulacaoInput | null => {
    const v = form.getValues()
    const prazoObraMeses = diffMonths(v.data_lancamento || '', v.data_entrega_estimada || '')
    const taxaCorrecao =
      v.tipo_correcao === 'manual' ? v.taxa_correcao_anual : v.taxa_correcao_anual
    return {
      valorLancamento: v.valor_lancamento,
      entrada: v.entrada,
      parcelasMensais: v.parcelas_mensais,
      valorParcelaMensal: v.valor_parcela_mensal,
      parcelasSemestrais: v.parcelas_semestrais,
      valorParcelaSemestral: v.valor_parcela_semestral,
      parcelasAnuais: v.parcelas_anuais,
      valorParcelaAnual: v.valor_parcela_anual,
      saldoChaves: v.saldo_chaves,
      prazoObraMeses,
      tipoCorrecao: v.tipo_correcao,
      taxaCorrecaoAnual: taxaCorrecao,
      posChavesIndice: 'IPCA',
      posChavesJuros: 0,
      itbiPercentual: 2,
      registroCartorio: 3000,
      comissaoVendaPercentual: 6,
      valorizacaoAnualEstimada: v.valorizacao_anual_estimada,
      taxaSelic: v.taxa_selic,
      taxaCdb: v.taxa_cdb,
      taxaLci: v.taxa_lci,
    }
  }

  const cenarios = (() => {
    const inp = inputForCalc()
    if (!inp || inp.valorLancamento <= 0) return []
    return calcularCenarios(inp)
  })()

  const dadosGrafico = (() => {
    const inp = inputForCalc()
    if (!inp || inp.valorLancamento <= 0) return []
    return calcularDadosGrafico(inp)
  })()

  const handleSubmit = async (values: FormValues) => {
    if (!user?.id) {
      toast.error('Faça login para salvar.')
      return
    }
    const inp = inputForCalc()
    if (!inp || inp.valorLancamento <= 0) {
      toast.error('Preencha os dados do empreendimento.')
      return
    }

    const simulacao = {
      corretor_id: user.id,
      empreendimento_nome: values.empreendimento_nome,
      construtora: values.construtora || null,
      cidade: values.cidade,
      bairro: values.bairro || null,
      valor_lancamento: values.valor_lancamento,
      data_lancamento: values.data_lancamento || null,
      data_entrega_estimada: values.data_entrega_estimada || null,
      entrada: values.entrada,
      parcelas_mensais: values.parcelas_mensais,
      valor_parcela_mensal: values.valor_parcela_mensal,
      parcelas_semestrais: values.parcelas_semestrais,
      valor_parcela_semestral: values.valor_parcela_semestral,
      parcelas_anuais: values.parcelas_anuais,
      valor_parcela_anual: values.valor_parcela_anual,
      saldo_chaves: values.saldo_chaves,
      tipo_correcao: values.tipo_correcao,
      taxa_correcao_anual: values.taxa_correcao_anual,
      valorizacao_anual_estimada: values.valorizacao_anual_estimada,
      taxa_selic: values.taxa_selic,
      taxa_cdb: values.taxa_cdb,
      taxa_lci: values.taxa_lci,
      itbi_percentual: 2,
      registro_cartorio: 3000,
      comissao_venda_percentual: 6,
      status: 'rascunho',
    }

    const { data, error } = await salvarSimulacao(simulacao)
    if (error) {
      toast.error('Erro ao salvar simulação.')
      return
    }
    if (data?.id && cenarios.length > 0) {
      const { error: errCenarios } = await salvarCenarios(data.id, cenarios)
      if (errCenarios) toast.error('Simulação salva, mas cenários falharam.')
    }
    toast.success('Simulação salva!')
    router.push(`/ferramentas/simulador/${data?.id}`)
  }

  const inputClass =
    'w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Nova simulação</h1>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Seção 1: Empreendimento */}
        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Empreendimento</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Nome do empreendimento</label>
              <input
                {...form.register('empreendimento_nome')}
                className={inputClass}
                placeholder="Ex: Residencial Vista Mar"
              />
              {form.formState.errors.empreendimento_nome && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.empreendimento_nome.message}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Construtora</label>
              <input {...form.register('construtora')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cidade</label>
              <input {...form.register('cidade')} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Bairro</label>
              <input {...form.register('bairro')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Valor de lançamento (R$)</label>
              <input
                type="number"
                {...form.register('valor_lancamento')}
                className={inputClass}
                min={0}
                step={1000}
              />
              {form.formState.errors.valor_lancamento && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.valor_lancamento.message}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Data de lançamento</label>
              <input
                type="date"
                {...form.register('data_lancamento')}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Data de entrega estimada</label>
              <input
                type="date"
                {...form.register('data_entrega_estimada')}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Seção 2: Plano de Pagamento */}
        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Plano de pagamento</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={labelClass}>Entrada (R$)</label>
              <input
                type="number"
                {...form.register('entrada')}
                className={inputClass}
                min={0}
                step={1000}
              />
            </div>
            <div>
              <label className={labelClass}>Parcelas mensais</label>
              <input
                type="number"
                {...form.register('parcelas_mensais')}
                className={inputClass}
                min={0}
              />
            </div>
            <div>
              <label className={labelClass}>Valor parcela mensal (R$)</label>
              <input
                type="number"
                {...form.register('valor_parcela_mensal')}
                className={inputClass}
                min={0}
                step={100}
              />
            </div>
            <div>
              <label className={labelClass}>Parcelas semestrais</label>
              <input
                type="number"
                {...form.register('parcelas_semestrais')}
                className={inputClass}
                min={0}
              />
            </div>
            <div>
              <label className={labelClass}>Valor parcela semestral (R$)</label>
              <input
                type="number"
                {...form.register('valor_parcela_semestral')}
                className={inputClass}
                min={0}
                step={1000}
              />
            </div>
            <div>
              <label className={labelClass}>Parcelas anuais</label>
              <input
                type="number"
                {...form.register('parcelas_anuais')}
                className={inputClass}
                min={0}
              />
            </div>
            <div>
              <label className={labelClass}>Valor parcela anual (R$)</label>
              <input
                type="number"
                {...form.register('valor_parcela_anual')}
                className={inputClass}
                min={0}
                step={1000}
              />
            </div>
            <div>
              <label className={labelClass}>Saldo de chaves (R$)</label>
              <input
                type="number"
                {...form.register('saldo_chaves')}
                className={inputClass}
                min={0}
                step={1000}
              />
            </div>
          </div>
        </section>

        {/* Seção 3: Índices */}
        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Índices e correção</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelClass}>Tipo de correção</label>
              <select
                {...form.register('tipo_correcao')}
                className={inputClass}
              >
                <option value="CUB">CUB</option>
                <option value="INCC">INCC</option>
                <option value="IPCA">IPCA</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Taxa correção anual (%)</label>
              <input
                type="number"
                step={0.1}
                {...form.register('taxa_correcao_anual')}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Valorização anual estimada (%)</label>
              <input
                type="number"
                step={0.1}
                {...form.register('valorizacao_anual_estimada')}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Selic (%)</label>
              <input
                type="number"
                step={0.01}
                {...form.register('taxa_selic')}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>CDI (%)</label>
              <input
                type="number"
                step={0.01}
                {...form.register('taxa_cdb')}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>LCI (%)</label>
              <input
                type="number"
                step={0.01}
                {...form.register('taxa_lci')}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Seção 4: Resultados */}
        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultados</h2>

          {cenarios.length > 0 ? (
            <>
              <div className="mb-6">
                <SimuladorChart data={dadosGrafico} />
              </div>

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
                    {cenarios.map((c) => (
                      <tr key={c.mesVenda} className="border-b border-gray-100">
                        <td className="py-3 px-2 text-gray-900">{c.label}</td>
                        <td className="py-3 px-2 text-right font-medium">
                          {formatCurrency(c.lucroLiquido)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          {formatPercent(c.rentabilidadePercentual)}
                        </td>
                        <td className="py-3 px-2 text-right text-gray-500">
                          {formatCurrency(c.rendimentoSelic)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-gray-500 py-4">
              Preencha o valor de lançamento para ver os cenários.
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={loading || !watchValues.empreendimento_nome || watchValues.valor_lancamento <= 0}
              className="px-6 py-3 bg-pharos-blue text-white font-medium rounded-xl hover:bg-pharos-blue-dark transition disabled:opacity-50 min-h-[48px]"
            >
              {loading ? 'Salvando...' : 'Salvar simulação'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition min-h-[48px]"
            >
              Voltar
            </button>
          </div>
        </section>
      </form>
    </div>
  )
}
