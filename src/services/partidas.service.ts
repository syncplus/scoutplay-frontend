import api from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import {
  ApiResponse,
  CreatePartidaDTO,
  Partida,
  PartidaStats,
  PaginatedResponse,
} from '@/types'

export interface ListPartidasParams {
  status?: string
  page?: number
  pageSize?: number
}

export const partidasService = {
  async list(params?: ListPartidasParams): Promise<PaginatedResponse<Partida>> {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Partida>>>(
      ENDPOINTS.PARTIDAS.LIST,
      { params }
    )
    return data.data
  },

  async get(id: string): Promise<Partida> {
    const { data } = await api.get<ApiResponse<Partida>>(
      ENDPOINTS.PARTIDAS.GET(id)
    )
    return data.data
  },

  async create(dto: CreatePartidaDTO): Promise<Partida> {
    const { data } = await api.post<ApiResponse<Partida>>(
      ENDPOINTS.PARTIDAS.CREATE,
      dto
    )
    return data.data
  },

  async update(id: string, dto: Partial<CreatePartidaDTO>): Promise<Partida> {
    const { data } = await api.patch<ApiResponse<Partida>>(
      ENDPOINTS.PARTIDAS.UPDATE(id),
      dto
    )
    return data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(ENDPOINTS.PARTIDAS.DELETE(id))
  },

  async start(id: string): Promise<Partida> {
    const { data } = await api.post<ApiResponse<Partida>>(
      ENDPOINTS.PARTIDAS.START(id)
    )
    return data.data
  },

  async pause(id: string): Promise<Partida> {
    const { data } = await api.post<ApiResponse<Partida>>(
      ENDPOINTS.PARTIDAS.PAUSE(id)
    )
    return data.data
  },

  async resume(id: string): Promise<Partida> {
    const { data } = await api.post<ApiResponse<Partida>>(
      ENDPOINTS.PARTIDAS.RESUME(id)
    )
    return data.data
  },

  async finish(id: string, tempoTotal: number): Promise<Partida> {
    const { data } = await api.post<ApiResponse<Partida>>(
      ENDPOINTS.PARTIDAS.FINISH(id),
      { tempoTotal }
    )
    return data.data
  },

  async stats(id: string): Promise<PartidaStats> {
    const { data } = await api.get<ApiResponse<PartidaStats>>(
      ENDPOINTS.PARTIDAS.STATS(id)
    )
    return data.data
  },

  async exportBackup(id: string): Promise<Blob> {
    const { data } = await api.get(ENDPOINTS.PARTIDAS.EXPORT(id), {
      responseType: 'blob',
    })
    return data
  },

  async importBackup(file: File): Promise<Partida> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post<ApiResponse<Partida>>(
      ENDPOINTS.PARTIDAS.IMPORT,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data.data
  },
}
