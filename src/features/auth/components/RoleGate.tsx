import type { ReactNode } from 'react'
import type { Role } from '@/types'
import { useAuth } from '../auth-context'

interface RoleGateProps {
  allow: Role[]
  children: ReactNode
  /** Rendered instead of `children` when the role does not match. */
  fallback?: ReactNode
}

/**
 * Conditional rendering by role. Matches against every role the user holds,
 * since the backend allows more than one. Not a security boundary — the API
 * still enforces access.
 */
export function RoleGate({ allow, children, fallback = null }: RoleGateProps) {
  const { user } = useAuth()
  const matches = user?.roles.some((role) => allow.includes(role)) ?? false
  if (!matches) return <>{fallback}</>
  return <>{children}</>
}
