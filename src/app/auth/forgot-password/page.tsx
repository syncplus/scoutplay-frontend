'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, AlertTriangle, ArrowLeft, Mail } from 'lucide-react'
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations'
import { apiErrorMessage } from '@/lib/api'
import { authService } from '@/services/auth'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) })

  async function onSubmit(data: ForgotPasswordFormData) {
    setIsLoading(true)
    try {
      await authService.forgotPassword(data.email)
      setSuccess(true)
    } catch (err) {
      setError('root', {
        message: apiErrorMessage(err, 'Não foi possível processar a solicitação. Tente novamente.'),
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

          {success ? (
            <div className="flex flex-col items-center text-center py-4 gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                   style={{ background: 'rgba(250,185,0,0.12)', border: '1.5px solid rgba(250,185,0,0.3)' }}>
                <Mail size={24} color="#FAB900" />
              </div>
              <p className="text-white text-[15px] font-medium">E-mail enviado!</p>
              <p className="text-white/40 text-xs leading-relaxed">
                Se o endereço <span className="text-white/60">{getValues('email')}</span> estiver
                cadastrado, você receberá um link de redefinição em breve.
              </p>
              <p className="text-white/25 text-[11px]">Verifique também a pasta de spam.</p>
              <button
                onClick={() => router.push('/auth/login')}
                className="mt-2 flex items-center gap-1.5 text-[12px] transition-colors"
                style={{ color: 'rgba(250,185,0,0.6)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FAB900')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,185,0,0.6)')}
              >
                <ArrowLeft size={12} />
                Voltar para o login
              </button>
            </div>
          ) : (
            <>
              <p className="text-white text-[15px] font-medium text-center mb-1">
                Esqueci minha senha
              </p>
              <p className="text-white/35 text-[12px] text-center mb-5">
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>

                <div className="mb-5">
                  <label className="text-[11px] text-white/40 uppercase tracking-[0.5px] block mb-1.5">
                    E-mail
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>
                      </svg>
                    </span>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="seu@email.com"
                      autoFocus
                      className={cn(
                        'w-full h-11 pl-10 pr-3 rounded-lg text-sm text-white placeholder-white/20 outline-none transition-all',
                        'border focus:ring-2',
                        errors.email
                          ? 'bg-white/[0.06] border-red-500/40 focus:ring-red-500/10'
                          : 'bg-white/[0.06] border-white/10 focus:border-[#FAB900]/50 focus:ring-[#FAB900]/8'
                      )}
                    />
                  </div>
                  {errors.email && (
                    <p className="flex items-center gap-1 text-red-400 text-[11px] mt-1.5">
                      <AlertCircle size={11} />
                      {errors.email.message}
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
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      Enviar link de redefinição
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

        {/* Back to login */}
        {!success && (
          <p className="text-center mt-5 text-[12px] text-white/20">
            Lembrou a senha?{' '}
            <button
              onClick={() => router.push('/auth/login')}
              className="transition-colors"
              style={{ color: 'rgba(250,185,0,0.6)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FAB900')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,185,0,0.6)')}
            >
              Voltar para o login
            </button>
          </p>
        )}

      </div>
    </div>
  )
}
