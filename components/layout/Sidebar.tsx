'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wrench, GraduationCap, ExternalLink, User, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/ferramentas', label: 'Ferramentas', icon: Wrench },
  { href: '/treinamento', label: 'Treinamento', icon: GraduationCap },
  { href: '/links', label: 'Links Úteis', icon: ExternalLink },
  { href: '/perfil', label: 'Meu Perfil', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-white border-r border-gray-200">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-100">
        <div className="w-8 h-8 bg-pharos-blue rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        <span className="font-bold text-gray-900">Pharos Corretor</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition',
                isActive ? 'bg-pharos-blue-light text-pharos-blue' : 'text-gray-600 hover:bg-gray-50')}>
              <item.icon className="w-5 h-5" />{item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-4 border-t border-gray-100">
        <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50">
          <Shield className="w-5 h-5" />Admin
        </Link>
      </div>
    </aside>
  )
}
