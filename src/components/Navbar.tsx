'use client'

import { useAuthStore } from '@/store/auth'
import { Avatar } from './Avatar'
import { RoleBadge } from './RoleBadge'

export function Navbar({ onMenu, onBack, title, sub }: { onMenu?: () => void; onBack?: () => void; title?: string; sub?: string }) {
  const user = useAuthStore((s) => s.user)

  return (
    <nav className="h-[50px] bg-[#080c14] flex items-center justify-between px-4 shadow-[0_1px_0_rgba(255,255,255,0.04),0_4px_16px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-2.5">
        {onMenu && !onBack && (
          <button onClick={onMenu} className="text-white/60 hover:text-white transition-colors p-1 -ml-1" aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
        )}
        <img src="/images/logo.png" alt="ScoutPlay" className="h-7 w-auto flex-shrink-0" />
        <div>
          {title
            ? <><p className="text-white text-sm font-medium leading-tight">{title}</p>
                <p className="text-white/40 text-[10px]">{sub}</p></>
            : <><p className="text-white text-sm font-medium">ScoutPlay</p>
                <p className="text-white/35 text-[10px]">Futevôlei - Analise · Estratégia · Evolução</p></>
          }
        </div>
      </div>
      {onBack ? (
        <button onClick={onBack} className="flex items-center gap-1 bg-white/8 text-white/70 text-xs px-3 py-1.5 rounded-lg hover:bg-white/15 transition-colors">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 2L4 6l4 4"/></svg>
          Partidas
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <Avatar name={user?.name} photo={user?.photo} size={28} />
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-white/80 text-xs font-medium truncate max-w-[140px]">{user?.name}</span>
            <RoleBadge role={user?.role} />
          </div>
        </div>
      )}
    </nav>
  )
}
