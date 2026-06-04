// Shared token manager — avoids circular imports between api ↔ store
let _accessToken: string | null = null
let _onUnauthorized: (() => void) | null = null

export const tokenManager = {
  get: (): string | null => _accessToken,
  set: (token: string | null): void => { _accessToken = token },
  onUnauthorized: (handler: (() => void) | null): void => { _onUnauthorized = handler },
  handleUnauthorized: (): void => {
    _accessToken = null
    _onUnauthorized?.()
  },
}
