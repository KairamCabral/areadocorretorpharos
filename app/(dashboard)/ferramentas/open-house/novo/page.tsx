'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { CIDADES_ATENDIDAS } from '@/lib/constants'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  empreendimento: z.string().min(1, 'Obrigatório'),
  endereco: z.string().min(1, 'Obrigatório'),
  cidade: z.string().min(1, 'Selecione a cidade'),
  bairro: z.string().optional(),
  unidade: z.string().optional(),
  proprietario_nome: z.string().optional(),
  proprietario_telefone: z.string().optional(),
  data_evento: z.string().min(1, 'Data obrigatória'),
  horario_inicio: z.string().optional(),
  horario_fim: z.string().optional(),
  observacoes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function NovoOpenHousePage() {
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      cidade: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error('Faça login para continuar')
      return
    }

    const { data: inserted, error } = await (supabase
      .from('open_houses') as any)
      .insert({
        criado_por: user.id,
        empreendimento: data.empreendimento,
        endereco: data.endereco,
        cidade: data.cidade,
        bairro: data.bairro || null,
        unidade: data.unidade || null,
        proprietario_nome: data.proprietario_nome || null,
        proprietario_telefone: data.proprietario_telefone || null,
        data_evento: data.data_evento,
        horario_inicio: data.horario_inicio || null,
        horario_fim: data.horario_fim || null,
        observacoes: data.observacoes || null,
        status: 'agendado',
      })
      .select('id')
      .single()

    if (error) {
      toast.error('Erro ao salvar. Tente novamente.')
      console.error(error)
      return
    }

    toast.success('Open House criado com sucesso!')
    router.push(`/ferramentas/open-house/${inserted?.id ?? ''}`)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link
          href="/ferramentas/open-house"
          className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Open House</h1>
          <p className="text-gray-500 text-sm">Preencha os dados do evento</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Imóvel</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empreendimento *</label>
              <input
                {...register('empreendimento')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue focus:border-transparent"
                placeholder="Ex: Edifício Solar"
              />
              {errors.empreendimento && (
                <p className="text-sm text-red-500 mt-1">{errors.empreendimento.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço *</label>
              <input
                {...register('endereco')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue focus:border-transparent"
                placeholder="Rua, número"
              />
              {errors.endereco && (
                <p className="text-sm text-red-500 mt-1">{errors.endereco.message}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                <select
                  {...register('cidade')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue focus:border-transparent bg-white"
                >
                  <option value="">Selecione</option>
                  {CIDADES_ATENDIDAS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.cidade && (
                  <p className="text-sm text-red-500 mt-1">{errors.cidade.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                <input
                  {...register('bairro')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue focus:border-transparent"
                  placeholder="Bairro"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
              <input
                {...register('unidade')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue focus:border-transparent"
                placeholder="Ex: 301, Bloco A"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Proprietário</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                {...register('proprietario_nome')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue focus:border-transparent"
                placeholder="Nome do proprietário"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                {...register('proprietario_telefone')}
                type="tel"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue focus:border-transparent"
                placeholder="(47) 99999-9999"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Evento</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data do evento *</label>
              <input
                {...register('data_evento')}
                type="date"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue focus:border-transparent"
              />
              {errors.data_evento && (
                <p className="text-sm text-red-500 mt-1">{errors.data_evento.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horário início</label>
              <input
                {...register('horario_inicio')}
                type="time"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horário fim</label>
              <input
                {...register('horario_fim')}
                type="time"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              {...register('observacoes')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue focus:border-transparent resize-none"
              placeholder="Informações adicionais sobre o evento"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
          <Link
            href="/ferramentas/open-house"
            className="min-h-[48px] px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 text-center"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-[48px] px-6 py-3 bg-pharos-blue text-white font-semibold rounded-xl hover:bg-pharos-blue/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              'Criar Open House'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
