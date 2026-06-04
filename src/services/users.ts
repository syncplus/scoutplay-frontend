import api from '@/lib/api'
import type { UserRole } from '@/types/auth'

export interface UserOut {
  id:       string
  name:     string
  username: string
  email:    string
  role:     UserRole
  active:   boolean
  photo:    string | null
}

export interface CreateUserPayload {
  name:     string
  username: string
  email:    string
  password: string
  role:     UserRole
}

export interface UpdateUserPayload {
  name?:     string
  username?: string
  email?:    string
  password?: string
  role?:     UserRole
  active?:   boolean
}

export interface UpdateMePayload {
  name?:     string
  username?: string
  email?:    string
  password?: string
}

const BASE = '/user'

export const usersService = {
  async list(): Promise<{ data: UserOut[]; total: number }> {
    const { data } = await api.get<{ data: UserOut[]; total: number }>(BASE)
    return data
  },

  async get(id: string): Promise<UserOut> {
    const { data } = await api.get<UserOut>(`${BASE}/${id}`)
    return data
  },

  async create(payload: CreateUserPayload): Promise<UserOut> {
    const { data } = await api.post<UserOut>(BASE, payload)
    return data
  },

  async update(id: string, payload: UpdateUserPayload): Promise<UserOut> {
    const { data } = await api.patch<UserOut>(`${BASE}/${id}`, payload)
    return data
  },

  async updateMe(payload: UpdateMePayload): Promise<UserOut> {
    const { data } = await api.patch<UserOut>(`${BASE}/me`, payload)
    return data
  },

  async uploadAvatar(dataUrl: string): Promise<UserOut> {
    const { data } = await api.post<UserOut>(`${BASE}/me/avatar`, { data: dataUrl })
    return data
  },
}
