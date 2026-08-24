import { Navigate, Outlet, useLocation } from 'react-router'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '../auth-context'

/** Route guard: sends anonymous visitors to /login and remembers where they were headed. */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-6" label="Checking your session" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}
