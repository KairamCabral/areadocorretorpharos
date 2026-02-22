'use client'

import { useState } from 'react'
import { Copy, Check, MessageCircle } from 'lucide-react'
import { generateWhatsAppShareLink } from '@/lib/utils'

interface ShareLinksProps {
  tokenAvaliacao: string
  tokenResultado: string
  empreendimento: string
}

export function ShareLinks({ tokenAvaliacao, tokenResultado, empreendimento }: ShareLinksProps) {
  const [copiedAvaliacao, setCopiedAvaliacao] = useState(false)
  const [copiedResultado, setCopiedResultado] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const linkAvaliacao = `${baseUrl}/p/open-house/${tokenAvaliacao}`
  const linkResultado = `${baseUrl}/p/open-house/${tokenResultado}/resultado`

  const copyToClipboard = async (text: string, type: 'avaliacao' | 'resultado') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'avaliacao') {
        setCopiedAvaliacao(true)
        setTimeout(() => setCopiedAvaliacao(false), 2000)
      } else {
        setCopiedResultado(true)
        setTimeout(() => setCopiedResultado(false), 2000)
      }
    } catch {
      // fallback
    }
  }

  const msgAvaliacao = `Olá! Segue o link para avaliar o imóvel ${empreendimento}:\n${linkAvaliacao}`
  const msgResultado = `Olá! Segue o link com o resultado das avaliações do imóvel ${empreendimento}:\n${linkResultado}`

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Formulário de avaliação</label>
        <p className="text-xs text-gray-500 mb-2">Envie para corretores visitantes preencherem</p>
        <div className="flex gap-2">
          <input
            readOnly
            value={linkAvaliacao}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm"
          />
          <button
            type="button"
            onClick={() => copyToClipboard(linkAvaliacao, 'avaliacao')}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600"
          >
            {copiedAvaliacao ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
          </button>
          <a
            href={generateWhatsAppShareLink(msgAvaliacao)}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl bg-green-600 text-white hover:bg-green-700"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Resultado para proprietário</label>
        <p className="text-xs text-gray-500 mb-2">Envie para o proprietário ver o relatório</p>
        <div className="flex gap-2">
          <input
            readOnly
            value={linkResultado}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm"
          />
          <button
            type="button"
            onClick={() => copyToClipboard(linkResultado, 'resultado')}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600"
          >
            {copiedResultado ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
          </button>
          <a
            href={generateWhatsAppShareLink(msgResultado)}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl bg-green-600 text-white hover:bg-green-700"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  )
}
