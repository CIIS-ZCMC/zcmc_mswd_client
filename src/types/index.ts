/**
 * Roles seeded by the MSWD backend (`RolesAndPermissionsSeeder::ROLES`),
 * ordered loosely by privilege. Roles are editable through the API, so any
 * string is accepted — the union exists for autocompletion, not validation.
 */
export const ROLES = ['Admin', 'MSS Head', 'Supervisor', 'Case Manager', 'Processor'] as const

export type Role = (typeof ROLES)[number] | (string & {})

/** Standard envelope for paginated list endpoints. */
export interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

/** Query parameters shared by every list endpoint. */
export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

/**
 * Normalized API failure. Every rejection out of `apiClient` is one of these,
 * so callers never have to unwrap an AxiosError.
 */
export class ApiError extends Error {
  readonly status: number
  /** Field-level validation errors, keyed by form field name. */
  readonly fieldErrors: Record<string, string>

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}
