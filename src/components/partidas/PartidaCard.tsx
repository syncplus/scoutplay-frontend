'use client'

import { useRouter } from 'next/navigation'
import { ExternalLink, Trash2 } from 'lucide-react'
import { Partida } from '@/types'
import { cn, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'

interface Props {
  partida: Partida
  onDelete: (id: string) => void
}

export default function PartidaCard({ partida, onDelete }: Props) {
  const router = useRouter()
  const colors = getStatusColor(partida.status)

  function handleOpen() {
    router.push(`/partidas/${partida.id}/registrar`)
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (confirm('Excluir esta partida?')) onDelete(partida.id)
  }

  return (
    <div className="card overflow-hidden hover:border-gray-200 transition-colors">
      {/* Status stripe */}
      <div className={cn('h-1', colors.stripe)} />

      {/* Progress bar for in-progress */}
      {partida.status === 'em_progresso' && (
        <div className="h-0.5 bg-gray-100">
          <div className="h-full bg-green-500 w-1/2" />
        </div>
      )}

      {/* Card top */}
      <div className="px-4 pt-3 pb-2.5 border-b border-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-medium',
              colors.pill
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
            {getStatusLabel(partida.status)}
          </span>
          <span className="text-[10px] text-gray-400 font-mono">
            {partida.tempoTotal ? `${Math.floor(partida.tempoTotal / 60)}:${String(partida.tempoTotal % 60).padStart(2, '0')}` : '00:00'}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-900">{partida.jogador}</p>
        {partida.adversario && (
          <p className="text-xs text-gray-400 mt-0.5">vs {partida.adversario}</p>
        )}
      </div>

      {/* Card bottom */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex gap-1.5">
          <span className={cn(
            'text-[10px] px-2 py-0.5 rounded-full font-medium',
            partida.lado === 'esquerda'
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-pink-100 text-pink-700'
          )}>
            {partida.lado === 'esquerda' ? 'Esq' : 'Dir'}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            {formatDate(partida.data)}
          </span>
        </div>
        <div className="text-right">
          <p className="text-lg font-medium text-blue-600 leading-none">
            {partida.totalAtaques}
          </p>
          <p className="text-[9px] text-gray-400">ataques</p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={handleOpen}
          className="flex-1 bg-green-600 text-white text-xs font-medium py-2 px-3 
                     rounded-lg flex items-center justify-center gap-1.5 
                     hover:bg-green-700 active:scale-95 transition-all"
        >
          <ExternalLink size={12} />
          Abrir
        </button>
        <button
          onClick={handleDelete}
          className="w-10 bg-red-600 text-white rounded-lg flex items-center 
                     justify-center hover:bg-red-700 active:scale-95 transition-all self-stretch"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
