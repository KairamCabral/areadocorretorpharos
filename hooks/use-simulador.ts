'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Simulacao } from '@/types'

export function useSimulador() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const buscarIndices = async () => {
    try {
      const response = await fetch('/api/indices')
      return await response.json()
    } catch {
      return { selic: 13.25, ipca: 4.5, cdi: 13.15 }
    }
  }

  const salvarSimulacao = async (simulacao: Partial<Simulacao>) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('simulacoes')
        .insert(simulacao)
        .select()
        .single()
      return { data, error }
    } finally {
      setLoading(false)
    }
  }

  return { loading, buscarIndices, salvarSimulacao }
}
