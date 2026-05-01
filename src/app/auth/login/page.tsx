'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/store/auth.store'
import { loginSchema, LoginFormData } from '@/lib/validations'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginFormData) {
    try {
      await login(data.email, data.password)
      router.push('/partidas')
    } catch {
      setError('root', { message: 'E-mail ou senha incorretos.' })
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="ScoutPlay" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="text-white text-2xl font-semibold">ScoutPlay</h1>
          <p className="text-white/40 text-sm mt-1">Análise de Futevôlei</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wide block mb-1.5">
              E-mail
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="seu@email.com"
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 
                         text-sm text-white placeholder-white/30 
                         focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="text-white/60 text-xs uppercase tracking-wide block mb-1.5">
              Senha
            </label>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 
                         text-sm text-white placeholder-white/30 
                         focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all"
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {errors.root && (
            <p className="text-red-400 text-sm text-center">{errors.root.message}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg 
                       hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-all active:scale-95"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
