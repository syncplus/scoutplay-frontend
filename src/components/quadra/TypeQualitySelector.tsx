'use client'

import { QualidadeAtaque, TipoAtaque } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  tipo: TipoAtaque
  qualidade: QualidadeAtaque
  onTipoChange: (t: TipoAtaque) => void
  onQualidadeChange: (q: QualidadeAtaque) => void
}

export default function TypeQualitySelector({
  tipo, qualidade, onTipoChange, onQualidadeChange,
}: Props) {
  return (
    <div className="card p-3 flex gap-4">
      <div className="flex-1">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Tipo</p>
        <div className="flex gap-1.5">
          {(['cabeca', 'shark'] as TipoAtaque[]).map((t) => (
            <button
              key={t}
              onClick={() => onTipoChange(t)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border',
                tipo === t
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200'
              )}
            >
              {t === 'cabeca' ? 'Cabeça' : 'Shark'}
            </button>
          ))}
        </div>
      </div>
      <div className="w-px bg-gray-100" />
      <div className="flex-1">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Qualidade</p>
        <div className="flex gap-1.5">
          {(['boa', 'media', 'ruim'] as QualidadeAtaque[]).map((q) => {
            const active = qualidade === q
            const colors = {
              boa: active ? 'bg-green-600 text-white border-green-600' : '',
              media: active ? 'bg-orange-500 text-white border-orange-500' : '',
              ruim: active ? 'bg-red-600 text-white border-red-600' : '',
            }
            return (
              <button
                key={q}
                onClick={() => onQualidadeChange(q)}
                className={cn(
                  'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border',
                  colors[q] || 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200'
                )}
              >
                {q === 'boa' ? 'Boa' : q === 'media' ? 'Média' : 'Ruim'}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
