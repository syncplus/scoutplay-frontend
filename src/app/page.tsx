'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

export default function RootPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)

  useEffect(() => {
    if (!hasHydrated) return
    router.replace(user ? '/partidas' : '/auth/login')
  }, [hasHydrated, user, router])

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#F0A500] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
