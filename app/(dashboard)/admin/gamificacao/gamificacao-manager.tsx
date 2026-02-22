'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { registrarPontos } from '@/lib/gamificacao'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { Badge } from '@/types'
import { Trophy, Award, Loader2 } from 'lucide-react'

interface RankingEntry {
  corretor_id: string
  nome: string
  total_pontos: number
}

interface GamificacaoManagerProps {
  ranking: RankingEntry[]
  badges: Badge[]
  totalPontos: number
  corretores: { id: string; nome: string }[]
}

export function GamificacaoManager({
  ranking,
  badges,
  totalPontos,
  corretores,
}: GamificacaoManagerProps) {
  const router = useRouter()
  const supabase = createClient()
  const [editingBadge, setEditingBadge] = useState<string | null>(null)
  const [pontosBonus, setPontosBonus] = useState<Record<string, number>>({})
  const [showGrantBadge, setShowGrantBadge] = useState(false)
  const [grantCorretor, setGrantCorretor] = useState('')
  const [grantBadge, setGrantBadge] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSavePontosBonus = async (badgeId: string) => {
    const valor = pontosBonus[badgeId]
    if (valor === undefined) return
    setSaving(true)
    const { error } = await (supabase.from('badges') as any).update({ pontos_bonus: valor }).eq('id', badgeId)
    setSaving(false)
    setEditingBadge(null)
    if (error) {
      console.error(error)
      return
    }
    router.refresh()
  }

  const handleGrantBadge = async () => {
    if (!grantCorretor || !grantBadge) return
    setSaving(true)
    const { data: jaTem } = await supabase
      .from('corretor_badges')
      .select('id')
      .eq('corretor_id', grantCorretor)
      .eq('badge_id', grantBadge)
      .single()

    if (jaTem) {
      setSaving(false)
      alert('Este corretor já possui este badge.')
      return
    }

    const { error: insertError } = await (supabase.from('corretor_badges') as any).insert({ corretor_id: grantCorretor, badge_id: grantBadge })

    if (insertError) {
      setSaving(false)
      console.error(insertError)
      return
    }

    const badge = badges.find((b) => b.id === grantBadge)
    if (badge?.pontos_bonus && badge.pontos_bonus > 0) {
      await registrarPontos(
        supabase as unknown as SupabaseClient<Database>,
        grantCorretor,
        'badge',
        grantBadge,
        badge.pontos_bonus,
        `Badge manual: ${badge.nome}`
      )
    }

    setSaving(false)
    setShowGrantBadge(false)
    setGrantCorretor('')
    setGrantBadge('')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Total pontos */}
      <div className="bg-gradient-to-r from-pharos-blue to-pharos-blue-dark rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-pharos-gold" />
          </div>
          <div>
            <p className="text-white/80 text-sm">Total de pontos na plataforma</p>
            <p className="text-3xl font-bold">{totalPontos.toLocaleString('pt-BR')} pts</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ranking */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-pharos-dark flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-pharos-gold" />
            Ranking
          </h2>
          {ranking.length === 0 ? (
            <p className="text-gray-500 py-8">Nenhum ponto registrado ainda.</p>
          ) : (
            <ul className="space-y-3">
              {ranking.map((r, i) => (
                <li
                  key={r.corretor_id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        i === 0
                          ? 'bg-pharos-gold text-white'
                          : i === 1
                            ? 'bg-gray-300 text-gray-700'
                            : i === 2
                              ? 'bg-amber-700/20 text-amber-800'
                              : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="font-medium text-gray-900">{r.nome}</span>
                  </div>
                  <span className="font-semibold text-pharos-blue">{r.total_pontos} pts</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Badges */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-pharos-dark flex items-center gap-2">
              <Award className="w-5 h-5 text-pharos-gold" />
              Badges
            </h2>
            <button
              type="button"
              onClick={() => setShowGrantBadge(true)}
              className="min-h-[48px] px-4 py-2 bg-pharos-blue text-white font-medium rounded-xl hover:bg-pharos-blue-dark"
            >
              Conceder badge
            </button>
          </div>
          {badges.length === 0 ? (
            <p className="text-gray-500 py-8">Nenhum badge cadastrado.</p>
          ) : (
            <ul className="space-y-3">
              {badges.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{b.nome}</p>
                    {b.descricao && (
                      <p className="text-sm text-gray-500">{b.descricao}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editingBadge === b.id ? (
                      <>
                        <input
                          type="number"
                          value={pontosBonus[b.id] ?? b.pontos_bonus ?? 0}
                          onChange={(e) =>
                            setPontosBonus((prev) => ({
                              ...prev,
                              [b.id]: parseInt(e.target.value, 10) || 0,
                            }))
                          }
                          className="w-20 px-2 py-2 border border-gray-200 rounded-lg text-center"
                        />
                        <button
                          type="button"
                          onClick={() => handleSavePontosBonus(b.id)}
                          disabled={saving}
                          className="min-h-[48px] px-3 py-2 bg-pharos-blue text-white text-sm rounded-lg"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingBadge(null)}
                          className="min-h-[48px] px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-gray-600">
                          +{b.pontos_bonus ?? 0} pts
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBadge(b.id)
                            setPontosBonus((prev) => ({ ...prev, [b.id]: b.pontos_bonus ?? 0 }))
                          }}
                          className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
                          aria-label="Editar pontos"
                        >
                          Editar
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal conceder badge */}
      {showGrantBadge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-4">Conceder badge manualmente</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Corretor</label>
                <select
                  value={grantCorretor}
                  onChange={(e) => setGrantCorretor(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl min-h-[48px]"
                >
                  <option value="">Selecione...</option>
                  {corretores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
                <select
                  value={grantBadge}
                  onChange={(e) => setGrantBadge(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl min-h-[48px]"
                >
                  <option value="">Selecione...</option>
                  {badges.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nome} (+{b.pontos_bonus ?? 0} pts)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleGrantBadge}
                disabled={saving || !grantCorretor || !grantBadge}
                className="min-h-[48px] flex-1 px-6 py-3 bg-pharos-blue text-white font-semibold rounded-xl hover:bg-pharos-blue-dark disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                Conceder
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowGrantBadge(false)
                  setGrantCorretor('')
                  setGrantBadge('')
                }}
                className="min-h-[48px] px-6 py-3 border border-gray-200 rounded-xl"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
