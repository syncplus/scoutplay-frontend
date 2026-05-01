'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { usePartidaStore } from '@/store/partida.store'

interface Props {
  partidaId: string
  jogador: string
  adversario?: string
}

export default function PlacarSection({ partidaId, jogador, adversario }: Props) {
  const { placarNos, placarAdversario, sets, setNumero, addPlacar, subPlacar, finalizarSet } =
    usePartidaStore()

  async function handleFinalizarSet() {
    await finalizarSet(partidaId)
  }

  return (
    <div className="bg-navy-900 px-4 py-3 border-b border-white/7">
      <p className="text-white/35 text-[10px] uppercase tracking-widest text-center mb-3">
        Placar
      </p>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
        {/* Nosso time */}
        <div className="text-center">
          <p className="text-green-400 text-xs font-medium mb-1.5 truncate">{jogador}</p>
          <p className="text-white text-4xl font-medium font-mono">{placarNos}</p>
          <div className="flex gap-1.5 justify-center mt-2.5">
            <button
              onClick={() => addPlacar('nos')}
              className="w-9 h-9 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-green-700 active:scale-95 transition-all"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={() => subPlacar('nos')}
              className="w-9 h-9 bg-white/10 text-white/70 rounded-lg flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
            >
              <Minus size={16} />
            </button>
          </div>
        </div>

        {/* Center */}
        <div className="text-center">
          <p className="text-white/20 text-xl">×</p>
          <p className="text-white/25 text-[9px] mt-1">SET {setNumero}</p>
        </div>

        {/* Adversário */}
        <div className="text-center">
          <p className="text-red-400 text-xs font-medium mb-1.5 truncate">
            {adversario || 'Adversário'}
          </p>
          <p className="text-white text-4xl font-medium font-mono">{placarAdversario}</p>
          <div className="flex gap-1.5 justify-center mt-2.5">
            <button
              onClick={() => addPlacar('adversario')}
              className="w-9 h-9 bg-red-600 text-white rounded-lg flex items-center justify-center hover:bg-red-700 active:scale-95 transition-all"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={() => subPlacar('adversario')}
              className="w-9 h-9 bg-white/10 text-white/70 rounded-lg flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
            >
              <Minus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Sets history */}
      {sets.length > 0 && (
        <div className="mt-3 border-t border-white/7 pt-2.5">
          <p className="text-white/30 text-[10px] text-center mb-1.5">Histórico de sets</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {sets.map((s, i) => (
              <span
                key={s.id}
                className="bg-white/8 rounded-md px-2.5 py-1 text-xs text-white/60 font-mono"
              >
                Set {i + 1}: {s.placarNos}×{s.placarAdversario}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2.5 flex justify-center">
        <button
          onClick={handleFinalizarSet}
          className="text-white/50 hover:text-white/80 text-xs bg-white/7 hover:bg-white/12 
                     px-3 py-1.5 rounded-lg transition-all"
        >
          Finalizar set e iniciar próximo
        </button>
      </div>
    </div>
  )
}
