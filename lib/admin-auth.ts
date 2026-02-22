import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { createAdminSupabase } from '@/lib/supabase/server'

export type AdminProfile = {
  id: string
  nome: string
  role: string | null
}

/**
 * Verifica se o usuário está logado e é admin (master ou gerente).
 * Redireciona para /login se não logado, ou mostra acesso negado se não for admin.
 */
export async function requireAdmin(): Promise<AdminProfile> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminSupabase = await createAdminSupabase()
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('id, nome, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  const isAdmin = profile.role === 'master' || profile.role === 'gerente'
  if (!isAdmin) {
    redirect('/')
  }

  return profile as AdminProfile
}
