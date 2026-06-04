'use client'

import { mediaUrl } from '@/lib/api'

export function Avatar({ name, photo, size = 28 }: { name?: string | null; photo?: string | null; size?: number }) {
  const initials = (name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const url = mediaUrl(photo)
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name || ''} className="rounded-full object-cover border border-white/10" style={{ width: size, height: size }} />
  }
  return (
    <div className="rounded-full bg-[#F0A500]/20 flex items-center justify-center text-[#F0A500] font-medium"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}>
      {initials}
    </div>
  )
}
