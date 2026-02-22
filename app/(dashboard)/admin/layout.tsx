import Link from 'next/link'
import { LayoutDashboard, Users, BookOpen, BarChart3, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { requireAdmin } from '@/lib/admin-auth'

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/corretores', label: 'Corretores', icon: Users },
  { href: '/admin/treinamento', label: 'Treinamento', icon: BookOpen },
  { href: '/admin/metricas', label: 'Métricas', icon: BarChart3 },
  { href: '/admin/gamificacao', label: 'Gamificação', icon: Trophy },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()
  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-2">
        {adminNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'min-h-[48px] flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition',
              'border border-gray-200 hover:border-pharos-blue/30 hover:bg-pharos-blue/5'
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  )
}
