import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [selicRes, ipca12Res, cdiRes] = await Promise.allSettled([
      fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json'),
      fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/12?formato=json'),
      fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados/ultimos/1?formato=json'),
    ])
    let selic = 13.25, ipca = 4.5, cdi = 13.15
    if (selicRes.status === 'fulfilled' && selicRes.value.ok) {
      const d = await selicRes.value.json(); selic = parseFloat(d[0]?.valor) || selic
    }
    if (ipca12Res.status === 'fulfilled' && ipca12Res.value.ok) {
      const d = await ipca12Res.value.json()
      ipca = d.reduce((s: number, i: { valor: string }) => s + parseFloat(i.valor || '0'), 0)
    }
    if (cdiRes.status === 'fulfilled' && cdiRes.value.ok) {
      const d = await cdiRes.value.json(); cdi = parseFloat(d[0]?.valor) || cdi
    }
    return NextResponse.json({ selic: Math.round(selic * 100) / 100, ipca: Math.round(ipca * 100) / 100, cdi: Math.round(cdi * 100) / 100, atualizadoEm: new Date().toISOString() })
  } catch {
    return NextResponse.json({ selic: 13.25, ipca: 4.5, cdi: 13.15, atualizadoEm: null, erro: 'Fallback' })
  }
}
