'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useUIStore } from '@/store/ui'
import { Avatar } from './Avatar'
import { RoleBadge } from './RoleBadge'

function Item({ label, active, onClick, icon }: { label: string; active?: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? 'bg-[#F0A500]/15 text-[#F0A500]' : 'text-white/70 hover:bg-white/8 hover:text-white'}`}>
      <span className="flex-shrink-0">{icon}</span>
      {label}
    </button>
  )
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const isAdmin = user?.role === 'admin'
  const pedirNovaPartida = useUIStore((s) => s.pedirNovaPartida)

  function go(path: string) { onClose(); router.push(path) }

  function handleLogout() {
    onClose()
    logout()
    router.replace('/auth/login')
  }

  function novaPartida() {
    onClose()
    pedirNovaPartida()
    router.push('/partidas')
  }

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-[#0b1120] border-r border-white/8 shadow-[8px_0_40px_rgba(0,0,0,0.7)] transition-transform duration-200 flex flex-col ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-[50px] flex items-center justify-between px-4 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <img src="/images/logo.png" alt="ScoutPlay" className="h-7 w-auto" />
            <p className="text-white text-sm font-medium">ScoutPlay</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/8 text-white/50 hover:bg-white/15 transition-colors text-lg leading-none">×</button>
        </div>

        <div className="px-3 py-4 flex-1 overflow-y-auto">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-wider text-white/30 px-3 mb-1.5">Jogos</p>
            <Item label="Partidas" active={pathname==='/partidas'} onClick={()=>go('/partidas')}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 2v4M16 2v4"/></svg>} />
            <Item label="Nova Partida" onClick={novaPartida}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>} />
          </div>

          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-wider text-white/30 px-3 mb-1.5">Administração</p>
            {isAdmin && (
              <Item label="Usuários" active={pathname==='/usuarios'} onClick={()=>go('/usuarios')}
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
            )}
            <Item label="Meu Perfil" active={pathname==='/perfil'} onClick={()=>go('/perfil')}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
          </div>
        </div>

        <div className="border-t border-white/8 px-3 py-3">
          <div className="flex items-center gap-2.5 px-1 mb-2">
            <Avatar name={user?.name} photo={user?.photo} size={32} />
            <div className="min-w-0 flex items-center gap-1.5">
              <p className="text-white/80 text-xs font-medium truncate">{user?.name}</p>
              <RoleBadge role={user?.role} />
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-300/80 hover:bg-red-900/20 hover:text-red-300 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
