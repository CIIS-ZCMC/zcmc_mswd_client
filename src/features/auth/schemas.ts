import { z } from 'zod'
import type { Role } from '@/types'

/**
 * The user payload as the Laravel API sends it (`App\Http\Resources\UserResource`).
 * Snake_case, numeric id, and role/permission names from Spatie. `roles` and
 * `permissions` are conditional on the server, so both are optional here.
 */
const apiUserSchema = z.object({
  id: z.number(),
  // Both employee columns come from UMIS and arrive as numbers or strings.
  employee_id: z.union([z.string(), z.number()]).nullish(),
  employee_number: z.union([z.string(), z.number()]).nullish(),
  employee_name: z.string(),
  email: z.string(),
  role: z.string().nullish(),
  roles: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
  is_active: z.boolean(),
})

type ApiUser = z.infer<typeof apiUserSchema>

/** The user as the rest of the app consumes it. */
export interface User {
  id: string
  employeeNumber: string | null
  name: string
  email: string
  /** Primary role cached by the backend. Null until a role is assigned. */
  role: Role | null
  /** Every role assigned to the user. */
  roles: Role[]
  /** Flattened permission names, used by `can()`. */
  permissions: string[]
  isActive: boolean
}

function toUser(api: ApiUser): User {
  return {
    id: String(api.id),
    employeeNumber: api.employee_number == null ? null : String(api.employee_number),
    name: api.employee_name,
    email: api.email,
    role: api.role ?? null,
    roles: api.roles ?? (api.role ? [api.role] : []),
    permissions: api.permissions ?? [],
    isActive: api.is_active,
  }
}

/** `GET /me` — a resource response, so the user sits under `data`. */
export const userResponseSchema = z.object({ data: apiUserSchema }).transform(({ data }) => toUser(data))

/** `POST /login` — the same resource plus the Sanctum token alongside it. */
export const loginResponseSchema = z
  .object({
    data: apiUserSchema,
    token: z.string(),
    token_type: z.string().optional(),
  })
  .transform(({ data, token }) => ({ token, user: toUser(data) }))

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
