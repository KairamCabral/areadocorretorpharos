'use client'
import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props { value: number; onChange?: (v: number) => void; size?: 'sm' | 'md' | 'lg'; readonly?: boolean }

export function StarRating({ value, onChange, size = 'md', readonly = false }: Props) {
  const [hover, setHover] = useState(0)
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" disabled={readonly} onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)} onMouseLeave={() => setHover(0)}
          className={cn('transition', !readonly && 'cursor-pointer hover:scale-110')}>
          <Star className={cn(sizes[size], (hover || value) >= star ? 'fill-pharos-gold text-pharos-gold' : 'text-gray-300')} />
        </button>
      ))}
    </div>
  )
}
