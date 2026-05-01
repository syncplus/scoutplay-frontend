'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

export default function Navbar() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  async function handleLogout() {
    await logout()
    router.push('/auth/login')
  }

  return (
    <nav className="bg-navy-900 px-4 h-[50px] flex items-center justify-between border-b border-white/8">
      <div className="flex items-center gap-2.5">
        <img src="/logo.png" alt="ScoutPlay" className="h-7 w-auto" />
        <div>
          <Link href="/partidas" className="text-white text-sm font-medium">
            ScoutPlay
          </Link>
          <p className="text-white/35 text-[10px]">Futevôlei · análise de ataques</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user?.role === 'admin' && (
          <Link
            href="/dashboard"
            className="text-white/50 hover:text-white text-xs transition-colors"
          >
            Admin
          </Link>
        )}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-800 flex items-center justify-center text-blue-200 text-[10px] font-medium">
            {user?.name?.slice(0, 2).toUpperCase() ?? 'TC'}
          </div>
          <span className="text-white/60 text-xs">{user?.name ?? 'Usuário'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-white/30 hover:text-white/70 transition-colors"
        >
          <LogOut size={14} />
        </button>
      </div>
    </nav>
  )
}
