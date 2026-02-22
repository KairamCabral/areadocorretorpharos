'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CenarioResult } from '@/lib/calculadora-investimento'

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

  const salvarSimulacao = async (simulacao: Record<string, unknown>) => {
    setLoading(true)
    try {
      const { data, error } = await (supabase
        .from('simulacoes') as any)
        .insert(simulacao)
        .select()
        .single()
      return { data: data as { id: string } & Record<string, unknown> | null, error }
    } finally {
      setLoading(false)
    }
  }

  const salvarCenarios = async (simulacaoId: string, cenarios: CenarioResult[]) => {
    const rows = cenarios.map((c) => ({
      simulacao_id: simulacaoId,
      mes_venda: c.mesVenda,
      label: c.label,
      valor_imovel_momento: c.valorImovelMomento,
      total_investido: c.totalInvestido,
      total_investido_corrigido: c.totalInvestidoCorrigido,
      custos_venda: c.custosVenda,
      lucro_bruto: c.lucroBruto,
      ir_devido: c.irDevido,
      lucro_liquido: c.lucroLiquido,
      rentabilidade_percentual: c.rentabilidadePercentual,
      rentabilidade_anualizada: c.rentabilidadeAnualizada,
      rendimento_selic: c.rendimentoSelic,
      rendimento_cdb: c.rendimentoCdb,
      rendimento_lci: c.rendimentoLci,
    }))
    const { error } = await (supabase.from('simulacao_cenarios') as any).insert(rows)
    return { error }
  }

  return { loading, buscarIndices, salvarSimulacao, salvarCenarios }
}
