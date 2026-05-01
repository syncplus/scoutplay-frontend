import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const createPartidaSchema = z.object({
  jogador: z.string().min(2, 'Nome do jogador obrigatório'),
  adversario: z.string().optional(),
  fase: z.string().min(2, 'Fase/partida obrigatória'),
  lado: z.enum(['esquerda', 'direita'], { required_error: 'Selecione o lado' }),
  data: z.string().min(1, 'Data obrigatória'),
  observacoes: z.string().optional(),
})

export const createUserSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['admin', 'scout']),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type CreatePartidaFormData = z.infer<typeof createPartidaSchema>
export type CreateUserFormData = z.infer<typeof createUserSchema>
