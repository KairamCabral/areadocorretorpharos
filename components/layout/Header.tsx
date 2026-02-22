'use client'
import { useAuth } from '@/hooks/use-auth'
import { getInitials } from '@/lib/utils'
import { Bell, LogOut } from 'lucide-react'

export function Header() {
  const { profile, signOut } = useAuth()
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 h-16 flex items-center justify-between px-4 lg:px-6">
      <div className="lg:hidden">
        <div className="w-8 h-8 bg-pharos-blue rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">P</span>
        </div>
      </div>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 relative">
          <Bell className="w-5 h-5 text-gray-500" />
        </button>
        {profile && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pharos-blue rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">{getInitials(profile.nome)}</span>
            </div>
            <span className="hidden lg:block text-sm font-medium text-gray-700">{profile.nome.split(' ')[0]}</span>
            <button onClick={signOut} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
              <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
