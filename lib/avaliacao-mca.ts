/**
 * Lógica de Avaliação pelo Método Comparativo de Mercado (MCA)
 * Baseado nas instruções YAML da Pharos
 */

export interface Comparavel {
  id?: string
  codigo: string
  empreendimento: string
  valorTotal: number
  m2Privativo: number
  valorM2?: number // calculado
  quartos: number
  suites: number
  banheiros: number
  vagas: number
  infra: string
  mobilia: string
  andarPosicao: string
  condicao: string
  dataAtualizacao: string
  fonteUrl: string
  peso: number // 0.90 venda ativa, 1.00 venda concluída
  origem: 'ia' | 'manual'
  ativo: boolean
  ordem: number
}

export interface ResultadoAvaliacao {
  valorM2Medio: number
  valorComercial: number
  valorAvaliado: number
  valorMaximo: number
  fatorAjuste: number
  comparaveisAtivos: number
}

/**
 * Calcula os 3 valores de referência
 */
export function calcularAvaliacao(
  comparaveis: Comparavel[],
  idadePredio: number,
  infraLazer: string
): ResultadoAvaliacao {
  const ativos = comparaveis.filter((c) => c.ativo)

  if (ativos.length === 0) {
    return {
      valorM2Medio: 0,
      valorComercial: 0,
      valorAvaliado: 0,
      valorMaximo: 0,
      fatorAjuste: 0.90,
      comparaveisAtivos: 0,
    }
  }

  // Média ponderada do valor/m²
  let somaValorM2Ponderado = 0
  let somaPesos = 0

  for (const comp of ativos) {
    const valorM2 = comp.m2Privativo > 0 ? comp.valorTotal / comp.m2Privativo : 0
    somaValorM2Ponderado += valorM2 * comp.peso
    somaPesos += comp.peso
  }

  const valorM2Medio = somaPesos > 0 ? somaValorM2Ponderado / somaPesos : 0

  // Fator de ajuste: 0.85 se prédio >20 anos OU sem infraestrutura
  const fatorAjuste = idadePredio > 20 || infraLazer === 'sem' ? 0.85 : 0.90

  // Valores médios totais (usando média simples dos valores totais dos comparáveis)
  const mediaValorTotal =
    ativos.reduce((sum, c) => sum + c.valorTotal * c.peso, 0) / somaPesos

  return {
    valorM2Medio: Math.round(valorM2Medio),
    valorComercial: Math.round(mediaValorTotal * fatorAjuste),
    valorAvaliado: Math.round(mediaValorTotal),
    valorMaximo: Math.round(mediaValorTotal * 1.05),
    fatorAjuste,
    comparaveisAtivos: ativos.length,
  }
}

/**
 * Gera o system prompt para a OpenAI buscar comparáveis
 */
export function gerarPromptBuscaComparaveis(dados: {
  cidade: string
  bairro: string
  tipo: string
  m2Privativo: number
  quartos: number
  suites: number
  banheiros: number
  vagas: number
  mobilia: string
  infraLazer: string
}): string {
  return `Você é um avaliador imobiliário especialista no litoral de Santa Catarina.

TAREFA: Busque no mínimo 10 imóveis COMPARÁVEIS para avaliação pelo Método Comparativo de Mercado (MCA).

IMÓVEL A SER AVALIADO:
- Cidade: ${dados.cidade}
- Bairro: ${dados.bairro}
- Tipo: ${dados.tipo}
- Área privativa: ${dados.m2Privativo}m²
- Quartos: ${dados.quartos} | Suítes: ${dados.suites}
- Banheiros: ${dados.banheiros} | Vagas: ${dados.vagas}
- Mobília: ${dados.mobilia}
- Infraestrutura/Lazer: ${dados.infraLazer}

CRITÉRIOS DE BUSCA (seguir rigorosamente):
1. MESMO bairro ou bairros adjacentes similares
2. Variação de m² entre -15% e +30% do imóvel avaliado
3. Variação de ±1 quarto e ±1 banheiro
4. Imóveis PRONTOS (não incluir pré-lançamento ou em construção)
5. Anúncios atualizados nos últimos 6 meses
6. NUNCA usar o preço pedido pelo proprietário do imóvel avaliado

FONTES (buscar nestas plataformas):
- ZAP Imóveis, VivaReal, OLX Imóveis, Loft, Imovelweb

FORMATO DE RESPOSTA (JSON array):
Retorne EXATAMENTE este formato JSON, sem texto antes ou depois:
[
  {
    "codigo": "BC-001",
    "empreendimento": "Nome do Edifício",
    "valorTotal": 850000,
    "m2Privativo": 75,
    "quartos": 2,
    "suites": 1,
    "banheiros": 2,
    "vagas": 1,
    "infra": "completo",
    "mobilia": "sem",
    "andarPosicao": "8° andar, frente mar",
    "condicao": "sem reforma",
    "dataAtualizacao": "2026-01",
    "fonteUrl": "https://...",
    "peso": 0.90
  }
]

PESO: Use 0.90 para anúncios de venda ativa, 1.00 para vendas concluídas recentes.
Busque pelo menos 10 imóveis. Seja preciso nos valores e fontes.`
}
