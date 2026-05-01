import { create } from 'zustand'
import { Ataque, CreateAtaqueDTO, Partida, Set, TimerState } from '@/types'
import { ataquesService, setsService } from '@/services/ataques.service'
import { partidasService } from '@/services/partidas.service'

interface PartidaState {
  partida: Partida | null
  ataques: Ataque[]
  sets: Set[]
  timer: TimerState
  placarNos: number
  placarAdversario: number
  setNumero: number
  isLoading: boolean

  // Actions
  setPartida: (p: Partida) => void
  setAtaques: (a: Ataque[]) => void

  // Timer
  startTimer: (partidaId: string) => Promise<void>
  pauseTimer: (partidaId: string) => Promise<void>
  resumeTimer: (partidaId: string) => Promise<void>
  finishTimer: (partidaId: string) => Promise<void>
  tickTimer: () => void

  // Placar
  addPlacar: (who: 'nos' | 'adversario') => void
  subPlacar: (who: 'nos' | 'adversario') => void
  finalizarSet: (partidaId: string) => Promise<void>

  // Ataques
  registrarAtaque: (partidaId: string, dto: CreateAtaqueDTO) => Promise<void>
  desfazerUltimo: (partidaId: string) => Promise<void>

  reset: () => void
}

const initialTimer: TimerState = {
  seconds: 0,
  running: false,
  pauseCount: 0,
}

export const usePartidaStore = create<PartidaState>()((set, get) => ({
  partida: null,
  ataques: [],
  sets: [],
  timer: initialTimer,
  placarNos: 0,
  placarAdversario: 0,
  setNumero: 1,
  isLoading: false,

  setPartida: (partida) => set({ partida }),
  setAtaques: (ataques) => set({ ataques }),

  // ─── Timer ────────────────────────────────────────────────────────────────
  startTimer: async (partidaId) => {
    await partidasService.start(partidaId)
    set((s) => ({
      timer: { ...s.timer, running: true, startedAt: Date.now() },
    }))
  },

  pauseTimer: async (partidaId) => {
    await partidasService.pause(partidaId)
    set((s) => ({
      timer: { ...s.timer, running: false, pauseCount: s.timer.pauseCount + 1 },
    }))
  },

  resumeTimer: async (partidaId) => {
    await partidasService.resume(partidaId)
    set((s) => ({ timer: { ...s.timer, running: true } }))
  },

  finishTimer: async (partidaId) => {
    const { timer } = get()
    await partidasService.finish(partidaId, timer.seconds)
    set((s) => ({ timer: { ...s.timer, running: false } }))
  },

  tickTimer: () => {
    set((s) => ({
      timer: { ...s.timer, seconds: s.timer.seconds + 1 },
    }))
  },

  // ─── Placar ───────────────────────────────────────────────────────────────
  addPlacar: (who) => {
    if (who === 'nos') set((s) => ({ placarNos: s.placarNos + 1 }))
    else set((s) => ({ placarAdversario: s.placarAdversario + 1 }))
  },

  subPlacar: (who) => {
    if (who === 'nos') set((s) => ({ placarNos: Math.max(0, s.placarNos - 1) }))
    else set((s) => ({ placarAdversario: Math.max(0, s.placarAdversario - 1) }))
  },

  finalizarSet: async (partidaId) => {
    const { placarNos, placarAdversario, setNumero } = get()
    const novoSet = await setsService.create(partidaId, {
      placarNos,
      placarAdversario,
    })
    set((s) => ({
      sets: [...s.sets, novoSet],
      placarNos: 0,
      placarAdversario: 0,
      setNumero: setNumero + 1,
    }))
  },

  // ─── Ataques ──────────────────────────────────────────────────────────────
  registrarAtaque: async (partidaId, dto) => {
    set({ isLoading: true })
    try {
      const ataque = await ataquesService.create(partidaId, dto)
      set((s) => ({ ataques: [ataque, ...s.ataques], isLoading: false }))
    } catch {
      set({ isLoading: false })
      throw new Error('Erro ao registrar ataque')
    }
  },

  desfazerUltimo: async (partidaId) => {
    await ataquesService.undoLast(partidaId)
    set((s) => ({ ataques: s.ataques.slice(1) }))
  },

  reset: () =>
    set({
      partida: null,
      ataques: [],
      sets: [],
      timer: initialTimer,
      placarNos: 0,
      placarAdversario: 0,
      setNumero: 1,
    }),
}))
