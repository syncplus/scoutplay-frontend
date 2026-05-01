import { useEffect, useState } from 'react'
import { usePartidaStore } from '@/store/partida.store'
import { partidasService } from '@/services/partidas.service'
import { ataquesService, setsService } from '@/services/ataques.service'

export function usePartida(id: string) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setPartida, setAtaques } = usePartidaStore()

  useEffect(() => {
    if (!id) return

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const [partida, ataques, sets] = await Promise.all([
          partidasService.get(id),
          ataquesService.list(id),
          setsService.list(id),
        ])
        setPartida(partida)
        setAtaques(ataques)
        usePartidaStore.setState({ sets })
      } catch (err: unknown) {
        const e = err as { message?: string }
        setError(e?.message || 'Erro ao carregar partida')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [id, setPartida, setAtaques])

  return { isLoading, error }
}
