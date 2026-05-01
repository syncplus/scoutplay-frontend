export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },

  // Users (admin)
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    TOGGLE_ACTIVE: (id: string) => `/users/${id}/toggle-active`,
  },

  // Partidas
  PARTIDAS: {
    LIST: '/partidas',
    CREATE: '/partidas',
    GET: (id: string) => `/partidas/${id}`,
    UPDATE: (id: string) => `/partidas/${id}`,
    DELETE: (id: string) => `/partidas/${id}`,
    START: (id: string) => `/partidas/${id}/start`,
    PAUSE: (id: string) => `/partidas/${id}/pause`,
    RESUME: (id: string) => `/partidas/${id}/resume`,
    FINISH: (id: string) => `/partidas/${id}/finish`,
    STATS: (id: string) => `/partidas/${id}/stats`,
    EXPORT: (id: string) => `/partidas/${id}/export`,
    IMPORT: '/partidas/import',
  },

  // Sets
  SETS: {
    CREATE: (partidaId: string) => `/partidas/${partidaId}/sets`,
    LIST: (partidaId: string) => `/partidas/${partidaId}/sets`,
  },

  // Ataques
  ATAQUES: {
    LIST: (partidaId: string) => `/partidas/${partidaId}/ataques`,
    CREATE: (partidaId: string) => `/partidas/${partidaId}/ataques`,
    DELETE: (partidaId: string, ataqueId: string) =>
      `/partidas/${partidaId}/ataques/${ataqueId}`,
    UNDO_LAST: (partidaId: string) => `/partidas/${partidaId}/ataques/undo`,
  },
} as const
