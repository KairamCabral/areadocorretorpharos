import { NetflixHero } from '@/components/treinamento/NetflixHero'
import { NetflixCarousel } from '@/components/treinamento/NetflixCarousel'
import { TREINAMENTO_CATEGORIAS } from '@/lib/constants'

export default function TreinamentoPage() {
  return (
    <div className="-m-4 lg:-m-6 min-h-screen bg-pharos-dark">
      <NetflixHero />
      <div className="space-y-8 px-4 lg:px-8 pb-8 -mt-16 relative z-10">
        {TREINAMENTO_CATEGORIAS.map((cat) => (
          <NetflixCarousel key={cat.slug} titulo={cat.nome} slug={cat.slug} cor={cat.cor} />
        ))}
        <NetflixCarousel titulo="Continue de onde parou" slug="continuar" cor="#C9A84C" />
      </div>
    </div>
  )
}
