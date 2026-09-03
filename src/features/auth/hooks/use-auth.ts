import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { type ApiError, getToken } from "@/lib/api-client"
import { getMe, login, logout } from "../api/auth-api"
import type { AuthUser, LoginPayload } from "../types/auth.types"

export const AUTH_QUERY_KEY = ["auth", "me"] as const

/**
 * Single source of truth for "who is logged in". Backed by TanStack Query so
 * every component calling useAuth() shares the same cached user instead of
 * each holding its own copy.
 *
 * The `me` query only runs when a token is already in storage — on a fresh
 * visit with no token there's nothing to ask the server, so App.tsx can go
 * straight to the login screen without a loading flash.
 */
export function useAuth() {
  const queryClient = useQueryClient()
  const hasStoredToken = Boolean(getToken())

  const meQuery = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getMe,
    enabled: hasStoredToken,
    retry: false,
    staleTime: Infinity,
  })

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (user: AuthUser) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null)
      // Every other feature's cached data (patients, cases, ...) belongs to
      // the session that just ended — drop it so the next login starts clean.
      queryClient.clear()
    },
  })

  return {
    user: meQuery.data ?? null,
    // Only show a boot-time spinner when we actually have a token to redeem.
    isLoading: hasStoredToken && meQuery.isPending,
    isAuthenticated: Boolean(meQuery.data),
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: (loginMutation.error as ApiError | null) ?? null,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  }
}
