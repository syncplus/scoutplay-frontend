'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { TipoAtaque, QualidadeAtaque, ZonaDestino } from '@/types'
import { usePartidaStore } from '@/store/partida.store'
import { useTimer } from '@/hooks/useTimer'
import QuadraCanvas from '@/components/quadra/QuadraCanvas'
import ZoneGrid from '@/components/quadra/ZoneGrid'
import TypeQualitySelector from '@/components/quadra/TypeQualitySelector'
import AtaqueHistorico from '@/components/partidas/AtaqueHistorico'

export default function RegistrarPage() {
  const { id } = useParams<{ id: string }>()
  const { registrarAtaque, desfazerUltimo, ataques, isLoading } = usePartidaStore()
  const timer = useTimer()

  const [tipo, setTipo] = useState<TipoAtaque>('cabeca')
  const [qualidade, setQualidade] = useState<QualidadeAtaque>('boa')
  const [posicao, setPosicao] = useState<{ x: number; y: number } | null>(null)
  const [zona, setZona] = useState<ZonaDestino | null>(null)

  const canRegister = posicao !== null && zona !== null

  async function handleRegister() {
    if (!canRegister) return
    await registrarAtaque(id, {
      tipo,
      qualidade,
      posicaoX: posicao.x,
      posicaoY: posicao.y,
      zonaDestino: zona,
      timestamp: timer.seconds * 1000,
    })
    setPosicao(null)
    setZona(null)
  }

  async function handleUndo() {
    await desfazerUltimo(id)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
      {/* Type + Quality */}
      <TypeQualitySelector
        tipo={tipo}
        qualidade={qualidade}
        onTipoChange={setTipo}
        onQualidadeChange={setQualidade}
      />

      {/* Court */}
      <div className="card p-3">
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-500 text-center">
          <div>
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mr-1">1</span>
            Posição do atacante
          </div>
          <div>
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full mr-1">2</span>
            Destino do ataque
          </div>
        </div>

        <div className="grid grid-cols-[1fr_3px_1fr] rounded-lg overflow-hidden border-2 border-court-border bg-court-border">
          {/* Attacker side — free click */}
          <QuadraCanvas
            ataques={ataques}
            posicaoAtual={posicao}
            qualidadeAtual={qualidade}
            onPosicaoChange={setPosicao}
          />

          {/* Net */}
          <div className="bg-white" />

          {/* Zone grid */}
          <ZoneGrid zonaSelecionada={zona} ataques={ataques} onZoneSelect={setZona} />
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mt-3">
          <div
            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-colors ${
              posicao
                ? 'border-green-400 bg-green-50 text-green-700'
                : 'border-blue-400 bg-blue-50 text-blue-700'
            }`}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold text-white ${posicao ? 'bg-green-500' : 'bg-blue-500'}`}>
              1
            </span>
            {posicao ? `Pos: ${posicao.x}%, ${posicao.y}%` : 'Toque na quadra'}
          </div>
          <div
            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-colors ${
              zona
                ? 'border-green-400 bg-green-50 text-green-700'
                : posicao
                ? 'border-blue-400 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-400'
            }`}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold ${zona ? 'bg-green-500 text-white' : posicao ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
              2
            </span>
            {zona ? `${zona} selecionada` : 'Selecione o destino'}
          </div>
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={handleRegister}
        disabled={!canRegister || isLoading}
        className="w-full bg-green-600 text-white font-medium py-3 rounded-xl text-sm
                   disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700 
                   active:scale-95 transition-all"
      >
        {isLoading ? 'Registrando...' : 'Registrar ataque'}
      </button>

      <button
        onClick={handleUndo}
        disabled={ataques.length === 0}
        className="w-full bg-transparent border border-gray-200 text-gray-500 py-2.5 
                   rounded-xl text-sm hover:bg-gray-50 disabled:opacity-40 
                   disabled:cursor-not-allowed transition-all"
      >
        Desfazer último
      </button>

      {/* History */}
      {ataques.length > 0 && <AtaqueHistorico ataques={ataques} />}
    </div>
  )
}
