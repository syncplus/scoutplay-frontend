import api from '@/lib/api'
import type { LoginResponse, RefreshResponse, User } from '@/types/auth'

export const authService = {
  async login(identifier: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', {
      identifier,
      password,
    })
    return data
  },

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const { data } = await api.post<RefreshResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    })
    return data
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me')
    return data
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email })
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    })
  },
}
