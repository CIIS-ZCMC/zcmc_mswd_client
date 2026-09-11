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

/**
 * Mirrors `UserResource`. Note there is no `name` — the display field is
 * `employee_name`, and reading `name` yields `undefined` for every row.
 */
export interface SystemUser {
  id: number
  employee_name: string | null
  employee_number?: number | null
  email?: string | null
  role?: string | null
  is_active?: boolean
}

/**
 * GET /users — staff for the caretaker assignment pickers. Paginated by
 * `ListQuery`, so the rows are under `data`.
 *
 * Deliberately does not catch: the endpoint is gated on `users.view`, which
 * Case Manager and Processor do not hold. Swallowing that 403 made an
 * authorization failure indistinguishable from "no staff exist" — an empty
 * picker with nothing to explain it. Let the error reach the query so the
 * caller can say which it is.
 */
export async function getUsers(): Promise<SystemUser[]> {
  const res = await apiClient.get<{ data: SystemUser[] }>("/users", {
    params: { per_page: 100 },
  })

  return res.data ?? []
}

/** The label to show for a staff row; never blank, never invented. */
export function userDisplayName(user: SystemUser): string {
  return user.employee_name?.trim() || `User #${user.id}`
}

