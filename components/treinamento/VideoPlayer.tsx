'use client'

import { useCallback, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { TreinamentoAula } from '@/types'

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

interface Props {
  aula: TreinamentoAula
  onWatched?: () => void | Promise<void>
}

export function VideoPlayer({ aula, onWatched }: Props) {
  const [watched, setWatched] = useState(false)
  const hasCalledWatched = useRef(false)

  const handleProgress = useCallback(
    (state: { played: number }) => {
      if (watched || hasCalledWatched.current) return
      if (state.played >= 0.9) {
        hasCalledWatched.current = true
        setWatched(true)
        onWatched?.()
      }
    },
    [onWatched, watched]
  )

  if (!aula.conteudo_url) return null

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      <ReactPlayer
        url={aula.conteudo_url}
        width="100%"
        height="100%"
        controls
        onProgress={handleProgress}
        config={{
          youtube: {
            playerVars: { modestbranding: 1, rel: 0 },
          },
          vimeo: {
            playerOptions: { title: true, byline: false },
          },
        }}
      />
    </div>
  )
}
