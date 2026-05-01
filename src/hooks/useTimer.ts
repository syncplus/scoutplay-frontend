import { useEffect, useRef } from 'react'
import { usePartidaStore } from '@/store/partida.store'

export function useTimer() {
  const { timer, tickTimer } = usePartidaStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timer.running) {
      intervalRef.current = setInterval(() => {
        tickTimer()
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timer.running, tickTimer])

  return timer
}
