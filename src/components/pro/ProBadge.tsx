'use client'

import { Sparkles } from 'lucide-react'

interface ProBadgeProps {
  size?: 'sm' | 'md'
}

export default function ProBadge({ size = 'sm' }: ProBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 bg-accent text-background font-bold font-sans rounded-full ${
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
    }`}>
      <Sparkles className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      PRO
    </span>
  )
}
