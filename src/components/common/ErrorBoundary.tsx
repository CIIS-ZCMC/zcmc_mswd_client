import { isRouteErrorResponse, useRouteError } from 'react-router'
import { Button } from '@/components/ui/Button'
import { ApiError } from '@/types'

/** `errorElement` for every route branch — turns a thrown error into a readable page. */
export function RouteErrorBoundary() {
  const error = useRouteError()

  let title = 'Something went wrong'
  let detail = 'An unexpected error occurred. Try again, or reload the page.'

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`
    detail = typeof error.data === 'string' ? error.data : detail
  } else if (error instanceof ApiError) {
    title = error.status === 403 ? 'You do not have access to this page' : 'Request failed'
    detail = error.message
  } else if (error instanceof Error) {
    detail = error.message
  }

  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-lg font-semibold text-ink">{title}</h1>
      <p className="max-w-md text-sm text-ink-muted">{detail}</p>
      <Button variant="secondary" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </div>
  )
}
