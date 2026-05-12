'use client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, AlertTriangle, Eye, EyeOff, KeyRound } from 'lucide-react'
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/validations'
import { apiErrorMessage } from '@/lib/api'
import { authService } from '@/services/auth'
import { cn } from '@/lib/utils'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token') ?? null

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [success, setSuccess]           = useState(false)
  const [isLoading, setIsLoading]       = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({ resolver: zodResolver(resetPasswordSchema) })

  async function onSubmit(data: ResetPasswordFormData) {
    if (!token) {
      setError('root', { message: 'Link inválido ou expirado. Solicite um novo.' })
      return
    }
    setIsLoading(true)
    try {
      await authService.resetPassword(token, data.new_password)
      setSuccess(true)
      setTimeout(() => router.push('/auth/login'), 2500)
    } catch (err) {
      setError('root', {
        message: apiErrorMessage(err, 'Link inválido ou expirado. Solicite um novo.'),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(250,185,0,0.06) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full pointer-events-none"
           style={{ background: 'rgba(250,185,0,0.03)' }} />

      {/* Corner marks */}
      {['top-5 left-6', 'top-5 right-6', 'bottom-5 left-6', 'bottom-5 right-6'].map((pos) => (
        <span key={pos} className={`absolute ${pos} text-[#FAB900]/10 text-xl pointer-events-none select-none`}>✕</span>
      ))}

      <div className="w-full max-w-[390px] relative z-10">

        {/* Logo */}
        <div className="text-center mb-7">
          <div className="flex justify-center mb-3">
            <Image src="/images/logo.png" alt="ScoutPlay" width={110} height={110} className="object-contain" priority />
          </div>
          <p className="text-[11px] text-white/30 uppercase tracking-[1.5px]">
            Analise · Estratégia · Evolução
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-6 py-6">

          {!token ? (
            /* Token ausente */
            <div className="flex flex-col items-center text-center py-4 gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                   style={{ background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.25)' }}>
                <AlertTriangle size={24} color="#f87171" />
              </div>
              <p className="text-white text-[15px] font-medium">Link inválido</p>
              <p className="text-white/40 text-xs leading-relaxed">
                Este link é inválido ou expirou. Solicite um novo link de redefinição.
              </p>
              <button
                onClick={() => router.push('/auth/forgot-password')}
                className="mt-2 h-10 px-5 rounded-lg text-sm font-medium transition-all active:scale-[0.98]"
                style={{ background: '#FAB900', color: '#111111' }}
              >
                Solicitar novo link
              </button>
            </div>
          ) : success ? (
            /* Sucesso */
            <div className="flex flex-col items-center text-center py-4 gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                   style={{ background: 'rgba(250,185,0,0.12)', border: '1.5px solid rgba(250,185,0,0.3)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FAB900" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <p className="text-white text-[15px] font-medium">Senha redefinida!</p>
              <p className="text-white/40 text-xs">Redirecionando para o login...</p>
            </div>
          ) : (
            /* Formulário */
            <>
              <p className="text-white text-[15px] font-medium text-center mb-1">
                Nova senha
              </p>
              <p className="text-white/35 text-[12px] text-center mb-5">
                Escolha uma senha segura para sua conta.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>

                {/* Nova senha */}
                <div className="mb-4">
                  <label className="text-[11px] text-white/40 uppercase tracking-[0.5px] block mb-1.5">
                    Nova senha
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    </span>
                    <input
                      {...register('new_password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoFocus
                      className={cn(
                        'w-full h-11 pl-10 pr-10 rounded-lg text-sm text-white placeholder-white/20 outline-none transition-all',
                        'border focus:ring-2',
                        errors.new_password
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
                  {errors.new_password && (
                    <p className="flex items-center gap-1 text-red-400 text-[11px] mt-1.5">
                      <AlertCircle size={11} />
                      {errors.new_password.message}
                    </p>
                  )}
                </div>

                {/* Confirmar senha */}
                <div className="mb-5">
                  <label className="text-[11px] text-white/40 uppercase tracking-[0.5px] block mb-1.5">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    </span>
                    <input
                      {...register('confirm_password')}
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={cn(
                        'w-full h-11 pl-10 pr-10 rounded-lg text-sm text-white placeholder-white/20 outline-none transition-all',
                        'border focus:ring-2',
                        errors.confirm_password
                          ? 'bg-white/[0.06] border-red-500/40 focus:ring-red-500/10'
                          : 'bg-white/[0.06] border-white/10 focus:border-[#FAB900]/50 focus:ring-[#FAB900]/8'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirm_password && (
                    <p className="flex items-center gap-1 text-red-400 text-[11px] mt-1.5">
                      <AlertCircle size={11} />
                      {errors.confirm_password.message}
                    </p>
                  )}
                </div>

                {errors.root && (
                  <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-lg text-red-400 text-xs"
                       style={{ background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.25)' }}>
                    <AlertTriangle size={15} className="flex-shrink-0" />
                    {errors.root.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: '#FAB900', color: '#111111' }}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} />
                      Redefinir senha
                    </>
                  )}
                </button>

              </form>
            </>
          )}
        </div>

        {/* Golden accent line */}
        <div className="h-[2px] rounded-full mx-8 opacity-50"
             style={{ background: 'linear-gradient(90deg, transparent, #FAB900, transparent)' }} />

      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
