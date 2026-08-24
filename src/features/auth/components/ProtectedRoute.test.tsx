import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { session } from '@/lib/session'
import { AuthProvider } from '../auth-context'
import { ProtectedRoute } from './ProtectedRoute'

function renderRoutes(initialEntry: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path: '/login', element: <p>Login screen</p> },
      { element: <ProtectedRoute />, children: [{ path: '/', element: <p>Dashboard</p> }] },
    ],
    { initialEntries: [initialEntry] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe('ProtectedRoute', () => {
  it('redirects to the login screen when there is no session', async () => {
    renderRoutes('/')
    expect(await screen.findByText('Login screen')).toBeInTheDocument()
  })

  it('renders the protected page once the stored token resolves to a user', async () => {
    session.setToken('test-token')
    renderRoutes('/')
    expect(await screen.findByText('Dashboard')).toBeInTheDocument()
  })
})
