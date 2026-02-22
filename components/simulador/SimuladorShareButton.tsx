'use client'

import { generateWhatsAppLink } from '@/lib/utils'
import { Share2 } from 'lucide-react'

interface SimuladorShareButtonProps {
  publicUrl: string
  empreendimentoNome: string
  phone: string
}

export function SimuladorShareButton({
  publicUrl,
  empreendimentoNome,
  phone,
}: SimuladorShareButtonProps) {
  const message = `Simulação de investimento: ${empreendimentoNome}\n\nConfira a análise completa: ${publicUrl}`
  const cleanPhone = phone.replace(/\D/g, '')
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
  const href = generateWhatsAppLink(fullPhone, message)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition min-h-[48px]"
    >
      <Share2 className="w-5 h-5" />
      Compartilhar via WhatsApp
    </a>
  )
}
