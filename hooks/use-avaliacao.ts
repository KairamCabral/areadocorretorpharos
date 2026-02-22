'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Avaliacao, AvaliacaoComparavel } from '@/types'

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

  const salvarAvaliacao = async (avaliacao: Partial<Avaliacao>) => {
    setLoading(true)
    try {
      if (avaliacaoId) {
        const { data, error } = await supabase
          .from('avaliacoes')
          .update({ ...avaliacao, updated_at: new Date().toISOString() })
          .eq('id', avaliacaoId)
          .select()
          .single()
        return { data, error }
      } else {
        const { data, error } = await supabase
          .from('avaliacoes')
          .insert(avaliacao)
          .select()
          .single()
        return { data, error }
      }
    } finally {
      setLoading(false)
    }
  }

  const salvarComparaveis = async (
    avaliacaoId: string,
    comparaveis: Partial<AvaliacaoComparavel>[]
  ) => {
    // Remove existentes e insere novos
    await supabase
      .from('avaliacao_comparaveis')
      .delete()
      .eq('avaliacao_id', avaliacaoId)

    const { data, error } = await supabase
      .from('avaliacao_comparaveis')
      .insert(comparaveis.map((c) => ({ ...c, avaliacao_id: avaliacaoId })))
      .select()

    return { data, error }
  }

  return { loading, buscandoIA, buscarComparaveis, salvarAvaliacao, salvarComparaveis }
}
