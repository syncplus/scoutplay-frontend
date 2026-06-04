export interface SetDTO {
  id:                string
  numero:            number
  pontos_jogador:    number
  pontos_adversario: number
  tempo:             number
}

export interface CreateSetPayload {
  pontos_jogador:    number
  pontos_adversario: number
  tempo:             number
}
