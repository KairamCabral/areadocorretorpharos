export default function AulaPage({ params }: { params: { categoria: string; aula: string } }) {
  return (
    <div className="-m-4 lg:-m-6 min-h-screen bg-pharos-dark text-white">
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <h1 className="text-xl font-bold">Aula</h1>
        <p className="text-white/50">Categoria: {params.categoria} | Aula: {params.aula}</p>
      </div>
    </div>
  )
}
