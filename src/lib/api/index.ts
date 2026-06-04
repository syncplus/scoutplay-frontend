import axios, { AxiosError } from 'axios'
import { tokenManager } from '@/lib/token'

export type ApiError = AxiosError<{ detail: string }>

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = tokenManager.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: ApiError) => {
    const requestUrl = error.config?.url ?? ''
    const isLoginRequest = requestUrl.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginRequest && typeof window !== 'undefined') {
      tokenManager.handleUnauthorized()
      if (window.location.pathname !== '/auth/login') {
        window.location.replace('/auth/login')
      }
    }
    return Promise.reject(error)
  }
)

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '')
const MEDIA_BASE = API_BASE.replace(/\/api\/v1$/, '')

/** Resolve um caminho de mídia da API (ex: /api/static/avatars/x.png) para URL absoluta. */
export function mediaUrl(path?: string | null): string {
  if (!path) return ''
  if (/^https?:\/\//.test(path) || path.startsWith('data:')) return path
  return `${MEDIA_BASE}/${path.replace(/^\/+/, '')}`
}

export function apiErrorMessage(err: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  if (axios.isAxiosError(err)) {
    return (err as ApiError).response?.data?.detail ?? fallback
  }
  return fallback
}

export default api
