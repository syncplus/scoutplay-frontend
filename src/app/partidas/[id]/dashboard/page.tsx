'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PartidaStats } from '@/types'
import { partidasService } from '@/services/partidas.service'
import StatsCards from '@/components/dashboard/StatsCards'
import DistribuicaoBars from '@/components/dashboard/DistribuicaoBars'
import ZonaTable from '@/components/dashboard/ZonaTable'
import MapaAtaques from '@/components/dashboard/MapaAtaques'
import { usePartidaStore } from '@/store/partida.store'

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>()
  const ataques = usePartidaStore((s) => s.ataques)
  const [stats, setStats] = useState<PartidaStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    partidasService.stats(id).then((s) => {
      setStats(s)
      setIsLoading(false)
    })
  }, [id, ataques.length])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats || stats.totalAtaques === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-400 text-sm">
        Nenhum ataque registrado ainda.
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <StatsCards stats={stats} />
      <MapaAtaques ataques={stats.ataques} />
      <DistribuicaoBars
        profundidade={stats.distribuicaoProfundidade}
        qualidade={stats.distribuicaoQualidade}
        tipo={stats.distribuicaoTipo}
        total={stats.totalAtaques}
      />
      <ZonaTable zonas={stats.detalheZonas} zonaPreferida={stats.zonaPreferida} />
    </div>
  )
}
