/**
 * Token storage, kept outside React so the axios interceptors can reach it
 * without a hook. The auth context is the only thing that should write here.
 */
const TOKEN_KEY = 'zcmc_mswd_token'

let token: string | null = null

export const session = {
  getToken(): string | null {
    if (token === null) token = localStorage.getItem(TOKEN_KEY)
    return token
  },

  setToken(next: string): void {
    token = next
    localStorage.setItem(TOKEN_KEY, next)
  },

  clear(): void {
    token = null
    localStorage.removeItem(TOKEN_KEY)
  },
}

/** Subscribers notified when the API layer detects an expired session. */
type UnauthorizedHandler = () => void
let onUnauthorized: UnauthorizedHandler | null = null

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler
}

export function notifyUnauthorized(): void {
  session.clear()
  onUnauthorized?.()
}
