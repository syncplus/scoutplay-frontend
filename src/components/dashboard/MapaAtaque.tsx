'use client'

import { useRef, useEffect } from 'react'
import { Ataque, QualidadeAtaque, TipoAtaque } from '@/types'

interface Props {
  ataques: Ataque[]
}

const QUAL_COLORS: Record<QualidadeAtaque, string> = {
  boa: '#22c55e',
  media: '#f97316',
  ruim: '#ef4444',
}

const TIPO_STROKE: Record<TipoAtaque, string> = {
  cabeca: '#3b82f6',
  shark: '#1f2937',
}

const ZONE_ABBR: Record<string, string> = {
  Z1:'PT', Z2:'PM', Z3:'DC',
  Z4:'PP', Z5:'PA', Z6:'DP',
  Z7:'LP', Z8:'MF', Z9:'DL',
}

// Z1=top-left, Z2=mid-left, Z3=bot-left  | Z4=top-mid ...  | Z7=top-right ...
// Layout: rows = depth (Z1,Z2,Z3 top→bot), cols = lateral (left→right)
// col 0 = Z1,Z2,Z3 | col 1 = Z4,Z5,Z6 | col 2 = Z7,Z8,Z9
const ZONE_COL: Record<string, number> = {
  Z1:0, Z2:0, Z3:0,
  Z4:1, Z5:1, Z6:1,
  Z7:2, Z8:2, Z9:2,
}
const ZONE_ROW: Record<string, number> = {
  Z1:0, Z4:0, Z7:0,
  Z2:1, Z5:1, Z8:1,
  Z3:2, Z6:2, Z9:2,
}

function zoneOpacity(count: number, max: number): number {
  if (count === 0) return 0
  return 0.15 + (count / max) * 0.65
}

export default function MapaAtaques({ ataques }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const zoneCounts = ataques.reduce<Record<string, number>>((acc, a) => {
    acc[a.zonaDestino] = (acc[a.zonaDestino] || 0) + 1
    return acc
  }, {})
  const maxCount = Math.max(1, ...Object.values(zoneCounts))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const NET_X1 = W * 0.475
    const NET_X2 = W * 0.505
    const RIGHT_W = W - NET_X2
    const colW = RIGHT_W / 3
    const rowH = H / 3

    ctx.clearRect(0, 0, W, H)

    // Left side background
    ctx.fillStyle = '#c8a96e'
    ctx.fillRect(0, 0, NET_X1, H)

    // Right side background
    ctx.fillStyle = '#c8a96e'
    ctx.fillRect(NET_X2, 0, RIGHT_W, H)

    // Net
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillRect(NET_X1, 0, NET_X2 - NET_X1, H)

    // Left grid lines (depth reference)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 0.5
    ctx.setLineDash([4, 3])
    for (let i = 1; i < 3; i++) {
      ctx.beginPath()
      ctx.moveTo(0, rowH * i)
      ctx.lineTo(NET_X1, rowH * i)
      ctx.stroke()
    }
    ctx.setLineDash([])

    // Right grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.lineWidth = 0.5
    for (let r = 1; r < 3; r++) {
      ctx.beginPath()
      ctx.moveTo(NET_X2, rowH * r); ctx.lineTo(W, rowH * r); ctx.stroke()
    }
    for (let c = 1; c < 3; c++) {
      ctx.beginPath()
      ctx.moveTo(NET_X2 + colW * c, 0); ctx.lineTo(NET_X2 + colW * c, H); ctx.stroke()
    }

    // Zone heat + labels
    const allZones = ['Z1','Z2','Z3','Z4','Z5','Z6','Z7','Z8','Z9']
    allZones.forEach(zone => {
      const col = ZONE_COL[zone]
      const row = ZONE_ROW[zone]
      const x = NET_X2 + col * colW
      const y = row * rowH
      const count = zoneCounts[zone] || 0

      // Heat fill
      const opacity = zoneOpacity(count, maxCount)
      if (opacity > 0) {
        ctx.fillStyle = `rgba(220, 38, 38, ${opacity})`
        ctx.fillRect(x, y, colW, rowH)
      }

      const cx = x + colW / 2

      // Zone code
      ctx.font = 'bold 8px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.textAlign = 'center'
      ctx.fillText(zone, cx, y + 11)

      // Abbreviation
      ctx.font = '7px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.fillText(ZONE_ABBR[zone], cx, y + 20)

      // Count
      if (count > 0) {
        ctx.font = `bold ${count > 9 ? 11 : 13}px sans-serif`
        ctx.fillStyle = 'white'
        ctx.fillText(`${count}x`, cx, y + rowH / 2 + 6)
      }
    })

    // Left label "FUNDO"
    ctx.save()
    ctx.translate(8, H / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.font = '7px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.textAlign = 'center'
    ctx.fillText('FUNDO', 0, 0)
    ctx.restore()

    // ── Arrows
    ataques.forEach(a => {
      const ox = (a.posicaoX / 100) * NET_X1
      const oy = (a.posicaoY / 100) * H

      const col = ZONE_COL[a.zonaDestino]
      const row = ZONE_ROW[a.zonaDestino]
      const dx = NET_X2 + col * colW + colW / 2
      const dy = row * rowH + rowH / 2

      const lineColor = TIPO_STROKE[a.tipo]
      const dotColor = QUAL_COLORS[a.qualidade]

      // Line
      ctx.beginPath()
      ctx.moveTo(ox, oy)
      ctx.lineTo(dx, dy)
      ctx.strokeStyle = lineColor
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.5
      ctx.stroke()
      ctx.globalAlpha = 1

      // Arrowhead
      const angle = Math.atan2(dy - oy, dx - ox)
      const hl = 6
      ctx.beginPath()
      ctx.moveTo(dx, dy)
      ctx.lineTo(dx - hl * Math.cos(angle - Math.PI / 6), dy - hl * Math.sin(angle - Math.PI / 6))
      ctx.lineTo(dx - hl * Math.cos(angle + Math.PI / 6), dy - hl * Math.sin(angle + Math.PI / 6))
      ctx.closePath()
      ctx.fillStyle = lineColor
      ctx.globalAlpha = 0.65
      ctx.fill()
      ctx.globalAlpha = 1

      // Origin dot
      ctx.beginPath()
      ctx.arc(ox, oy, 5, 0, Math.PI * 2)
      ctx.fillStyle = dotColor
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Destination dot
      ctx.beginPath()
      ctx.arc(dx, dy, 4, 0, Math.PI * 2)
      ctx.fillStyle = dotColor
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'
      ctx.lineWidth = 1
      ctx.stroke()
    })
  }, [ataques, zoneCounts, maxCount])

  if (ataques.length === 0) return null

  return (
    <div className="card px-4 py-3">
      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">
        Mapa de ataques
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-3 text-[10px] text-gray-500 items-center">
        <div className="flex items-center gap-1">
          <span className="inline-block w-5 h-[2px] bg-blue-500 rounded" />
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          Cabeça
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-5 h-[2px] bg-gray-800 rounded" />
          <span className="w-2 h-2 rounded-full bg-gray-800 inline-block" />
          Shark
        </div>
        <span className="text-gray-200">·</span>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          Boa
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
          Média
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          Ruim
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={220}
        className="w-full rounded-lg"
        style={{ border: '2px solid #a07840' }}
      />
    </div>
  )
}
