'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wrench, GraduationCap, ExternalLink, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/ferramentas', label: 'Ferramentas', icon: Wrench },
  { href: '/treinamento', label: 'Treinar', icon: GraduationCap },
  { href: '/links', label: 'Links', icon: ExternalLink },
  { href: '/perfil', label: 'Perfil', icon: User },
]

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around h-16 pb-safe">
        {tabs.map((tab) => {
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          return (
            <Link key={tab.href} href={tab.href}
              className={cn('flex flex-col items-center gap-0.5 px-3 py-1 min-w-[60px]', isActive ? 'text-pharos-blue' : 'text-gray-400')}>
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
