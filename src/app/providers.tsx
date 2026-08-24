import { Suspense, type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from '@/features/auth'
import { ToastProvider } from '@/components/ui/toast-context'
import { env } from '@/lib/env'
import { createQueryClient } from './query-client'

const queryClient = createQueryClient()

/**
 * The provider tree, ordered outside-in: query cache, then toasts (so any
 * layer below can report an outcome), then auth (which reads from that cache),
 * then the app.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </AuthProvider>
      </ToastProvider>
      {env.VITE_APP_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
