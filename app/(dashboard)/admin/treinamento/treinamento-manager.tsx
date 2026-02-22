'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { TreinamentoCategoria, TreinamentoAula } from '@/types'
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Video,
  FileText,
  File,
  HelpCircle,
  Loader2,
} from 'lucide-react'
import * as Switch from '@radix-ui/react-switch'

const CONTEUDO_TIPOS = [
  { value: 'video', label: 'Vídeo', icon: Video },
  { value: 'texto', label: 'Texto', icon: FileText },
  { value: 'pdf', label: 'PDF', icon: File },
  { value: 'quiz', label: 'Quiz', icon: HelpCircle },
] as const

const categoriaSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  descricao: z.string().optional(),
  ordem: z.coerce.number().min(0),
})

const aulaSchema = z.object({
  titulo: z.string().min(2, 'Título obrigatório'),
  descricao: z.string().optional(),
  conteudo_tipo: z.enum(['video', 'texto', 'pdf', 'quiz']),
  conteudo_url: z.string().optional(),
  duracao_minutos: z.coerce.number().min(0).optional(),
  pontos: z.coerce.number().min(0),
  ordem: z.coerce.number().min(0),
})

type CategoriaFormData = z.infer<typeof categoriaSchema>
type AulaFormData = z.infer<typeof aulaSchema>

interface CategoriaComAulas extends TreinamentoCategoria {
  aulas: TreinamentoAula[]
}

interface TreinamentoManagerProps {
  categorias: CategoriaComAulas[]
}

export function TreinamentoManager({ categorias }: TreinamentoManagerProps) {
  const router = useRouter()
  const supabase = createClient()
  const [expandedCat, setExpandedCat] = useState<string | null>(categorias[0]?.id ?? null)
  const [editingCategoria, setEditingCategoria] = useState<string | null>(null)
  const [editingAula, setEditingAula] = useState<string | null>(null)
  const [showNewCategoria, setShowNewCategoria] = useState(false)
  const [showNewAula, setShowNewAula] = useState<string | null>(null)

  const catForm = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: { nome: '', descricao: '', ordem: 0 },
  })

  const aulaForm = useForm<AulaFormData>({
    resolver: zodResolver(aulaSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      conteudo_tipo: 'video',
      conteudo_url: '',
      duracao_minutos: 10,
      pontos: 10,
      ordem: 0,
    },
  })

  const onSubmitCategoria = async (data: CategoriaFormData, id?: string) => {
    if (id) {
      const { error } = await (supabase.from('treinamento_categorias') as any).update({ nome: data.nome, descricao: data.descricao || null, ordem: data.ordem }).eq('id', id)
      if (error) {
        toast.error('Erro ao atualizar categoria')
        return
      }
      toast.success('Categoria atualizada!')
      setEditingCategoria(null)
    } else {
      const { error } = await (supabase.from('treinamento_categorias') as any).insert({ nome: data.nome, descricao: data.descricao || null, ordem: data.ordem })
      if (error) {
        toast.error('Erro ao criar categoria')
        return
      }
      toast.success('Categoria criada!')
      setShowNewCategoria(false)
      catForm.reset()
    }
    router.refresh()
  }

  const onSubmitAula = async (data: AulaFormData, categoriaId: string, aulaId?: string) => {
    const payload = {
      titulo: data.titulo,
      descricao: data.descricao || null,
      conteudo_tipo: data.conteudo_tipo,
      conteudo_url: data.conteudo_url || null,
      duracao_minutos: data.duracao_minutos ?? null,
      pontos: data.pontos,
      ordem: data.ordem,
      categoria_id: categoriaId,
    }
    if (aulaId) {
      const { error } = await (supabase.from('treinamento_aulas') as any).update(payload).eq('id', aulaId)
      if (error) {
        toast.error('Erro ao atualizar aula')
        return
      }
      toast.success('Aula atualizada!')
      setEditingAula(null)
    } else {
      const { error } = await (supabase.from('treinamento_aulas') as any).insert(payload)
      if (error) {
        toast.error('Erro ao criar aula')
        return
      }
      toast.success('Aula criada!')
      setShowNewAula(null)
      aulaForm.reset()
    }
    router.refresh()
  }

  const deleteCategoria = async (id: string) => {
    if (!confirm('Excluir categoria e todas as aulas?')) return
    const { error } = await supabase.from('treinamento_categorias').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao excluir')
      return
    }
    toast.success('Categoria excluída')
    router.refresh()
  }

  const deleteAula = async (id: string) => {
    if (!confirm('Excluir esta aula?')) return
    const { error } = await supabase.from('treinamento_aulas').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao excluir')
      return
    }
    toast.success('Aula excluída')
    router.refresh()
  }

  const toggleAulaAtivo = async (id: string, ativo: boolean) => {
    const { error } = await (supabase.from('treinamento_aulas') as any).update({ ativo }).eq('id', id)
    if (error) {
      toast.error('Erro ao atualizar')
      return
    }
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowNewCategoria(true)}
          className="min-h-[48px] px-6 py-3 bg-pharos-blue text-white font-semibold rounded-xl hover:bg-pharos-blue-dark flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova categoria
        </button>
      </div>

      {showNewCategoria && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Nova categoria</h3>
          <form
            onSubmit={catForm.handleSubmit((d) => onSubmitCategoria(d))}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                {...catForm.register('nome')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
              />
              {catForm.formState.errors.nome && (
                <p className="text-sm text-red-500 mt-1">{catForm.formState.errors.nome.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input
                {...catForm.register('descricao')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
              <input
                type="number"
                {...catForm.register('ordem')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={catForm.formState.isSubmitting}
                className="min-h-[48px] px-6 py-3 bg-pharos-blue text-white font-semibold rounded-xl hover:bg-pharos-blue-dark disabled:opacity-50"
              >
                Criar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewCategoria(false)
                  catForm.reset()
                }}
                className="min-h-[48px] px-6 py-3 border border-gray-200 rounded-xl"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {categorias.map((cat) => (
        <div
          key={cat.id}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50"
            onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
          >
            <div className="flex items-center gap-3">
              {expandedCat === cat.id ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <h2 className="font-semibold text-gray-900">{cat.nome}</h2>
                <p className="text-sm text-gray-500">{cat.aulas.length} aulas</p>
              </div>
            </div>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setEditingCategoria(cat.id)
                  catForm.reset({
                    nome: cat.nome,
                    descricao: cat.descricao ?? '',
                    ordem: cat.ordem ?? 0,
                  })
                }}
                className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50"
                aria-label="Editar categoria"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => deleteCategoria(cat.id)}
                className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                aria-label="Excluir categoria"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewAula(cat.id)
                  setExpandedCat(cat.id)
                  aulaForm.reset({
                    titulo: '',
                    descricao: '',
                    conteudo_tipo: 'video',
                    conteudo_url: '',
                    duracao_minutos: 10,
                    pontos: 10,
                    ordem: cat.aulas.length,
                  })
                }}
                className="min-h-[48px] px-4 py-2 bg-pharos-blue text-white font-medium rounded-xl hover:bg-pharos-blue-dark flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Aula
              </button>
            </div>
          </div>

          {editingCategoria === cat.id && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <form
                onSubmit={catForm.handleSubmit((d) => onSubmitCategoria(d, cat.id))}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    {...catForm.register('nome')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                  <input
                    type="number"
                    {...catForm.register('ordem')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl min-h-[48px]"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={catForm.formState.isSubmitting}
                    className="min-h-[48px] px-6 py-3 bg-pharos-blue text-white font-semibold rounded-xl"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCategoria(null)}
                    className="min-h-[48px] px-6 py-3 border border-gray-200 rounded-xl"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {expandedCat === cat.id && (
            <div className="border-t border-gray-100 p-4 space-y-3">
              {showNewAula === cat.id && (
                <div className="bg-pharos-blue/5 rounded-xl p-4 border border-pharos-blue/20">
                  <h4 className="font-medium text-gray-900 mb-4">Nova aula</h4>
                  <form
                    onSubmit={aulaForm.handleSubmit((d) => onSubmitAula(d, cat.id))}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        {...aulaForm.register('titulo')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl min-h-[48px]"
                      />
                      {aulaForm.formState.errors.titulo && (
                        <p className="text-sm text-red-500">{aulaForm.formState.errors.titulo.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de conteúdo</label>
                      <select
                        {...aulaForm.register('conteudo_tipo')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl min-h-[48px]"
                      >
                        {CONTEUDO_TIPOS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL do conteúdo</label>
                      <input
                        {...aulaForm.register('conteudo_url')}
                        placeholder="https://..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl min-h-[48px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duração (min)</label>
                        <input
                          type="number"
                          {...aulaForm.register('duracao_minutos')}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl min-h-[48px]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pontos</label>
                        <input
                          type="number"
                          {...aulaForm.register('pontos')}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl min-h-[48px]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                      <input
                        type="number"
                        {...aulaForm.register('ordem')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl min-h-[48px]"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={aulaForm.formState.isSubmitting}
                        className="min-h-[48px] px-6 py-3 bg-pharos-blue text-white font-semibold rounded-xl"
                      >
                        Criar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewAula(null)}
                        className="min-h-[48px] px-6 py-3 border border-gray-200 rounded-xl"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {cat.aulas
                .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
                .map((aula) => (
                  <div
                    key={aula.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    {editingAula === aula.id ? (
                      <form
                        onSubmit={aulaForm.handleSubmit((d) => onSubmitAula(d, cat.id, aula.id))}
                        className="flex-1 space-y-4"
                      >
                        <div>
                          <input
                            {...aulaForm.register('titulo')}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl min-h-[48px]"
                          />
                        </div>
                        <div className="flex gap-4">
                          <select
                            {...aulaForm.register('conteudo_tipo')}
                            className="px-4 py-3 border border-gray-200 rounded-xl min-h-[48px]"
                          >
                            {CONTEUDO_TIPOS.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                          <input
                            {...aulaForm.register('conteudo_url')}
                            placeholder="URL"
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl min-h-[48px]"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={aulaForm.formState.isSubmitting}
                            className="min-h-[48px] px-6 py-3 bg-pharos-blue text-white font-semibold rounded-xl"
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingAula(null)}
                            className="min-h-[48px] px-6 py-3 border border-gray-200 rounded-xl"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-pharos-blue/10 flex items-center justify-center">
                            {CONTEUDO_TIPOS.find((t) => t.value === aula.conteudo_tipo)?.icon ? (
                              (() => {
                                const Icon = CONTEUDO_TIPOS.find((t) => t.value === aula.conteudo_tipo)!.icon
                                return <Icon className="w-5 h-5 text-pharos-blue" />
                              })()
                            ) : (
                              <FileText className="w-5 h-5 text-pharos-blue" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{aula.titulo}</p>
                            <p className="text-sm text-gray-500">
                              {aula.duracao_minutos ? `${aula.duracao_minutos} min` : '-'} · {aula.pontos} pts
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch.Root
                            checked={aula.ativo ?? true}
                            onCheckedChange={(checked) => toggleAulaAtivo(aula.id, checked)}
                            className="w-11 h-6 rounded-full bg-gray-200 data-[state=checked]:bg-pharos-blue"
                            aria-label="Ativo"
                          >
                            <Switch.Thumb className="block w-5 h-5 rounded-full bg-white shadow transition-transform translate-x-0.5 data-[state=checked]:translate-x-6" />
                          </Switch.Root>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAula(aula.id)
                              aulaForm.reset({
                                titulo: aula.titulo,
                                descricao: aula.descricao ?? '',
                                conteudo_tipo: (aula.conteudo_tipo as 'video' | 'texto' | 'pdf' | 'quiz') ?? 'video',
                                conteudo_url: aula.conteudo_url ?? '',
                                duracao_minutos: aula.duracao_minutos ?? 10,
                                pontos: aula.pontos ?? 10,
                                ordem: aula.ordem ?? 0,
                              })
                            }}
                            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAula(aula.id)}
                            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
