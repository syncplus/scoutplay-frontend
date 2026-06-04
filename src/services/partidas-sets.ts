import api from '@/lib/api'
import type { SetDTO, CreateSetPayload } from '@/types/partida-set'

const BASE = '/partidas'

export const partidaSetsService = {
  async add(partidaId: string, payload: CreateSetPayload): Promise<SetDTO> {
    const { data } = await api.post<SetDTO>(`${BASE}/${partidaId}/sets`, payload)
    return data
  },

  async remove(partidaId: string, setId: string): Promise<void> {
    await api.delete(`${BASE}/${partidaId}/sets/${setId}`)
  },
}
