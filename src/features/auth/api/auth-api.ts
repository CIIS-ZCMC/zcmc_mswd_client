import { apiClient, setToken } from "@/lib/api-client"
import type { AuthUser, LoginPayload } from "../types/auth.types"

interface UserEnvelope {
  data: AuthUser
}

interface LoginResponse extends UserEnvelope {
  token: string
  token_type: string
}

/**
 * POST /login — issues a Sanctum bearer token. Persists it before returning
 * so the caller can immediately fire authenticated requests (e.g. the
 * `me` query TanStack Query seeds right after).
 */
export async function login(payload: LoginPayload): Promise<AuthUser> {
  const res = await apiClient.post<LoginResponse>("/login", payload)
  setToken(res.token)
  return res.data
}

/**
 * GET /me — turns a stored token back into a user + roles + permissions.
 * Called on app boot when a token is already in storage.
 */
export async function getMe(): Promise<AuthUser> {
  const res = await apiClient.get<UserEnvelope>("/me")
  return res.data
}

/**
 * POST /logout — revokes the current token server-side. The stored token is
 * cleared regardless of whether the request succeeds (e.g. it already
 * expired), so the user can always get back to the login screen.
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post<void>("/logout")
  } finally {
    setToken(null)
  }
}
