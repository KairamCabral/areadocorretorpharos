export default function OpenHouseResultadoPage({ params }: { params: { token: string } }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto p-4 lg:p-8">
        <header className="text-center py-8">
          <h1 className="text-xl font-bold text-gray-900">Relatório Open House</h1>
        </header>
        <p className="text-gray-400 text-center">Token: {params.token}</p>
      </div>
    </div>
  )
}
