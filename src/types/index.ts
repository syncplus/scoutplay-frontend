// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'scout'
  active: boolean
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

// ─── Partida ─────────────────────────────────────────────────────────────────
export type PartidaStatus = 'aguardando' | 'em_progresso' | 'finalizada'
export type LadoQuadra = 'esquerda' | 'direita'

export interface Partida {
  id: string
  jogador: string
  adversario?: string
  fase: string
  lado: LadoQuadra
  status: PartidaStatus
  data: string
  tempoTotal: number        // segundos
  numeroPausas: number
  totalAtaques: number
  sets: Set[]
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreatePartidaDTO {
  jogador: string
  adversario?: string
  fase: string
  lado: LadoQuadra
  data: string
  observacoes?: string
}

// ─── Set ─────────────────────────────────────────────────────────────────────
export interface Set {
  id: string
  numero: number
  placarNos: number
  placarAdversario: number
  partidaId: string
}

// ─── Ataque ──────────────────────────────────────────────────────────────────
export type TipoAtaque = 'cabeca' | 'shark'
export type QualidadeAtaque = 'boa' | 'media' | 'ruim'
export type ZonaDestino =
  | 'Z1' | 'Z2' | 'Z3'
  | 'Z4' | 'Z5' | 'Z6'
  | 'Z7' | 'Z8' | 'Z9'

export const ZONA_LABELS: Record<ZonaDestino, string> = {
  Z1: 'PT (Pingo p/ trás)',
  Z2: 'PM (Pingo de Meio)',
  Z3: 'DC (Diagonal Curta)',
  Z4: 'PP (Porrada Paralela)',
  Z5: 'PA (Paraguaia)',
  Z6: 'DP (Diagonal Porrada)',
  Z7: 'LP (Longa Paralela)',
  Z8: 'MF (Meio Fundo)',
  Z9: 'DL (Diagonal Longa)',
}

export interface Ataque {
  id: string
  tipo: TipoAtaque
  qualidade: QualidadeAtaque
  posicaoX: number          // % 0-100
  posicaoY: number          // % 0-100
  zonaDestino: ZonaDestino
  timestamp: number         // ms desde início da partida
  partidaId: string
  createdAt: string
}

export interface CreateAtaqueDTO {
  tipo: TipoAtaque
  qualidade: QualidadeAtaque
  posicaoX: number
  posicaoY: number
  zonaDestino: ZonaDestino
  timestamp: number
}

// ─── Dashboard / Stats ───────────────────────────────────────────────────────
export interface PartidaStats {
  totalAtaques: number
  totalBoas: number
  totalMedias: number
  totalRuins: number
  totalCabeca: number
  totalShark: number
  zonaPreferida: ZonaDestino
  distribuicaoProfundidade: {
    frente: number    // Z1-Z3
    meio: number      // Z4-Z6
    fundo: number     // Z7-Z9
  }
  distribuicaoQualidade: {
    boa: number
    media: number
    ruim: number
  }
  distribuicaoTipo: {
    cabeca: number
    shark: number
  }
  detalheZonas: Array<{
    zona: ZonaDestino
    label: string
    total: number
    percentual: number
  }>
  ataques: Ataque[]
}

// ─── API Response ────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}

// ─── UI ──────────────────────────────────────────────────────────────────────
export interface TimerState {
  seconds: number
  running: boolean
  pauseCount: number
  startedAt?: number
}
