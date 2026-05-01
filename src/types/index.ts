export type PartidaStatus = 'aguardando' | 'em_progresso' | 'finalizada'

export type ZonaDestino =
  | 'Z1'
  | 'Z2'
  | 'Z3'
  | 'Z4'
  | 'Z5'
  | 'Z6'
  | 'Z7'
  | 'Z8'
  | 'Z9'

export const ZONA_LABELS: Record<ZonaDestino, string> = {
  Z1: 'PT',
  Z2: 'PM',
  Z3: 'DC',
  Z4: 'PP',
  Z5: 'PA',
  Z6: 'DP',
  Z7: 'LP',
  Z8: 'MF',
  Z9: 'DL',
}
