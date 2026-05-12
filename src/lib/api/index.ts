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
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      tokenManager.set(null)
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

export function apiErrorMessage(err: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  if (axios.isAxiosError(err)) {
    return (err as ApiError).response?.data?.detail ?? fallback
  }
  return fallback
}

export default api
