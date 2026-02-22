'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { StarRating } from '@/components/shared/StarRating'
import { toast } from 'sonner'
import { Loader2, CheckCircle } from 'lucide-react'
import type { OpenHouse } from '@/types'

const CRITERIOS = [
  { key: 'nota_tamanho', label: 'Tamanho' },
  { key: 'nota_disposicao', label: 'Disposição dos ambientes' },
  { key: 'nota_acabamento', label: 'Acabamento' },
  { key: 'nota_conservacao', label: 'Conservação' },
  { key: 'nota_areas_comuns', label: 'Áreas comuns' },
  { key: 'nota_localizacao', label: 'Localização' },
  { key: 'nota_preco', label: 'Preço' },
] as const

const schema = z
  .object({
    nome_corretor: z.string().min(1, 'Obrigatório'),
    imobiliaria: z.string().min(1, 'Obrigatório'),
    telefone: z.string().optional(),
    creci: z.string().optional(),
    nota_tamanho: z.number().min(0).max(5),
    nota_disposicao: z.number().min(0).max(5),
    nota_acabamento: z.number().min(0).max(5),
    nota_conservacao: z.number().min(0).max(5),
    nota_areas_comuns: z.number().min(0).max(5),
    nota_localizacao: z.number().min(0).max(5),
    nota_preco: z.number().min(0).max(5),
    compraria: z.enum(['sim', 'nao', 'talvez']),
    mais_gostou: z.string().optional(),
    menos_gostou: z.string().optional(),
  })
  .refine(
    (d) =>
      CRITERIOS.every((c) => (d[c.key] as number) >= 1 && (d[c.key] as number) <= 5),
    { message: 'Avalie todos os critérios (1 a 5 estrelas)', path: ['nota_tamanho'] }
  )

type FormData = z.infer<typeof schema>

interface AvaliacaoFormProps {
  openHouse: OpenHouse
}

export function AvaliacaoForm({ openHouse }: AvaliacaoFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nota_tamanho: 0,
      nota_disposicao: 0,
      nota_acabamento: 0,
      nota_conservacao: 0,
      nota_areas_comuns: 0,
      nota_localizacao: 0,
      nota_preco: 0,
      compraria: 'talvez',
    },
  })

  const watchNotas = watch()

  const onSubmit = async (data: FormData) => {
    const { error } = await (supabase.from('open_house_avaliacoes') as any).insert({
      open_house_id: openHouse.id,
      nome_corretor: data.nome_corretor,
      imobiliaria: data.imobiliaria,
      telefone: data.telefone || null,
      creci: data.creci || null,
      nota_tamanho: data.nota_tamanho,
      nota_disposicao: data.nota_disposicao,
      nota_acabamento: data.nota_acabamento,
      nota_conservacao: data.nota_conservacao,
      nota_areas_comuns: data.nota_areas_comuns,
      nota_localizacao: data.nota_localizacao,
      nota_preco: data.nota_preco,
      compraria: data.compraria,
      mais_gostou: data.mais_gostou || null,
      menos_gostou: data.menos_gostou || null,
    })

    if (error) {
      toast.error('Erro ao enviar. Tente novamente.')
      console.error(error)
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Obrigado!</h2>
        <p className="text-gray-600 mt-2">
          Sua avaliação foi registrada com sucesso. O proprietário receberá um relatório com os resultados.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-900">Seus dados</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
          <input
            {...register('nome_corretor')}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue"
            placeholder="Seu nome"
          />
          {errors.nome_corretor && (
            <p className="text-sm text-red-500 mt-1">{errors.nome_corretor.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imobiliária *</label>
          <input
            {...register('imobiliaria')}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue"
            placeholder="Nome da imobiliária"
          />
          {errors.imobiliaria && (
            <p className="text-sm text-red-500 mt-1">{errors.imobiliaria.message}</p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              {...register('telefone')}
              type="tel"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue"
              placeholder="(47) 99999-9999"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CRECI</label>
            <input
              {...register('creci')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue"
              placeholder="CRECI/SC XXXXX"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-900">Avaliação (1 a 5 estrelas)</h3>
        {CRITERIOS.map((c) => (
          <div key={c.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <label className="text-sm font-medium text-gray-700">{c.label}</label>
            <StarRating
              value={watchNotas[c.key] as number}
              onChange={(v) => setValue(c.key, v, { shouldValidate: true })}
              size="lg"
            />
          </div>
        ))}
        {errors.nota_tamanho && (
          <p className="text-sm text-red-500">{errors.nota_tamanho.message}</p>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-900">Você compraria este imóvel?</h3>
        <div className="flex gap-4">
          {(['sim', 'nao', 'talvez'] as const).map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer min-h-[48px]">
              <input
                type="radio"
                {...register('compraria')}
                value={opt}
                className="w-5 h-5 text-pharos-blue focus:ring-pharos-blue"
              />
              <span className="capitalize">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-900">Comentários (opcional)</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">O que mais gostou</label>
          <textarea
            {...register('mais_gostou')}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue resize-none"
            placeholder="O que mais chamou sua atenção?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">O que menos gostou</label>
          <textarea
            {...register('menos_gostou')}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue resize-none"
            placeholder="Pontos de melhoria"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full min-h-[48px] py-3 bg-pharos-blue text-white font-semibold rounded-xl hover:bg-pharos-blue/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Enviando...
          </>
        ) : (
          'Enviar avaliação'
        )}
      </button>
    </form>
  )
}
