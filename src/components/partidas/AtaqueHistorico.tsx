'use client'

import { Ataque } from '@/types'
import { cn } from '@/lib/utils'

const DOT: Record<string, string> = {
  boa: 'bg-green-500',
  media: 'bg-orange-500',
  ruim: 'bg-red-500',
}
const BADGE: Record<string, string> = {
  cabeca: 'bg-blue-100 text-blue-700',
  shark: 'bg-pink-100 text-pink-700',
}
const LABELS = { cabeca: 'Cabeça', shark: 'Shark', boa: 'Boa', media: 'Média', ruim: 'Ruim' }

export default function AtaqueHistorico({ ataques }: { ataques: Ataque[] }) {
  return (
    <div className="card px-4 py-3">
      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2 font-medium">
        Histórico de ataques
      </p>
      <div className="divide-y divide-gray-50">
        {ataques.map((a) => (
          <div key={a.id} className="flex items-center gap-2 py-2">
            <div className={cn('w-2 h-2 rounded-full flex-shrink-0', DOT[a.qualidade])} />
            <span className="text-xs text-gray-700 flex-1">
              {LABELS[a.tipo]} · {LABELS[a.qualidade]}
            </span>
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded', BADGE[a.tipo])}>
              {LABELS[a.tipo]}
            </span>
            <span className="text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded font-mono">
              {a.posicaoX}%,{a.posicaoY}%
            </span>
            <span className="text-[10px] text-gray-400">{a.zonaDestino}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
