import api from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import { ApiResponse, Ataque, CreateAtaqueDTO, Set } from '@/types'

export const ataquesService = {
  async list(partidaId: string): Promise<Ataque[]> {
    const { data } = await api.get<ApiResponse<Ataque[]>>(
      ENDPOINTS.ATAQUES.LIST(partidaId)
    )
    return data.data
  },

  async create(partidaId: string, dto: CreateAtaqueDTO): Promise<Ataque> {
    const { data } = await api.post<ApiResponse<Ataque>>(
      ENDPOINTS.ATAQUES.CREATE(partidaId),
      dto
    )
    return data.data
  },

  async delete(partidaId: string, ataqueId: string): Promise<void> {
    await api.delete(ENDPOINTS.ATAQUES.DELETE(partidaId, ataqueId))
  },

  async undoLast(partidaId: string): Promise<void> {
    await api.delete(ENDPOINTS.ATAQUES.UNDO_LAST(partidaId))
  },
}

export const setsService = {
  async list(partidaId: string): Promise<Set[]> {
    const { data } = await api.get<ApiResponse<Set[]>>(
      ENDPOINTS.SETS.LIST(partidaId)
    )
    return data.data
  },

  async create(
    partidaId: string,
    dto: { placarNos: number; placarAdversario: number }
  ): Promise<Set> {
    const { data } = await api.post<ApiResponse<Set>>(
      ENDPOINTS.SETS.CREATE(partidaId),
      dto
    )
    return data.data
  },
}
