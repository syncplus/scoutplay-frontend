'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { usePartida } from '@/hooks/usePartida'
import { usePartidaStore } from '@/store/partida.store'
import TimerStrip from '@/components/partidas/TimerStrip'
import PlacarSection from '@/components/placar/PlacarSection'

export default function PartidaLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>()
  const pathname = usePathname()
  const router = useRouter()
  const { isLoading } = usePartida(id)
  const partida = usePartidaStore((s) => s.partida)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isRegistrar = pathname.includes('/registrar')
  const isDashboard = pathname.includes('/dashboard')

  return (
    <div>
      {/* Match nav */}
      <div className="bg-navy-900 px-4 py-3 flex items-center justify-between border-b border-white/10">
        <div>
          <p className="text-white text-sm font-medium">{partida?.jogador}</p>
          <p className="text-white/40 text-xs mt-0.5">
            vs {partida?.adversario || '—'} · {partida?.lado === 'esquerda' ? 'Esq' : 'Dir'}
          </p>
        </div>
        <Link
          href="/partidas"
          className="flex items-center gap-1 text-white/70 text-xs bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors"
        >
          <ChevronLeft size={12} />
          Partidas
        </Link>
      </div>

      {/* Timer */}
      {partida && <TimerStrip partidaId={id} status={partida.status} />}

      {/* Placar */}
      {partida && <PlacarSection partidaId={id} jogador={partida.jogador} adversario={partida.adversario} />}

      {/* Sub-tabs */}
      <div className="flex border-b border-gray-100 bg-white">
        <Link
          href={`/partidas/${id}/registrar`}
          className={`flex-1 py-3 text-center text-sm font-medium border-b-2 transition-colors ${
            isRegistrar
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Registrar ataques
        </Link>
        <Link
          href={`/partidas/${id}/dashboard`}
          className={`flex-1 py-3 text-center text-sm font-medium border-b-2 transition-colors ${
            isDashboard
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Dashboard
        </Link>
      </div>

      {/* Page content */}
      {children}
    </div>
  )
}
