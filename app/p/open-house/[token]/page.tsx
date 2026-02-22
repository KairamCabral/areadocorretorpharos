export default function OpenHouseFormPage({ params }: { params: { token: string } }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto p-4">
        <header className="text-center py-6">
          <h1 className="text-xl font-bold text-gray-900">Open House</h1>
          <p className="text-gray-500 text-sm">Formulário de avaliação</p>
        </header>
        <p className="text-gray-400 text-center">Token: {params.token}</p>
      </div>
    </div>
  )
}
