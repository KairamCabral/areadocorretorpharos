import { createServerSupabase } from '@/lib/supabase/server'
import {
  LayoutDashboard,
  HardDrive,
  MessageCircle,
  Search,
  Globe,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react'
import type { LinkUtil } from '@/types'

const ICONE_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  HardDrive,
  MessageCircle,
  Search,
  Globe,
  ExternalLink,
}

function getIcon(icone: string | null): LucideIcon {
  if (!icone) return ExternalLink
  return ICONE_MAP[icone] ?? ExternalLink
}

export default async function LinksPage() {
  const supabase = await createServerSupabase()
  const { data: links } = await supabase
    .from('links_uteis')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })

  const items = (links ?? []) as LinkUtil[]

  const byCategoria = items.reduce<Record<string, LinkUtil[]>>((acc, link) => {
    const cat = link.categoria ?? 'Outros'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(link)
    return acc
  }, {})

  const categorias = Object.keys(byCategoria).sort()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Links Úteis</h1>
        <p className="text-gray-500 mt-0.5">Acesso rápido às ferramentas e portais</p>
      </div>

      {categorias.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
          <p className="text-gray-500">Nenhum link disponível no momento.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categorias.map((categoria) => (
            <section key={categoria}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {categoria}
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                {byCategoria[categoria].map((link) => {
                  const Icon = getIcon(link.icone)
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[48px] flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-pharos-blue/20 transition group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-pharos-blue/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-pharos-blue" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-gray-900 group-hover:text-pharos-blue transition block truncate">
                          {link.titulo}
                        </span>
                        {link.descricao && (
                          <span className="text-xs text-gray-500 truncate block">
                            {link.descricao}
                          </span>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </a>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
