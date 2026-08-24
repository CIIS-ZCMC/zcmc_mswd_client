import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-lg font-semibold text-ink">Page not found</h1>
      <p className="text-sm text-ink-muted">The page you are looking for does not exist.</p>
      <Link
        to="/"
        className="inline-flex h-10 items-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
      >
        Back to dashboard
      </Link>
    </div>
  )
}
