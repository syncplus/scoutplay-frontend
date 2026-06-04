'use client'

import { useEffect } from 'react'

export function Toast({ message, onDone, variant = 'error' }: { message: string | null; onDone: () => void; variant?: 'error' | 'success' }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [message, onDone])
  if (!message) return null
  const cls = variant === 'success'
    ? 'bg-green-900/90 text-green-100 border-green-700/50'
    : 'bg-red-900/90 text-red-100 border-red-700/50'
  return (
    <div className={`fixed top-3 left-1/2 -translate-x-1/2 z-[70] ${cls} text-xs px-4 py-2 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.7)] border`}>
      {message}
    </div>
  )
}
