import api from '@/lib/api'
import type { LoginResponse, RefreshResponse, User } from '@/types/auth'

export const authService = {
  async login(identifier: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/api/v1/auth/login', {
      identifier,
      password,
    })
    return data
  },

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const { data } = await api.post<RefreshResponse>('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    })
    return data
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/api/v1/auth/me')
    return data
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/api/v1/auth/forgot-password', { email })
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/api/v1/auth/reset-password', {
      token,
      new_password: newPassword,
    })
  },
}
