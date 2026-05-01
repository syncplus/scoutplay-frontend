import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PartidaStatus, ZONA_LABELS, ZonaDestino } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM', { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function formatDateFull(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function getStatusLabel(status: PartidaStatus): string {
  const labels: Record<PartidaStatus, string> = {
    aguardando: 'Aguardando',
    em_progresso: 'Em progresso',
    finalizada: 'Finalizada',
  }
  return labels[status]
}

export function getStatusColor(status: PartidaStatus) {
  return {
    aguardando: {
      pill: 'bg-amber-100 text-amber-800',
      dot: 'bg-amber-400',
      stripe: 'bg-amber-400',
    },
    em_progresso: {
      pill: 'bg-green-100 text-green-800',
      dot: 'bg-green-500',
      stripe: 'bg-green-500',
    },
    finalizada: {
      pill: 'bg-blue-100 text-blue-800',
      dot: 'bg-blue-500',
      stripe: 'bg-blue-500',
    },
  }[status]
}

export function getZonaLabel(zona: ZonaDestino): string {
  return ZONA_LABELS[zona] ?? zona
}

export function calcPercent(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
