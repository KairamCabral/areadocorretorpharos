'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { ROLES } from '@/lib/constants'
import type { Profile } from '@/types'
import { Search, Loader2 } from 'lucide-react'
import * as Switch from '@radix-ui/react-switch'
import * as Select from '@radix-ui/react-select'

const ROLE_LABELS: Record<string, string> = {
  master: 'Master',
  gerente: 'Gerente',
  assistente: 'Assistente',
  corretor: 'Corretor',
}

const ROLE_COLORS: Record<string, string> = {
  master: 'bg-amber-100 text-amber-800',
  gerente: 'bg-pharos-blue/10 text-pharos-blue',
  assistente: 'bg-violet-100 text-violet-800',
  corretor: 'bg-gray-100 text-gray-700',
}

interface CorretoresTableProps {
  profiles: Profile[]
}

export function CorretoresTable({ profiles }: CorretoresTableProps) {
  const router = useRouter()
  const supabase = createClient()
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return profiles
    const q = search.toLowerCase()
    return profiles.filter(
      (p) =>
        p.nome.toLowerCase().includes(q) ||
        (p.telefone ?? '').toLowerCase().includes(q)
    )
  }, [profiles, search])

  const handleRoleChange = async (id: string, role: string) => {
    setUpdating(id)
    // @ts-expect-error - Supabase types may restrict profiles update
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
    setUpdating(null)
    if (error) {
      console.error(error)
      return
    }
    router.refresh()
  }

  const handleAtivoChange = async (id: string, ativo: boolean) => {
    setUpdating(id)
    // @ts-expect-error - Supabase types may restrict profiles update
    const { error } = await supabase.from('profiles').update({ ativo }).eq('id', id)
    setUpdating(null)
    if (error) {
      console.error(error)
      return
    }
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue min-h-[48px]"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nome</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Telefone</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Função</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Ativo</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-3 px-4 font-medium text-gray-900">{p.nome}</td>
                <td className="py-3 px-4 text-gray-600">{p.telefone}</td>
                <td className="py-3 px-4">
                  <Select.Root
                    value={p.role ?? ROLES.CORRETOR}
                    onValueChange={(v) => handleRoleChange(p.id, v)}
                    disabled={updating === p.id}
                  >
                    <Select.Trigger
                      className="min-h-[48px] inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                      aria-label="Alterar função"
                    >
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          ROLE_COLORS[p.role ?? 'corretor'] ?? ROLE_COLORS.corretor
                        }`}
                      >
                        {ROLE_LABELS[p.role ?? 'corretor'] ?? 'Corretor'}
                      </span>
                      <Select.Icon />
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content
                        className="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-lg z-50"
                        position="popper"
                      >
                        {Object.entries(ROLE_LABELS).map(([value, label]) => (
                          <Select.Item
                            key={value}
                            value={value}
                            className="flex items-center px-4 py-3 cursor-pointer outline-none hover:bg-pharos-blue/5 data-[highlighted]:bg-pharos-blue/5 min-h-[48px]"
                          >
                            <Select.ItemText>{label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {updating === p.id ? (
                      <Loader2 className="w-5 h-5 animate-spin text-pharos-blue" />
                    ) : (
                      <Switch.Root
                        checked={p.ativo ?? true}
                        onCheckedChange={(checked) => handleAtivoChange(p.id, checked)}
                        className="w-11 h-6 rounded-full bg-gray-200 data-[state=checked]:bg-pharos-blue transition-colors relative"
                        aria-label="Ativo"
                      >
                        <Switch.Thumb className="block w-5 h-5 rounded-full bg-white shadow transition-transform translate-x-0.5 data-[state=checked]:translate-x-6" />
                      </Switch.Root>
                    )}
                    <span className="text-sm text-gray-500">
                      {p.ativo ?? true ? 'Sim' : 'Não'}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {p.created_at ? formatDate(p.created_at) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          {search ? 'Nenhum corretor encontrado.' : 'Nenhum corretor cadastrado.'}
        </div>
      )}
    </div>
  )
}
