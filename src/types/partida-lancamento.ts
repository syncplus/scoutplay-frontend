export type Tipo = 'cabeca' | 'shark'
export type Qual = 'boa' | 'media' | 'ruim'
export type Zona = 'Z1'|'Z2'|'Z3'|'Z4'|'Z5'|'Z6'|'Z7'|'Z8'|'Z9'

export interface LancamentoDTO {
  id:        string
  set_id:    string | null
  tipo:      Tipo
  qualidade: Qual
  pos_x:     number
  pos_y:     number
  zona:      Zona
}

export interface CreateLancamentoPayload {
  tipo:      Tipo
  qualidade: Qual
  pos_x:     number
  pos_y:     number
  zona:      Zona
  set_id?:   string | null
}
