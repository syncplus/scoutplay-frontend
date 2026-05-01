import Cookies from 'js-cookie'
import api from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import { ApiResponse, AuthResponse, LoginCredentials, User } from '@/types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>(
      ENDPOINTS.AUTH.LOGIN,
      credentials
    )
    const { accessToken, refreshToken } = data.data.tokens
    Cookies.set('access_token', accessToken, { expires: 1, sameSite: 'strict' })
    Cookies.set('refresh_token', refreshToken, { expires: 7, sameSite: 'strict' })
    return data.data
  },

  async logout(): Promise<void> {
    try {
      await api.post(ENDPOINTS.AUTH.LOGOUT)
    } finally {
      Cookies.remove('access_token')
      Cookies.remove('refresh_token')
    }
  },

  async me(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>(ENDPOINTS.AUTH.ME)
    return data.data
  },

  isAuthenticated(): boolean {
    return !!Cookies.get('access_token')
  },
}
