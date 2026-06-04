import api from '@/lib/api'
import type { LancamentoDTO, CreateLancamentoPayload } from '@/types/partida-lancamento'

const BASE = '/partidas'

export const partidaLancamentosService = {
  async add(partidaId: string, payload: CreateLancamentoPayload): Promise<LancamentoDTO> {
    const { data } = await api.post<LancamentoDTO>(`${BASE}/${partidaId}/lancamentos`, payload)
    return data
  },

  async remove(partidaId: string, lancamentoId: string): Promise<void> {
    await api.delete(`${BASE}/${partidaId}/lancamentos/${lancamentoId}`)
  },
}
