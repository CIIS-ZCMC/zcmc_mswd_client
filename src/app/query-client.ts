import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/types'

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        // Client errors (bad request, forbidden, not found) will never succeed
        // on retry — only retry transient server/network failures, and only once.
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
          return failureCount < 1
        },
      },
      mutations: { retry: false },
    },
  })
}
