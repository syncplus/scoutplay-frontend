'use client'

import { Ataque, ZonaDestino } from '@/types'
import { cn } from '@/lib/utils'

const ZONES: { code: ZonaDestino; abbr: string }[] = [
  { code: 'Z1', abbr: 'PT' }, { code: 'Z2', abbr: 'PM' }, { code: 'Z3', abbr: 'DC' },
  { code: 'Z4', abbr: 'PP' }, { code: 'Z5', abbr: 'PA' }, { code: 'Z6', abbr: 'DP' },
  { code: 'Z7', abbr: 'LP' }, { code: 'Z8', abbr: 'MF' }, { code: 'Z9', abbr: 'DL' },
]

interface Props {
  zonaSelecionada: ZonaDestino | null
  ataques: Ataque[]
  onZoneSelect: (z: ZonaDestino) => void
}

export default function ZoneGrid({ zonaSelecionada, ataques, onZoneSelect }: Props) {
  const countByZone = ataques.reduce<Record<string, number>>((acc, a) => {
    acc[a.zonaDestino] = (acc[a.zonaDestino] || 0) + 1
    return acc
  }, {})

  return (
    <div className="bg-court-sand p-1.5">
      <div className="grid grid-cols-3 gap-0.5 h-full">
        {ZONES.map(({ code, abbr }) => {
          const count = countByZone[code] || 0
          const isSelected = zonaSelecionada === code
          const hasHits = count > 0

          return (
            <button
              key={code}
              onClick={() => onZoneSelect(code)}
              className={cn(
                'rounded flex flex-col items-center justify-center min-h-[46px] border-[1.5px] transition-all py-1',
                isSelected
                  ? 'bg-red-600/75 border-red-500'
                  : hasHits
                  ? 'bg-green-600/55 border-transparent hover:bg-green-600/70'
                  : 'bg-white/22 border-transparent hover:bg-white/40'
              )}
            >
              <span className="text-[9px] text-white/90 font-semibold leading-none">{code}</span>
              <span className="text-[8px] text-white/70 leading-none mt-0.5">{abbr}</span>
              {count > 0 && (
                <span className="text-[13px] text-white font-medium leading-none mt-0.5">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
