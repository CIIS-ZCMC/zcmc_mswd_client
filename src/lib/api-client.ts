import axios, { AxiosError } from 'axios'
import { env } from '@/lib/env'
import { notifyUnauthorized, session } from '@/lib/session'
import { ApiError } from '@/types'

export const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

apiClient.interceptors.request.use((config) => {
  const token = session.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

interface ErrorBody {
  message?: string
  errors?: Record<string, string | string[]>
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorBody>) => {
    const status = error.response?.status ?? 0
    const body = error.response?.data

    // An expired or rejected token invalidates the whole session, except on the
    // login call itself where a 401 just means "wrong credentials".
    const isLoginAttempt = error.config?.url?.includes('/login')
    if (status === 401 && !isLoginAttempt) notifyUnauthorized()

    const fieldErrors: Record<string, string> = {}
    for (const [field, messages] of Object.entries(body?.errors ?? {})) {
      fieldErrors[field] = Array.isArray(messages) ? messages[0] : messages
    }

    const message =
      body?.message ??
      (status === 0 ? 'Cannot reach the server. Check your connection.' : error.message)

    return Promise.reject(new ApiError(message, status, fieldErrors))
  },
)
