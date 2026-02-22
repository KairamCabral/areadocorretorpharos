/**
 * Motor de cálculo do Simulador de Investimento Imobiliário
 * Compara investimento imobiliário vs renda fixa com custos de SC
 */

export interface SimulacaoInput {
  valorLancamento: number
  entrada: number
  parcelasMensais: number
  valorParcelaMensal: number
  parcelasSemestrais: number
  valorParcelaSemestral: number
  parcelasAnuais: number
  valorParcelaAnual: number
  saldoChaves: number
  prazoObraMeses: number
  tipoCorrecao: 'CUB' | 'INCC' | 'IPCA' | 'manual'
  taxaCorrecaoAnual: number
  posChavesIndice: string
  posChavesJuros: number
  itbiPercentual: number
  registroCartorio: number
  comissaoVendaPercentual: number
  valorizacaoAnualEstimada: number
  taxaSelic: number
  taxaCdb: number
  taxaLci: number
}

export interface CenarioResult {
  mesVenda: number
  label: string
  valorImovelMomento: number
  totalInvestido: number
  totalInvestidoCorrigido: number
  custosVenda: number
  lucroBruto: number
  irDevido: number
  lucroLiquido: number
  rentabilidadePercentual: number
  rentabilidadeAnualizada: number
  rendimentoSelic: number
  rendimentoCdb: number
  rendimentoLci: number
}

/**
 * IR Ganho de Capital Imóveis (Brasil) — Progressivo
 */
export function calcularIRGanhoCapital(ganho: number): number {
  if (ganho <= 0) return 0
  if (ganho <= 5_000_000) return ganho * 0.15
  if (ganho <= 10_000_000) return 5_000_000 * 0.15 + (ganho - 5_000_000) * 0.175
  if (ganho <= 30_000_000)
    return 5_000_000 * 0.15 + 5_000_000 * 0.175 + (ganho - 10_000_000) * 0.20
  return (
    5_000_000 * 0.15 +
    5_000_000 * 0.175 +
    20_000_000 * 0.20 +
    (ganho - 30_000_000) * 0.225
  )
}

/**
 * IR Renda Fixa — Tabela Regressiva
 */
export function calcularIRRendaFixa(rendimento: number, diasAplicacao: number): number {
  if (rendimento <= 0) return 0
  if (diasAplicacao <= 180) return rendimento * 0.225
  if (diasAplicacao <= 360) return rendimento * 0.20
  if (diasAplicacao <= 720) return rendimento * 0.175
  return rendimento * 0.15
}

/**
 * Gera cenários de venda em diferentes momentos
 */
export function calcularCenarios(input: SimulacaoInput): CenarioResult[] {
  const cenarios: CenarioResult[] = []
  const mesesSimulacao = input.prazoObraMeses + 24 // obra + 2 anos após entrega

  for (let mes = 6; mes <= mesesSimulacao; mes += 6) {
    const label =
      mes < input.prazoObraMeses
        ? `Mês ${mes} (em obra)`
        : mes === input.prazoObraMeses
        ? 'Na entrega'
        : `+${mes - input.prazoObraMeses}m após entrega`

    const cenario = calcularCenarioMes(input, mes, label)
    cenarios.push(cenario)
  }

  return cenarios
}

/**
 * Calcula cenário para um mês específico de venda
 */
export function calcularCenarioMes(
  input: SimulacaoInput,
  mesVenda: number,
  label: string
): CenarioResult {
  // 1. Valor do imóvel no momento da venda
  const valorImovelMomento =
    input.valorLancamento * Math.pow(1 + input.valorizacaoAnualEstimada / 100, mesVenda / 12)

  // 2. Total investido até o mês
  const parcelasMensaisPagas = Math.min(mesVenda, input.parcelasMensais)
  const parcelasSemestraisPagas = Math.min(Math.floor(mesVenda / 6), input.parcelasSemestrais)
  const parcelasAnuaisPagas = Math.min(Math.floor(mesVenda / 12), input.parcelasAnuais)
  const pagouChaves = mesVenda >= input.prazoObraMeses

  let totalInvestido = input.entrada
  totalInvestido += parcelasMensaisPagas * input.valorParcelaMensal
  totalInvestido += parcelasSemestraisPagas * input.valorParcelaSemestral
  totalInvestido += parcelasAnuaisPagas * input.valorParcelaAnual
  if (pagouChaves) totalInvestido += input.saldoChaves

  // 3. Total investido corrigido (CUB/INCC/IPCA)
  const taxaMensal = input.taxaCorrecaoAnual / 100 / 12
  let totalCorrigido = input.entrada * Math.pow(1 + taxaMensal, mesVenda)
  for (let m = 1; m <= parcelasMensaisPagas; m++) {
    totalCorrigido += input.valorParcelaMensal * Math.pow(1 + taxaMensal, mesVenda - m)
  }
  for (let s = 1; s <= parcelasSemestraisPagas; s++) {
    totalCorrigido +=
      input.valorParcelaSemestral * Math.pow(1 + taxaMensal, mesVenda - s * 6)
  }
  for (let a = 1; a <= parcelasAnuaisPagas; a++) {
    totalCorrigido +=
      input.valorParcelaAnual * Math.pow(1 + taxaMensal, mesVenda - a * 12)
  }
  if (pagouChaves) {
    totalCorrigido +=
      input.saldoChaves * Math.pow(1 + taxaMensal, mesVenda - input.prazoObraMeses)
  }

  // 4. Custos de venda
  const comissao = valorImovelMomento * (input.comissaoVendaPercentual / 100)
  const ganhoCapital = valorImovelMomento - totalCorrigido - comissao
  const irDevido = calcularIRGanhoCapital(ganhoCapital)
  const custosVenda = comissao + irDevido

  // 5. Lucro líquido
  const lucroBruto = valorImovelMomento - totalInvestido
  const lucroLiquido = valorImovelMomento - totalInvestido - custosVenda

  // 6. Rentabilidade
  const rentabilidadePercentual =
    totalInvestido > 0 ? (lucroLiquido / totalInvestido) * 100 : 0
  const anos = mesVenda / 12
  const rentabilidadeAnualizada =
    anos > 0
      ? (Math.pow(1 + lucroLiquido / totalInvestido, 1 / anos) - 1) * 100
      : 0

  // 7. Comparativo Renda Fixa (mesmo capital investido)
  const selicMensal = input.taxaSelic / 100 / 12
  const cdbMensal = input.taxaCdb / 100 / 12
  const lciMensal = (input.taxaLci / 100) / 12

  const rendBrutoSelic = totalInvestido * (Math.pow(1 + selicMensal, mesVenda) - 1)
  const rendBrutoCdb = totalInvestido * (Math.pow(1 + cdbMensal, mesVenda) - 1)
  const rendBrutoLci = totalInvestido * (Math.pow(1 + lciMensal, mesVenda) - 1)

  const diasAplicacao = mesVenda * 30
  const rendimentoSelic = rendBrutoSelic - calcularIRRendaFixa(rendBrutoSelic, diasAplicacao)
  const rendimentoCdb = rendBrutoCdb - calcularIRRendaFixa(rendBrutoCdb, diasAplicacao)
  const rendimentoLci = rendBrutoLci // LCI isento de IR

  return {
    mesVenda,
    label,
    valorImovelMomento: Math.round(valorImovelMomento),
    totalInvestido: Math.round(totalInvestido),
    totalInvestidoCorrigido: Math.round(totalCorrigido),
    custosVenda: Math.round(custosVenda),
    lucroBruto: Math.round(lucroBruto),
    irDevido: Math.round(irDevido),
    lucroLiquido: Math.round(lucroLiquido),
    rentabilidadePercentual: Math.round(rentabilidadePercentual * 100) / 100,
    rentabilidadeAnualizada: Math.round(rentabilidadeAnualizada * 100) / 100,
    rendimentoSelic: Math.round(rendimentoSelic),
    rendimentoCdb: Math.round(rendimentoCdb),
    rendimentoLci: Math.round(rendimentoLci),
  }
}

/**
 * Gera dados mensais para o gráfico interativo
 */
export function calcularDadosGrafico(input: SimulacaoInput) {
  const meses = input.prazoObraMeses + 24
  const dados = []

  for (let mes = 1; mes <= meses; mes++) {
    const cenario = calcularCenarioMes(input, mes, `Mês ${mes}`)
    dados.push({
      mes,
      valorImovel: cenario.valorImovelMomento,
      totalInvestido: cenario.totalInvestido,
      lucroLiquido: cenario.lucroLiquido,
      rendaFixa: cenario.rendimentoSelic,
    })
  }

  return dados
}
