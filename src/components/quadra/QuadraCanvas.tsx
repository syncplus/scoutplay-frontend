'use client'

import { useEffect, useRef } from 'react'
import { Ataque, QualidadeAtaque } from '@/types'

interface Props {
  ataques: Ataque[]
  posicaoAtual: { x: number; y: number } | null
  qualidadeAtual: QualidadeAtaque
  onPosicaoChange: (pos: { x: number; y: number }) => void
}

const QUAL_COLORS: Record<QualidadeAtaque, string> = {
  boa: '#22c55e',
  media: '#f97316',
  ruim: '#ef4444',
}

export default function QuadraCanvas({
  ataques,
  posicaoAtual,
  qualidadeAtual,
  onPosicaoChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    canvas.width = container.offsetWidth
    canvas.height = container.offsetHeight
    draw()
  }, [ataques, posicaoAtual])

  function draw() {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 0.5
    ctx.setLineDash([4, 4])
    for (let i = 1; i < 3; i++) {
      ctx.beginPath()
      ctx.moveTo(0, (canvas.height * i) / 3)
      ctx.lineTo(canvas.width, (canvas.height * i) / 3)
      ctx.stroke()
    }
    ctx.setLineDash([])

    // Past attacks
    ataques.forEach((a) => {
      const ax = (a.posicaoX / 100) * canvas.width
      const ay = (a.posicaoY / 100) * canvas.height
      ctx.beginPath()
      ctx.arc(ax, ay, 5, 0, Math.PI * 2)
      ctx.fillStyle = QUAL_COLORS[a.qualidade]
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 1.5
      ctx.stroke()
    })

    // Current marker
    if (posicaoAtual) {
      const x = (posicaoAtual.x / 100) * canvas.width
      const y = (posicaoAtual.y / 100) * canvas.height
      ctx.beginPath()
      ctx.arc(x, y, 13, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(59,130,246,0.2)'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x, y, 7, 0, Math.PI * 2)
      ctx.fillStyle = '#2563eb'
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(x - 14, y)
      ctx.lineTo(x + 14, y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, y - 14)
      ctx.lineTo(x, y + 14)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    onPosicaoChange({ x, y })
  }

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="bg-court-sand relative min-h-[150px] cursor-crosshair select-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  )
}
