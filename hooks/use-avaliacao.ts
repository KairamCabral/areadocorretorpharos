'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
export function useAvaliacao(avaliacaoId?: string) {
  const [loading, setLoading] = useState(false)
  const [buscandoIA, setBuscandoIA] = useState(false)
  const supabase = createClient()

  const buscarComparaveis = async (dadosImovel: Record<string, unknown>) => {
    setBuscandoIA(true)
    try {
      const response = await fetch('/api/avaliacao/buscar-comparaveis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosImovel),
      })
      const data = await response.json()
      return data.comparaveis ?? []
    } catch (error) {
      console.error('Erro ao buscar comparáveis:', error)
      return []
    } finally {
      setBuscandoIA(false)
    }
  }

  const salvarAvaliacao = async (avaliacao: Record<string, unknown>) => {
    setLoading(true)
    try {
      if (avaliacaoId) {
        const { data, error } = await (supabase
          .from('avaliacoes') as any)
          .update({ ...avaliacao, updated_at: new Date().toISOString() })
          .eq('id', avaliacaoId)
          .select()
          .single()
        return { data: data as { id: string } & Record<string, unknown> | null, error }
      } else {
        const { data, error } = await (supabase
          .from('avaliacoes') as any)
          .insert(avaliacao)
          .select()
          .single()
        return { data: data as { id: string } & Record<string, unknown> | null, error }
      }
    } finally {
      setLoading(false)
    }
  }

  const salvarComparaveis = async (
    avaliacaoIdParam: string,
    comparaveis: Record<string, unknown>[]
  ) => {
    await supabase
      .from('avaliacao_comparaveis')
      .delete()
      .eq('avaliacao_id', avaliacaoIdParam)

    const rows = comparaveis.map((c) => ({ ...c, avaliacao_id: avaliacaoIdParam }))
    const { data, error } = await (supabase
      .from('avaliacao_comparaveis') as any)
      .insert(rows)
      .select()

    return { data, error }
  }

  return { loading, buscandoIA, buscarComparaveis, salvarAvaliacao, salvarComparaveis }
}
