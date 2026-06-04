import type { SetDTO } from './partida-set'
import type { LancamentoDTO } from './partida-lancamento'

export type Status = 'wait' | 'prog' | 'done'
export type Lado   = 'Esq' | 'Dir'

export interface PartidaDTO {
  id:         string
  user_id:    string
  user_name:  string | null
  jogador:    string
  adversario: string | null
  fase:       string
  lado:       Lado
  status:     Status
  data:       string | null   // ISO yyyy-mm-dd
  ataques:    number
  tempo:      number          // segundos
}

export interface PartidaDetailDTO extends PartidaDTO {
  sets:        SetDTO[]
  lancamentos: LancamentoDTO[]
}

export interface CreatePartidaPayload {
  jogador:     string
  fase:        string
  lado:        Lado
  adversario?: string | null
  data?:       string | null
}

export interface UpdatePartidaPayload {
  jogador?:    string
  adversario?: string | null
  fase?:       string
  lado?:       Lado
  status?:     Status
  data?:       string | null
  tempo?:      number
}
