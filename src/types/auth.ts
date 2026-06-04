export type UserRole = 'admin' | 'treinador'

export interface User {
  id:       string
  name:     string
  username: string
  email:    string
  role:     UserRole
  active:   boolean
  photo?:   string | null
}

export interface LoginResponse {
  access_token:  string
  refresh_token: string
  token_type:    string
  user_id:       string
  name:          string
  username:      string
  role:          UserRole
  email?:        string
  photo?:        string | null
}

export interface RefreshResponse {
  access_token: string
  token_type:   string
}
