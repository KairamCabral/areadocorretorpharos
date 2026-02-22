export const dynamic = 'force-dynamic'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pharos-dark via-pharos-blue to-pharos-dark p-4">
      {children}
    </div>
  )
}
