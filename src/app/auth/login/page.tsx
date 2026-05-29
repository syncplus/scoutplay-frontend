'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LogIn, AlertCircle, AlertTriangle, ShieldCheck } from 'lucide-react'
import { loginSchema, LoginFormData } from '@/lib/validations'
import { apiErrorMessage } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'

type Role = 'treinador' | 'admin'

const ROLES: { key: Role; label: string; icon: React.ReactNode }[] = [
  { key: 'treinador', label: 'Treinador', icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 6.32 16.17M12 2a10 10 0 0 0-6.32 16.17M12 22a10 10 0 0 1-6.32-16.17M12 22a10 10 0 0 0 6.32-16.17M12 7l2.5 3.5L18 11l-2.5 3.5L18 18l-3.5-1L12 19.5 9.5 17 6 18l2.5-3.5L6 11l3.5-.5z"/></svg> },
  { key: 'admin',     label: 'Admin',     icon: <ShieldCheck size={14} /> },
]

export default function LoginPage() {
  const router = useRouter()
  const { login, logout, isLoading, user } = useAuthStore()
  const [role, setRole]             = useState<Role>('treinador')

  useEffect(() => {
    if (user) router.replace('/partidas')
  }, [user, router])
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess]       = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginFormData) {
    try {
      await login(data.identifier, data.password)
      const userRole = useAuthStore.getState().user?.role
      if (userRole !== role) {
        logout()
        setError('root', { message: `Acesso negado. Esta conta não é do perfil "${role}".` })
        return
      }
      setSuccess(true)
      setTimeout(() => router.push('/partidas'), 1500)
    } catch (err) {
      setError('root', {
        message: apiErrorMessage(err, 'E-mail/username ou senha incorretos.'),
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4 relative overflow-hidden">

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(250,185,0,0.06) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full pointer-events-none"
           style={{ background: 'rgba(250,185,0,0.03)' }} />

      {['top-5 left-6', 'top-5 right-6', 'bottom-5 left-6', 'bottom-5 right-6'].map((pos) => (
        <span key={pos} className={`absolute ${pos} text-[#FAB900]/10 text-xl pointer-events-none select-none`}>✕</span>
      ))}

      <div className="w-full max-w-[390px] relative z-10">

        <div className="text-center mb-7">
          <div className="flex justify-center mb-3">
            <Image src="/images/logo.png" alt="ScoutPlay" width={110} height={110} className="object-contain" priority />
          </div>
          <p className="text-[11px] text-white/30 uppercase tracking-[1.5px]">
            Analise · Estratégia · Evoluçãoo
          </p>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-6 py-6">
          <p className="text-white text-[15px] font-medium text-center mb-5">Acesse sua conta</p>

          {success ? (
            <div className="flex flex-col items-center text-center py-4 gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                   style={{ background: 'rgba(250,185,0,0.12)', border: '1.5px solid rgba(250,185,0,0.3)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FAB900" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <p className="text-white text-[15px] font-medium">Acesso autorizado!</p>
              <p className="text-white/40 text-xs">Redirecionando...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>

              {/* Role selector */}
              <div className="mb-5">
                <span className="text-[11px] text-white/40 uppercase tracking-[0.5px] mb-2 block">Perfil de acesso</span>
                <div className="flex gap-2">
                  {ROLES.map(({ key, label, icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setRole(key)}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium border transition-all',
                        role === key
                          ? 'border-[#FAB900]/40 text-[#FAB900]'
                          : 'border-white/[0.08] text-white/35 hover:text-white/50'
                      )}
                      style={role === key ? { background: 'rgba(250,185,0,0.12)' } : { background: 'rgba(255,255,255,0.03)' }}
                    >
                      {icon}{label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Identifier */}
              <div className="mb-4">
                <label className="text-[11px] text-white/40 uppercase tracking-[0.5px] block mb-1.5">
                  E-mail ou Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>
                    </svg>
                  </span>
                  <input
                    {...register('identifier')}
                    type="text"
                    placeholder="seu@email.com ou username"
                    autoComplete="username"
                    className={cn(
                      'w-full h-11 pl-10 pr-3 rounded-lg text-sm text-white placeholder-white/20 outline-none transition-all border focus:ring-2',
                      errors.identifier
                        ? 'bg-white/[0.06] border-red-500/40 focus:ring-red-500/10'
                        : 'bg-white/[0.06] border-white/10 focus:border-[#FAB900]/50 focus:ring-[#FAB900]/8'
                    )}
                  />
                </div>
                {errors.identifier && (
                  <p className="flex items-center gap-1 text-red-400 text-[11px] mt-1.5">
                    <AlertCircle size={11} />{errors.identifier.message}
                  </p>
                )}
              </div>

              {/* Senha */}
              <div className="mb-1">
                <label className="text-[11px] text-white/40 uppercase tracking-[0.5px] block mb-1.5">Senha</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </span>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={cn(
                      'w-full h-11 pl-10 pr-10 rounded-lg text-sm text-white placeholder-white/20 outline-none transition-all border focus:ring-2',
                      errors.password
                        ? 'bg-white/[0.06] border-red-500/40 focus:ring-red-500/10'
                        : 'bg-white/[0.06] border-white/10 focus:border-[#FAB900]/50 focus:ring-[#FAB900]/8'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="flex items-center gap-1 text-red-400 text-[11px] mt-1.5">
                    <AlertCircle size={11} />{errors.password.message}
                  </p>
                )}
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => router.push('/auth/forgot-password')}
                    className="text-[11px] transition-colors"
                    style={{ color: 'rgba(250,185,0,0.5)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FAB900')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,185,0,0.5)')}
                  >
                    Esqueci minha senha
                  </button>
                </div>
              </div>

              {errors.root && (
                <div className="flex items-center gap-2 mt-3 px-3 py-2.5 rounded-lg text-red-400 text-xs"
                     style={{ background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.25)' }}>
                  <AlertTriangle size={15} className="flex-shrink-0" />
                  {errors.root.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: '#FAB900', color: '#111111' }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                    Verificando...
                  </>
                ) : (
                  <><LogIn size={16} />Entrar</>
                )}
              </button>

            </form>
          )}
        </div>

        <div className="h-[2px] rounded-full mx-8 opacity-50"
             style={{ background: 'linear-gradient(90deg, transparent, #FAB900, transparent)' }} />

        <p className="text-center mt-5 text-[12px] text-white/20">
          Não tem acesso?{' '}
          <button className="transition-colors" style={{ color: 'rgba(250,185,0,0.6)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FAB900')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,185,0,0.6)')}>
            Fale com o administrador
          </button>
        </p>

      </div>
    </div>
  )
}
