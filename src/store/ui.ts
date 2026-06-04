import { create } from 'zustand'

interface UIState {
  // sinaliza que o usuário pediu para abrir o modal "Nova partida" (via menu lateral)
  novaPartidaPendente: boolean
  pedirNovaPartida: () => void
  limparNovaPartida: () => void
}

export const useUIStore = create<UIState>((set) => ({
  novaPartidaPendente: false,
  pedirNovaPartida: () => set({ novaPartidaPendente: true }),
  limparNovaPartida: () => set({ novaPartidaPendente: false }),
}))
