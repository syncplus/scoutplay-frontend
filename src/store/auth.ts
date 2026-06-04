import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { tokenManager } from '@/lib/token'
import { authService } from '@/services/auth'
import type { User } from '@/types/auth'

interface AuthState {
  user:         User | null
  accessToken:  string | null
  refreshToken: string | null
  isLoading:    boolean
  login:        (identifier: string, password: string) => Promise<void>
  logout:       () => void
  updateUser:   (patch: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:         null,
      accessToken:  null,
      refreshToken: null,
      isLoading:    false,

      login: async (identifier, password) => {
        set({ isLoading: true })
        try {
          const res = await authService.login(identifier, password)
          tokenManager.set(res.access_token)
          set({
            accessToken:  res.access_token,
            refreshToken: res.refresh_token,
            user: {
              id:       res.user_id,
              name:     res.name,
              username: res.username,
              email:    res.email ?? '',
              role:     res.role,
              active:   true,
              photo:    res.photo ?? null,
            },
            isLoading: false,
          })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      logout: () => {
        tokenManager.set(null)
        set({ user: null, accessToken: null, refreshToken: null })
      },

      updateUser: (patch) => set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),
    }),
    {
      name:    'scoutplay-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user:         state.user,
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)

// Sync token on every state change (covers rehydration from localStorage)
useAuthStore.subscribe((state) => {
  tokenManager.set(state.accessToken)
})
