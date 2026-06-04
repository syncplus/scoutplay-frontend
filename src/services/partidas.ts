import api from '@/lib/api'
import type {
  PartidaDTO,
  PartidaDetailDTO,
  CreatePartidaPayload,
  UpdatePartidaPayload,
  Status,
} from '@/types/partida'

const BASE = '/api/v1/partidas'

export const partidasService = {
  async list(status?: Status): Promise<{ data: PartidaDTO[]; total: number }> {
    const { data } = await api.get<{ data: PartidaDTO[]; total: number }>(BASE, {
      params: status ? { status } : undefined,
    })
    return data
  },

  async get(id: string): Promise<PartidaDetailDTO> {
    const { data } = await api.get<PartidaDetailDTO>(`${BASE}/${id}`)
    return data
  },

  async create(payload: CreatePartidaPayload): Promise<PartidaDTO> {
    const { data } = await api.post<PartidaDTO>(BASE, payload)
    return data
  },

  async update(id: string, payload: UpdatePartidaPayload): Promise<PartidaDTO> {
    const { data } = await api.patch<PartidaDTO>(`${BASE}/${id}`, payload)
    return data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${BASE}/${id}`)
  },
}
