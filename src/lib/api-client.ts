/**
 * Thin fetch wrapper for the Laravel API. Injects the stored Sanctum bearer
 * token, serializes JSON bodies, and turns Laravel's error envelope
 * (`{message, errors}`) into a typed ApiError.
 *
 * Callers get back the raw parsed JSON body — Laravel's JsonResource wraps
 * single resources as `{data: T}` and collections as `{data: T[], links,
 * meta}`, so feature `*-api.ts` modules unwrap `.data` themselves rather than
 * this file guessing at the shape.
 */

const API_URL = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "")

const TOKEN_STORAGE_KEY = "zcmc_auth_token"

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.errors = errors
  }

  /** First validation message, if any — handy for a single-line toast. */
  get firstValidationMessage(): string | undefined {
    if (!this.errors) return undefined
    const firstKey = Object.keys(this.errors)[0]
    return firstKey ? this.errors[firstKey]?.[0] : undefined
  }
}

export type QueryParams = Record<
  string,
  string | number | boolean | undefined | null
>

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  params?: QueryParams
  /** Nested `filter[key]=value` params, per the backend's ListQuery contract. */
  filters?: QueryParams
  signal?: AbortSignal
}

export function buildUrl(path: string, options: RequestOptions): string {
  const cleanPath = path.replace(/^\//, "")
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(options.params ?? {})) {
    if (value === undefined || value === null || value === "") continue
    search.set(key, String(value))
  }

  for (const [key, value] of Object.entries(options.filters ?? {})) {
    if (value === undefined || value === null || value === "") continue
    search.set(`filter[${key}]`, String(value))
  }

  const qs = search.toString()
  return `${API_URL}/${cleanPath}${qs ? `?${qs}` : ""}`
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken()
  const hasBody = options.body !== undefined

  const res = await fetch(buildUrl(path, options), {
    method: options.method ?? "GET",
    signal: options.signal,
    headers: {
      Accept: "application/json",
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: hasBody ? JSON.stringify(options.body) : undefined,
  })

  if (res.status === 204) {
    return undefined as T
  }

  const contentType = res.headers.get("content-type") ?? ""
  const payload = contentType.includes("application/json")
    ? await res.json().catch(() => undefined)
    : undefined

  if (!res.ok) {
    if (res.status === 401) {
      // Stored token is gone/expired server-side — drop it so the next
      // render falls back to the login screen instead of retrying forever.
      setToken(null)
    }

    throw new ApiError(
      payload?.message ?? res.statusText ?? "Request failed",
      res.status,
      payload?.errors,
    )
  }

  return payload as T
}

/**
 * For endpoints that return a binary body (the intake sheet PDF) rather
 * than JSON — same auth header and URL building as `request`, but resolves
 * to a Blob instead of parsing JSON.
 */
export async function fetchBlob(path: string, params?: QueryParams): Promise<Blob> {
  const token = getToken()

  const res = await fetch(buildUrl(path, { params }), {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!res.ok) {
    throw new ApiError(res.statusText || "Request failed", res.status)
  }

  return res.blob()
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "POST", body }),

  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PUT", body }),

  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),
}
