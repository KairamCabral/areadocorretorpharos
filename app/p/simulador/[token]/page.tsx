import { notFound } from 'next/navigation'

export default async function PublicPage({ params }: { params: { token: string } }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto p-4 lg:p-8">
        <header className="text-center py-8">
          <div className="w-12 h-12 bg-pharos-blue rounded-xl mx-auto mb-3 flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Pharos Negócios Imobiliários</h1>
        </header>
        <div className="bg-gray-50 rounded-2xl p-6 text-center">
          <p className="text-gray-500">Página pública: simulador</p>
          <p className="text-gray-400 text-sm mt-1">Token: {params.token}</p>
        </div>
      </div>
    </div>
  )
}
