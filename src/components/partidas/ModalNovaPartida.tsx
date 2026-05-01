'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { createPartidaSchema, CreatePartidaFormData } from '@/lib/validations'
import { partidasService } from '@/services/partidas.service'
import { Partida } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  onCreate: (partida: Partida) => void
}

export default function ModalNovaPartida({ open, onClose, onCreate }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePartidaFormData>({
    resolver: zodResolver(createPartidaSchema),
    defaultValues: { lado: 'esquerda', data: new Date().toISOString().split('T')[0] },
  })

  const lado = watch('lado')

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  async function onSubmit(data: CreatePartidaFormData) {
    const partida = await partidasService.create(data)
    onCreate(partida)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Nova partida</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 
                       text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1.5">
              Jogador / Dupla analisada
            </label>
            <input
              {...register('jogador')}
              className="input"
              placeholder="Ex: Avatar e Gaúcho"
            />
            {errors.jogador && (
              <p className="text-red-500 text-xs mt-1">{errors.jogador.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1.5">
              Partida / Fase
            </label>
            <input
              {...register('fase')}
              className="input"
              placeholder="Ex: Semi final 1"
            />
            {errors.fase && (
              <p className="text-red-500 text-xs mt-1">{errors.fase.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1.5">
                Data
              </label>
              <input {...register('data')} type="date" className="input" />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1.5">
                Lado
              </label>
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                {(['esquerda', 'direita'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setValue('lado', l)}
                    className={`flex-1 py-2 text-xs font-medium transition-colors ${
                      lado === l
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {l === 'esquerda' ? 'Esq' : 'Dir'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1.5">
              Adversário (opcional)
            </label>
            <input
              {...register('adversario')}
              className="input"
              placeholder="Ex: João e Iuri"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1.5">
              Observações
            </label>
            <input
              {...register('observacoes')}
              className="input"
              placeholder="Ex: Torneio estadual, quadra 3"
            />
          </div>

          {/* Footer */}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 justify-center"
            >
              {isSubmitting ? 'Criando...' : 'Criar partida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
