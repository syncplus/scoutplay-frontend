// ─── StatusTabs ──────────────────────────────────────────────────────────────
'use client'

interface Option { label: string; value: string }
interface Props {
  options: Option[]
  active: string
  counts: Record<string, number>
  onChange: (v: string) => void
}

export default function StatusTabs({ options, active, counts, onChange }: Props) {
  const countColors: Record<string, string> = {
    all: 'bg-white/20 text-white',
    aguardando: 'bg-amber-100 text-amber-800',
    em_progresso: 'bg-green-100 text-green-800',
    finalizada: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            active === opt.value
              ? 'bg-gray-900 text-white'
              : 'bg-white border border-gray-100 text-gray-500 hover:border-gray-200'
          }`}
        >
          {opt.label}
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              active === opt.value
                ? countColors[opt.value] || 'bg-white/20 text-white'
                : countColors[opt.value] || 'bg-gray-100 text-gray-500'
            }`}
          >
            {counts[opt.value] ?? 0}
          </span>
        </button>
      ))}
    </div>
  )
}
