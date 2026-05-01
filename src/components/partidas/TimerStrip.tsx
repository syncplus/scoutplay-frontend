'use client'

import { usePartidaStore } from '@/store/partida.store'
import { useTimer } from '@/hooks/useTimer'
import { formatTimer } from '@/lib/utils'
import { PartidaStatus } from '@/types'

interface Props {
  partidaId: string
  status: PartidaStatus
}

export default function TimerStrip({ partidaId, status }: Props) {
  const { startTimer, pauseTimer, resumeTimer, finishTimer } = usePartidaStore()
  const timer = useTimer()

  const isFinished = status === 'finalizada'

  return (
    <div className="bg-navy-800 px-4 py-3 border-b border-white/7">
      <div className="text-center mb-2.5">
        <p className="text-white/35 text-[10px] uppercase tracking-widest mb-1">
          Tempo de partida
        </p>
        <p
          className={`text-3xl font-medium font-mono tracking-widest ${
            isFinished
              ? 'text-indigo-300'
              : timer.running
              ? 'text-green-400'
              : timer.seconds > 0
              ? 'text-amber-400'
              : 'text-slate-400'
          }`}
        >
          {formatTimer(timer.seconds)}
        </p>
      </div>

      <div className="flex gap-2 justify-center">
        {/* Iniciar */}
        <button
          onClick={() => startTimer(partidaId)}
          disabled={timer.running || timer.seconds > 0 || isFinished}
          className="bg-green-600 text-white text-xs font-medium px-4 py-1.5 rounded-lg 
                     disabled:opacity-30 disabled:cursor-not-allowed hover:bg-green-700 transition-all"
        >
          Iniciar
        </button>

        {/* Pausar / Retomar */}
        {timer.running ? (
          <button
            onClick={() => pauseTimer(partidaId)}
            disabled={isFinished}
            className="bg-amber-600 text-white text-xs font-medium px-4 py-1.5 rounded-lg 
                       disabled:opacity-30 hover:bg-amber-700 transition-all"
          >
            Pausar
          </button>
        ) : (
          <button
            onClick={() => resumeTimer(partidaId)}
            disabled={timer.seconds === 0 || isFinished}
            className="bg-blue-600 text-white text-xs font-medium px-4 py-1.5 rounded-lg 
                       disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-700 transition-all"
          >
            Retomar
          </button>
        )}

        {/* Finalizar */}
        <button
          onClick={() => finishTimer(partidaId)}
          disabled={timer.seconds === 0 || isFinished}
          className="bg-red-600 text-white text-xs font-medium px-4 py-1.5 rounded-lg 
                     disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-700 transition-all"
        >
          Finalizar
        </button>
      </div>

      <p className="text-center text-white/30 text-[10px] mt-2">
        {isFinished
          ? `Finalizada · ${formatTimer(timer.seconds)} · ${timer.pauseCount} pausa(s)`
          : timer.running
          ? `Em andamento · ${timer.pauseCount} pausa(s)`
          : timer.seconds > 0
          ? `Pausado · ${timer.pauseCount} pausa(s)`
          : 'Partida não iniciada'}
      </p>
    </div>
  )
}
