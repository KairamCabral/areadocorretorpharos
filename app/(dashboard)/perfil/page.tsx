'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Image from 'next/image'
import {
  useAuth,
} from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { getInitials, formatDate } from '@/lib/utils'
import { Loader2, Pencil, X, LogOut, Trophy, TrendingUp } from 'lucide-react'
import type { Badge, Pontuacao } from '@/types'

const schema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  telefone: z.string().min(10, 'Telefone obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  creci: z.string().optional(),
  cnpj: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface BadgeComConquista {
  id: string
  nome: string
  descricao: string | null
  icone_url: string | null
  conquistado_em: string | null
}

export default function PerfilPage() {
  const { user, profile, signOut, loading: authLoading } = useAuth()
  const supabase = createClient()
  const [editMode, setEditMode] = useState(false)
  const [badges, setBadges] = useState<BadgeComConquista[]>([])
  const [pontuacoes, setPontuacoes] = useState<Pontuacao[]>([])
  const [totalPontos, setTotalPontos] = useState(0)
  const [loadingData, setLoadingData] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: profile?.nome ?? '',
      telefone: profile?.telefone ?? '',
      email: profile?.email ?? '',
      creci: profile?.creci ?? '',
      cnpj: profile?.cnpj ?? '',
    },
  })

  useEffect(() => {
    if (profile) {
      reset({
        nome: profile.nome,
        telefone: profile.telefone,
        email: profile.email ?? '',
        creci: profile.creci ?? '',
        cnpj: profile.cnpj ?? '',
      })
    }
  }, [profile, reset])

  useEffect(() => {
    if (!user?.id) {
      setLoadingData(false)
      return
    }

    const fetchData = async () => {
      setLoadingData(true)
      try {
        const { data: cbData } = await supabase
          .from('corretor_badges')
          .select(`
            conquistado_em,
            badges (
              id,
              nome,
              descricao,
              icone_url
            )
          `)
          .eq('corretor_id', user.id)

        const badgesList: BadgeComConquista[] = (cbData ?? [])
          .filter((cb: { badges: Badge | null }) => cb.badges)
          .map((cb: { conquistado_em: string | null; badges: Badge }) => ({
            id: (cb.badges as Badge).id,
            nome: (cb.badges as Badge).nome,
            descricao: (cb.badges as Badge).descricao,
            icone_url: (cb.badges as Badge).icone_url,
            conquistado_em: cb.conquistado_em,
          }))
        setBadges(badgesList)

        const { data: pontData } = await supabase
          .from('pontuacao')
          .select('*')
          .eq('corretor_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)
        setPontuacoes((pontData ?? []) as Pontuacao[])

        const total = (pontData ?? []).reduce((acc: number, p: { pontos?: number }) => acc + (p.pontos ?? 0), 0)
        setTotalPontos(total)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [user?.id])

  const onSubmit = async (data: FormData) => {
    if (!user) return

    const { error } = await (supabase
      .from('profiles') as any)
      .update({
        nome: data.nome,
        telefone: data.telefone,
        email: data.email || null,
        creci: data.creci || null,
        cnpj: data.cnpj || null,
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Erro ao salvar. Tente novamente.')
      console.error(error)
      return
    }

    toast.success('Perfil atualizado!')
    setEditMode(false)
  }

  if (authLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-pharos-blue" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-500 mt-0.5">Gerencie seus dados e acompanhe suas conquistas</p>
      </div>

      {/* Avatar e dados */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0">
            {profile.foto_url ? (
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100">
                <Image
                  src={profile.foto_url}
                  alt={profile.nome}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-pharos-blue flex items-center justify-center">
                <span className="text-white text-xl font-bold">{getInitials(profile.nome)}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {editMode ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    {...register('nome')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
                    placeholder="Seu nome"
                  />
                  {errors.nome && (
                    <p className="text-sm text-red-500 mt-1">{errors.nome.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    {...register('telefone')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
                    placeholder="(00) 00000-0000"
                  />
                  {errors.telefone && (
                    <p className="text-sm text-red-500 mt-1">{errors.telefone.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
                    placeholder="email@exemplo.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CRECI</label>
                  <input
                    {...register('creci')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
                    placeholder="CRECI/SC XXXXX-J"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                  <input
                    {...register('cnpj')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-h-[48px] px-6 py-3 bg-pharos-blue text-white font-semibold rounded-xl hover:bg-pharos-blue-dark transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false)
                      reset({
                        nome: profile.nome,
                        telefone: profile.telefone,
                        email: profile.email ?? '',
                        creci: profile.creci ?? '',
                        cnpj: profile.cnpj ?? '',
                      })
                    }}
                    className="min-h-[48px] px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{profile.nome}</h2>
                    <p className="text-gray-600">{profile.telefone}</p>
                    {profile.email && (
                      <p className="text-gray-600">{profile.email}</p>
                    )}
                    {profile.creci && (
                      <p className="text-sm text-gray-500 mt-1">CRECI: {profile.creci}</p>
                    )}
                    {profile.cnpj && (
                      <p className="text-sm text-gray-500">CNPJ: {profile.cnpj}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setEditMode(true)}
                    className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                    aria-label="Editar perfil"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Total pontos */}
      <div className="bg-gradient-to-r from-pharos-blue to-pharos-blue-dark rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-pharos-gold" />
          <div>
            <p className="text-white/80 text-sm">Total de pontos</p>
            <p className="text-xl font-bold">{totalPontos} pontos</p>
          </div>
        </div>
      </div>

      {/* Minhas Conquistas */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-pharos-gold" />
          Minhas Conquistas
        </h2>
        {loadingData ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-pharos-blue" />
          </div>
        ) : badges.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma conquista ainda. Continue usando as ferramentas para desbloquear badges!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {badges.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl bg-pharos-gold/10 border border-pharos-gold/20"
              >
                <div className="w-10 h-10 rounded-lg bg-pharos-gold/20 flex items-center justify-center mb-2">
                  <Trophy className="w-5 h-5 text-pharos-gold" />
                </div>
                <p className="font-medium text-gray-900">{b.nome}</p>
                {b.descricao && (
                  <p className="text-xs text-gray-500 mt-0.5">{b.descricao}</p>
                )}
                {b.conquistado_em && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(b.conquistado_em)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Histórico de Pontos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-pharos-blue" />
          Histórico de Pontos
        </h2>
        {loadingData ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-pharos-blue" />
          </div>
        ) : pontuacoes.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum ponto registrado ainda.</p>
        ) : (
          <ul className="space-y-2">
            {pontuacoes.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    +{p.pontos} pts
                  </p>
                  <p className="text-sm text-gray-500">
                    {p.descricao || p.tipo}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDate(p.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Logout */}
      <div className="pt-4">
        <button
          onClick={signOut}
          className="min-h-[48px] w-full flex items-center justify-center gap-2 px-6 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sair da conta
        </button>
      </div>
    </div>
  )
}
