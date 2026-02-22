'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Search,
  Plus,
  Trash2,
  Check,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useAvaliacao } from '@/hooks/use-avaliacao'
import { calcularAvaliacao, type Comparavel } from '@/lib/avaliacao-mca'
import { formatCurrency } from '@/lib/utils'
import { CIDADES_ATENDIDAS } from '@/lib/constants'

const step1Schema = z.object({
  cidade: z.enum(CIDADES_ATENDIDAS as unknown as [string, ...string[]]),
  bairro: z.string().min(2, 'Bairro obrigatório'),
  endereco: z.string().optional(),
  tipo: z.string().min(1, 'Tipo obrigatório'),
  m2_privativo: z.coerce.number().min(10, 'Mínimo 10 m²'),
  quartos: z.coerce.number().min(0),
  suites: z.coerce.number().min(0),
  banheiros: z.coerce.number().min(0),
  vagas: z.coerce.number().min(0),
  mobilia: z.string().optional(),
  infra_lazer: z.string().optional(),
  idade_predio: z.coerce.number().min(0).optional(),
  posicao_mar: z.string().optional(),
  andar: z.string().optional(),
})

type Step1Form = z.infer<typeof step1Schema>

const STEPS = [
  { id: 1, label: 'Dados do imóvel' },
  { id: 2, label: 'Buscar comparáveis' },
  { id: 3, label: 'Revisar comparáveis' },
  { id: 4, label: 'Resultado' },
]

function comparavelToDb(c: Comparavel) {
  return {
    codigo: c.codigo,
    empreendimento: c.empreendimento,
    valor_total: c.valorTotal,
    m2_privativo: c.m2Privativo,
    quartos: c.quartos,
    suites: c.suites,
    banheiros: c.banheiros,
    vagas: c.vagas,
    infra: c.infra,
    mobilia: c.mobilia,
    andar_posicao: c.andarPosicao,
    condicao: c.condicao,
    data_atualizacao: c.dataAtualizacao,
    fonte_url: c.fonteUrl,
    peso: c.peso,
    origem: c.origem,
    ativo: c.ativo,
    ordem: c.ordem,
  }
}

function dbToComparavel(c: Record<string, unknown>, idx: number): Comparavel {
  return {
    id: c.id as string,
    codigo: (c.codigo as string) || `COMP-${String(idx + 1).padStart(3, '0')}`,
    empreendimento: (c.empreendimento as string) || '',
    valorTotal: Number(c.valorTotal ?? c.valor_total) || 0,
    m2Privativo: Number(c.m2Privativo ?? c.m2_privativo) || 0,
    quartos: Number(c.quartos) || 0,
    suites: Number(c.suites) || 0,
    banheiros: Number(c.banheiros) || 0,
    vagas: Number(c.vagas) || 0,
    infra: (c.infra as string) || '',
    mobilia: (c.mobilia as string) || '',
    andarPosicao: String(c.andarPosicao ?? c.andar_posicao ?? '') || '',
    condicao: (c.condicao as string) || '',
    dataAtualizacao: String(c.dataAtualizacao ?? c.data_atualizacao ?? '') || '',
    fonteUrl: String(c.fonteUrl ?? c.fonte_url ?? '') || '',
    peso: Number(c.peso) ?? 0.9,
    origem: (c.origem as 'ia' | 'manual') || 'ia',
    ativo: c.ativo !== false,
    ordem: Number(c.ordem) ?? idx + 1,
  }
}

export default function NovaAvaliacaoPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { buscarComparaveis, salvarAvaliacao, salvarComparaveis, buscandoIA, loading } = useAvaliacao()
  const [step, setStep] = useState(1)
  const [comparaveis, setComparaveis] = useState<Comparavel[]>([])
  const [resultado, setResultado] = useState<ReturnType<typeof calcularAvaliacao> | null>(null)

  const form = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      cidade: 'Balneário Camboriú',
      tipo: 'apartamento',
      m2_privativo: 0,
      quartos: 0,
      suites: 0,
      banheiros: 0,
      vagas: 0,
      mobilia: 'sem',
      infra_lazer: 'completo',
      idade_predio: 0,
    },
  })

  const handleBuscarComparaveis = async () => {
    const valid = await form.trigger()
    if (!valid) return
    const vals = form.getValues()
    const dados = {
      cidade: vals.cidade,
      bairro: vals.bairro,
      endereco: vals.endereco,
      tipo: vals.tipo,
      m2_privativo: vals.m2_privativo,
      quartos: vals.quartos,
      suites: vals.suites,
      banheiros: vals.banheiros,
      vagas: vals.vagas,
      mobilia: vals.mobilia || 'sem',
      infra_lazer: vals.infra_lazer || 'completo',
    }
    const comps = await buscarComparaveis(dados)
    const mapped = comps.map((c: Record<string, unknown>, i: number) => dbToComparavel(c, i))
    setComparaveis(mapped)
    setStep(2)
    if (mapped.length > 0) toast.success(`${mapped.length} comparáveis encontrados`)
    else toast.warning('Nenhum comparável encontrado. Tente ajustar os critérios.')
  }

  const toggleAtivo = (idx: number) => {
    setComparaveis((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, ativo: !c.ativo } : c))
    )
  }

  const setPeso = (idx: number, peso: number) => {
    setComparaveis((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, peso } : c))
    )
  }

  const addManual = () => {
    const nextOrd = comparaveis.length + 1
    setComparaveis((prev) => [
      ...prev,
      {
        codigo: `MAN-${String(nextOrd).padStart(3, '0')}`,
        empreendimento: 'Comparável manual',
        valorTotal: 0,
        m2Privativo: 0,
        quartos: 0,
        suites: 0,
        banheiros: 0,
        vagas: 0,
        infra: '',
        mobilia: '',
        andarPosicao: '',
        condicao: '',
        dataAtualizacao: new Date().toISOString().slice(0, 7),
        fonteUrl: '',
        peso: 0.9,
        origem: 'manual' as const,
        ativo: true,
        ordem: nextOrd,
      },
    ])
    toast.success('Comparável manual adicionado')
  }

  const removeComparavel = (idx: number) => {
    setComparaveis((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleCalcular = () => {
    const vals = form.getValues()
    const res = calcularAvaliacao(
      comparaveis,
      vals.idade_predio ?? 0,
      vals.infra_lazer ?? 'completo'
    )
    setResultado(res)
    setStep(4)
  }

  const handleSalvar = async () => {
    if (!user || !resultado) return
    const vals = form.getValues()
    const tokenPublico = crypto.randomUUID().replace(/-/g, '').slice(0, 32)
    const { data: av, error: errAv } = await salvarAvaliacao({
      corretor_id: user.id,
      cidade: vals.cidade,
      bairro: vals.bairro,
      endereco: vals.endereco ?? null,
      tipo: vals.tipo,
      m2_privativo: vals.m2_privativo,
      quartos: vals.quartos,
      suites: vals.suites,
      banheiros: vals.banheiros,
      vagas: vals.vagas,
      mobilia: vals.mobilia ?? null,
      infra_lazer: vals.infra_lazer ?? null,
      idade_predio: vals.idade_predio ?? null,
      posicao_mar: vals.posicao_mar ?? null,
      andar: vals.andar ?? null,
      valor_m2_medio: resultado.valorM2Medio,
      valor_comercial: resultado.valorComercial,
      valor_avaliado: resultado.valorAvaliado,
      valor_maximo: resultado.valorMaximo,
      fator_ajuste: resultado.fatorAjuste,
      token_publico: tokenPublico,
      status: 'concluida',
    })
    if (errAv || !av) {
      toast.error('Erro ao salvar avaliação')
      return
    }
    const { error: errComp } = await salvarComparaveis(
      av.id,
      comparaveis.map(comparavelToDb)
    )
    if (errComp) {
      toast.error('Erro ao salvar comparáveis')
      return
    }
    toast.success('Avaliação salva com sucesso!')
    router.push(`/ferramentas/avaliacao/${av.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/ferramentas/avaliacao"
          className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova avaliação</h1>
          <p className="text-gray-500 text-sm">Preencha os dados e busque comparáveis com IA</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => step >= s.id && setStep(s.id)}
            className={`flex items-center gap-1.5 flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition ${
              step === s.id
                ? 'bg-pharos-blue text-white'
                : step > s.id
                  ? 'bg-pharos-blue/10 text-pharos-blue'
                  : 'bg-gray-100 text-gray-500'
            }`}
          >
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-white/20">
              {step > s.id ? <Check className="w-3.5 h-3.5" /> : s.id}
            </span>
            {s.label}
            {s.id < 4 && <ChevronRight className="w-4 h-4 opacity-60" />}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
        {step === 1 && (
          <form className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <select
                  {...form.register('cidade')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
                >
                  {CIDADES_ATENDIDAS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {form.formState.errors.cidade && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.cidade.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                <input
                  {...form.register('bairro')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
                  placeholder="Ex: Centro"
                />
                {form.formState.errors.bairro && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.bairro.message}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <input
                {...form.register('endereco')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
                placeholder="Rua, número"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  {...form.register('tipo')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
                >
                  <option value="apartamento">Apartamento</option>
                  <option value="casa">Casa</option>
                  <option value="cobertura">Cobertura</option>
                  <option value="studio">Studio</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Área privativa (m²) *</label>
                <input
                  type="number"
                  {...form.register('m2_privativo')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
                  placeholder="75"
                />
                {form.formState.errors.m2_privativo && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.m2_privativo.message}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quartos</label>
                <input
                  type="number"
                  min={0}
                  {...form.register('quartos')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suítes</label>
                <input
                  type="number"
                  min={0}
                  {...form.register('suites')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banheiros</label>
                <input
                  type="number"
                  min={0}
                  {...form.register('banheiros')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vagas</label>
                <input
                  type="number"
                  min={0}
                  {...form.register('vagas')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobília</label>
                <select
                  {...form.register('mobilia')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
                >
                  <option value="sem">Sem mobília</option>
                  <option value="parcial">Parcial</option>
                  <option value="completa">Completa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Infraestrutura/Lazer</label>
                <select
                  {...form.register('infra_lazer')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
                >
                  <option value="sem">Sem</option>
                  <option value="basico">Básico</option>
                  <option value="completo">Completo</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Idade do prédio (anos)</label>
                <input
                  type="number"
                  min={0}
                  {...form.register('idade_predio')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
                  placeholder="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posição mar</label>
                <input
                  {...form.register('posicao_mar')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
                  placeholder="Frente mar, vista parcial..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Andar</label>
              <input
                {...form.register('andar')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
                placeholder="Ex: 8º andar"
              />
            </div>
            <button
              type="button"
              onClick={handleBuscarComparaveis}
              disabled={buscandoIA}
              className="w-full min-h-[48px] py-3 bg-pharos-blue text-white font-semibold rounded-xl hover:bg-pharos-blue-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {buscandoIA ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Buscando comparáveis com IA...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Buscar comparáveis com IA
                </>
              )}
            </button>
          </form>
        )}

        {step === 2 && comparaveis.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Comparáveis encontrados ({comparaveis.length})</h2>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Código</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Empreendimento</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600">Valor</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600">m²</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-600">Q/S/B/V</th>
                  </tr>
                </thead>
                <tbody>
                  {comparaveis.map((c, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-3 px-2">{c.codigo}</td>
                      <td className="py-3 px-2">{c.empreendimento}</td>
                      <td className="py-3 px-2 text-right font-medium">{formatCurrency(c.valorTotal)}</td>
                      <td className="py-3 px-2 text-right">{c.m2Privativo}</td>
                      <td className="py-3 px-2 text-center">{c.quartos}/{c.suites}/{c.banheiros}/{c.vagas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="min-h-[48px] px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="min-h-[48px] px-6 py-2 bg-pharos-blue text-white font-semibold rounded-xl hover:bg-pharos-blue-dark flex items-center gap-2"
              >
                Revisar comparáveis
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Revisar comparáveis</h2>
              <button
                type="button"
                onClick={addManual}
                className="min-h-[48px] px-4 py-2 bg-pharos-gold/20 text-pharos-dark font-medium rounded-xl hover:bg-pharos-gold/30 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar manual
              </button>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {comparaveis.map((c, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${
                    c.ativo ? 'border-pharos-blue/30 bg-pharos-blue/5' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAtivo(i)}
                    className={`min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border-2 ${
                      c.ativo ? 'border-pharos-blue bg-pharos-blue text-white' : 'border-gray-300'
                    }`}
                  >
                    {c.ativo ? <Check className="w-5 h-5" /> : null}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{c.empreendimento}</p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(c.valorTotal)} · {c.m2Privativo} m²
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Peso:</label>
                    <input
                      type="number"
                      min={0.5}
                      max={1}
                      step={0.05}
                      value={c.peso}
                      onChange={(e) => setPeso(i, parseFloat(e.target.value) || 0.9)}
                      className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeComparavel(i)}
                    className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="min-h-[48px] px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleCalcular}
                disabled={comparaveis.filter((c) => c.ativo).length === 0}
                className="min-h-[48px] px-6 py-2 bg-pharos-blue text-white font-semibold rounded-xl hover:bg-pharos-blue-dark disabled:opacity-50 flex items-center gap-2"
              >
                Calcular resultado
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 4 && resultado && (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-900">Resultado da avaliação</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-xl bg-pharos-blue/10 border border-pharos-blue/20">
                <p className="text-sm text-gray-600">Valor/m² médio</p>
                <p className="text-xl font-bold text-pharos-blue">{formatCurrency(resultado.valorM2Medio)}/m²</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="text-sm text-gray-600">Valor comercial</p>
                <p className="text-xl font-bold text-emerald-700">{formatCurrency(resultado.valorComercial)}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-sm text-gray-600">Valor avaliado</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(resultado.valorAvaliado)}</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-sm text-gray-600">Valor máximo</p>
                <p className="text-xl font-bold text-amber-700">{formatCurrency(resultado.valorMaximo)}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Baseado em {resultado.comparaveisAtivos} comparáveis ativos · Fator de ajuste: {resultado.fatorAjuste}
            </p>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="min-h-[48px] px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleSalvar}
                disabled={loading}
                className="min-h-[48px] px-6 py-2 bg-pharos-blue text-white font-semibold rounded-xl hover:bg-pharos-blue-dark disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Salvar e gerar link público
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
