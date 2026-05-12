// Shared token manager — avoids circular imports between api ↔ store
let _accessToken: string | null = null

export const tokenManager = {
  get: (): string | null => _accessToken,
  set: (token: string | null): void => { _accessToken = token },
}
