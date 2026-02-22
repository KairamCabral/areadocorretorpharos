export default function Page({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Ferramentas Open-House Detalhes</h1>
      <p className="text-gray-500">ID: {params.id}</p>
    </div>
  )
}
