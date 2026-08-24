import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { session, setUnauthorizedHandler } from '@/lib/session'
import { authApi } from './api'
import type { LoginInput, User } from './schemas'

interface AuthContextValue {
  user: User | null
  /** True while the stored token is being exchanged for a user on first load. */
  isLoading: boolean
  isAuthenticated: boolean
  login: (input: LoginInput) => Promise<void>
  logout: () => Promise<void>
  /** True when the backend granted this permission name (e.g. `patients.view`). */
  can: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [hasToken, setHasToken] = useState(() => session.getToken() !== null)

  // A 401 from any request means the session is gone; drop the user immediately.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setHasToken(false)
      queryClient.clear()
    })
    return () => setUnauthorizedHandler(null)
  }, [queryClient])

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    enabled: hasToken,
    retry: false,
    staleTime: Infinity,
  })

  const login = useCallback(
    async (input: LoginInput) => {
      const result = await authApi.login(input)
      session.setToken(result.token)
      setHasToken(true)
      queryClient.setQueryData(['auth', 'me'], result.user)
    },
    [queryClient],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      session.clear()
      setHasToken(false)
      queryClient.clear()
    }
  }, [queryClient])

  const can = useCallback(
    (permission: string) => user?.permissions.includes(permission) ?? false,
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      isLoading: hasToken && isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      can,
    }),
    [user, hasToken, isLoading, login, logout, can],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthContextValue {
  const context = use(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
