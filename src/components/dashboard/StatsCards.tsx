'use client'

import { PartidaStats } from '@/types'
import { getZonaLabel } from '@/lib/utils'

export function StatsCards({ stats }: { stats: PartidaStats }) {
  const items = [
    { label: 'Total', value: stats.totalAtaques, color: 'text-blue-600' },
    { label: 'Boas', value: stats.totalBoas, color: 'text-green-600' },
    { label: 'Médias', value: stats.totalMedias, color: 'text-orange-500' },
    { label: 'Ruins', value: stats.totalRuins, color: 'text-red-600' },
    { label: 'Cabeça', value: stats.totalCabeca, color: 'text-cyan-600' },
    { label: 'Shark', value: stats.totalShark, color: 'text-purple-600' },
  ]
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <div key={item.label} className="card p-3 text-center">
          <p className={`text-xl font-medium ${item.color}`}>{item.value}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{item.label}</p>
        </div>
      ))}
    </div>
  )
}

interface BarProps {
  profundidade: PartidaStats['distribuicaoProfundidade']
  qualidade: PartidaStats['distribuicaoQualidade']
  tipo: PartidaStats['distribuicaoTipo']
  total: number
}

function BarRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs text-gray-700 w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-gray-400 w-8 text-right">{pct}%</span>
    </div>
  )
}

export function DistribuicaoBars({ profundidade, qualidade, tipo, total }: BarProps) {
  return (
    <div className="space-y-3">
      <div className="card px-4 py-3">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">Distribuição por profundidade</p>
        <BarRow label="Frente (1-3)" value={profundidade.frente} total={total} color="bg-red-400" />
        <BarRow label="Meio (4-6)" value={profundidade.meio} total={total} color="bg-orange-400" />
        <BarRow label="Fundo (7-9)" value={profundidade.fundo} total={total} color="bg-green-500" />
      </div>
      <div className="card px-4 py-3">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">Distribuição por qualidade</p>
        <BarRow label="Boa" value={qualidade.boa} total={total} color="bg-green-500" />
        <BarRow label="Média" value={qualidade.media} total={total} color="bg-orange-500" />
        <BarRow label="Ruim" value={qualidade.ruim} total={total} color="bg-red-500" />
      </div>
      <div className="card px-4 py-3">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">Distribuição por tipo</p>
        <BarRow label="Cabeça" value={tipo.cabeca} total={total} color="bg-cyan-500" />
        <BarRow label="Shark" value={tipo.shark} total={total} color="bg-purple-500" />
      </div>
    </div>
  )
}

interface ZonaTableProps {
  zonas: PartidaStats['detalheZonas']
  zonaPreferida: PartidaStats['zonaPreferida']
}

export function ZonaTable({ zonas, zonaPreferida }: ZonaTableProps) {
  return (
    <div className="card px-4 py-3">
      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">Detalhamento por zona</p>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left text-[10px] text-gray-400 font-medium pb-2">Zona</th>
            <th className="text-right text-[10px] text-gray-400 font-medium pb-2">Ataques</th>
            <th className="text-right text-[10px] text-gray-400 font-medium pb-2">%</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {zonas.map((z) => (
            <tr key={z.zona}>
              <td className="py-2 text-xs text-gray-800">
                {z.zona} — {z.label.split('(')[0].trim()}
                {z.zona === zonaPreferida && (
                  <span className="ml-1.5 text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                    preferida
                  </span>
                )}
              </td>
              <td className="py-2 text-right text-xs font-medium text-gray-700">{z.total}</td>
              <td className="py-2 text-right text-[10px] text-gray-400">{z.percentual.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function StatsCards2({ stats }: { stats: PartidaStats }) {
  return <StatsCards stats={stats} />
}
