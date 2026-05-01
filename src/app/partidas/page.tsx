'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Partida, PartidaStatus } from '@/types'
import { partidasService } from '@/services/partidas.service'
import PartidaCard from '@/components/partidas/PartidaCard'
import ModalNovaPartida from '@/components/partidas/ModalNovaPartida'
import StatusTabs from '@/components/partidas/StatusTabs'

const STATUS_OPTIONS: { label: string; value: PartidaStatus | 'all' }[] = [
  { label: 'Tudo', value: 'all' },
  { label: 'Aguardando', value: 'aguardando' },
  { label: 'Em progresso', value: 'em_progresso' },
  { label: 'Finalizada', value: 'finalizada' },
]

export default function PartidasPage() {
  const [partidas, setPartidas] = useState<Partida[]>([])
  const [filtro, setFiltro] = useState<PartidaStatus | 'all'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  async function loadPartidas() {
    setIsLoading(true)
    try {
      const res = await partidasService.list(
        filtro !== 'all' ? { status: filtro } : undefined
      )
      setPartidas(res.data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadPartidas() }, [filtro])

  async function handleDelete(id: string) {
    await partidasService.delete(id)
    setPartidas((p) => p.filter((x) => x.id !== id))
  }

  const counts = {
    all: partidas.length,
    aguardando: partidas.filter((p) => p.status === 'aguardando').length,
    em_progresso: partidas.filter((p) => p.status === 'em_progresso').length,
    finalizada: partidas.filter((p) => p.status === 'finalizada').length,
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-gray-900">Partidas</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary"
        >
          <Plus size={14} />
          Nova partida
        </button>
      </div>

      {/* Tabs */}
      <StatusTabs
        options={STATUS_OPTIONS}
        active={filtro}
        counts={counts}
        onChange={(v) => setFiltro(v as PartidaStatus | 'all')}
      />

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-52 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : partidas.length === 0 ? (
        <div className="mt-16 text-center text-gray-400 text-sm">
          Nenhuma partida encontrada.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {partidas.map((p) => (
            <PartidaCard key={p.id} partida={p} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Modal */}
      <ModalNovaPartida
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={(nova) => {
          setPartidas((prev) => [nova, ...prev])
          setModalOpen(false)
        }}
      />
    </div>
  )
}
