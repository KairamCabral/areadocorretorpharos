import Link from 'next/link'
import { createAdminSupabase } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import {
  Users,
  FileCheck,
  Calculator,
  DoorOpen,
  LayoutDashboard,
  BarChart3,
  BookOpen,
  Trophy,
  ChevronRight,
} from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createAdminSupabase()

  const [
    { count: totalCorretores },
    { count: totalAvaliacoes },
    { count: totalSimulacoes },
    { count: totalOpenHouses },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('avaliacoes').select('*', { count: 'exact', head: true }),
    supabase.from('simulacoes').select('*', { count: 'exact', head: true }),
    supabase.from('open_houses').select('*', { count: 'exact', head: true }),
  ])

  const { data: avaliacoesRecentes } = await supabase
    .from('avaliacoes')
    .select('id, corretor_id, cidade, bairro, status, created_at')
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: simulacoesRecentes } = await supabase
    .from('simulacoes')
    .select('id, corretor_id, empreendimento_nome, status, created_at')
    .order('created_at', { ascending: false })
    .limit(3)

  const corretorIds = [
    ...(avaliacoesRecentes ?? []).map((a) => a.corretor_id).filter(Boolean),
    ...(simulacoesRecentes ?? []).map((s) => s.corretor_id).filter(Boolean),
  ] as string[]
  const uniqueIds = [...new Set(corretorIds)]

  const { data: profilesMap } =
    uniqueIds.length > 0
      ? await supabase.from('profiles').select('id, nome').in('id', uniqueIds)
      : { data: [] as { id: string; nome: string }[] }
  const nomePorId = new Map((profilesMap ?? []).map((p) => [p.id, p.nome]))

  const atividades = [
    ...(avaliacoesRecentes ?? []).map((a) => ({
      tipo: 'avaliacao' as const,
      id: a.id,
      titulo: `Avaliação - ${a.cidade}, ${a.bairro}`,
      corretor: (a.corretor_id && nomePorId.get(a.corretor_id)) ?? 'Corretor',
      data: a.created_at,
      status: a.status,
    })),
    ...(simulacoesRecentes ?? []).map((s) => ({
      tipo: 'simulacao' as const,
      id: s.id,
      titulo: `Simulação - ${s.empreendimento_nome}`,
      corretor: (s.corretor_id && nomePorId.get(s.corretor_id)) ?? 'Corretor',
      data: s.created_at,
      status: s.status,
    })),
  ]
    .filter((a) => a.data)
    .sort((a, b) => new Date(b.data!).getTime() - new Date(a.data!).getTime())
    .slice(0, 5)

  const quickLinks = [
    { href: '/admin/corretores', label: 'Corretores', icon: Users },
    { href: '/admin/treinamento', label: 'Treinamento', icon: BookOpen },
    { href: '/admin/metricas', label: 'Métricas', icon: BarChart3 },
    { href: '/admin/gamificacao', label: 'Gamificação', icon: Trophy },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pharos-dark">Dashboard Admin</h1>
        <p className="text-gray-500 mt-0.5">Visão geral da plataforma Pharos Corretor</p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-pharos-blue/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-pharos-blue" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Corretores</p>
              <p className="text-2xl font-bold text-pharos-dark">{totalCorretores ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-pharos-gold/10 flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-pharos-gold" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avaliações</p>
              <p className="text-2xl font-bold text-pharos-dark">{totalAvaliacoes ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Simulações</p>
              <p className="text-2xl font-bold text-pharos-dark">{totalSimulacoes ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <DoorOpen className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Open Houses</p>
              <p className="text-2xl font-bold text-pharos-dark">{totalOpenHouses ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-pharos-dark flex items-center gap-2 mb-4">
          <LayoutDashboard className="w-5 h-5 text-pharos-blue" />
          Acesso rápido
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="min-h-[48px] flex items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 hover:border-pharos-blue/30 hover:bg-pharos-blue/5 transition"
            >
              <div className="flex items-center gap-3">
                <link.icon className="w-5 h-5 text-pharos-blue" />
                <span className="font-medium text-gray-900">{link.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* Atividade recente */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-pharos-dark mb-4">Atividade recente</h2>
        {atividades.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">Nenhuma atividade recente.</p>
        ) : (
          <ul className="space-y-3">
            {atividades.map((a) => (
              <li
                key={`${a.tipo}-${a.id}`}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{a.titulo}</p>
                  <p className="text-sm text-gray-500">
                    {a.corretor} · {a.data ? formatDate(a.data) : '-'}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
