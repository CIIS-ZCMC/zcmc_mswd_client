import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ApiError } from '@/types'

export type ToastTone = 'success' | 'danger' | 'warning' | 'info'

interface Toast {
  id: number
  tone: ToastTone
  title: string
  body?: string
}

interface ToastContextValue {
  notify: (toast: Omit<Toast, 'id'>) => void
  /** Report a failed request, surfacing the server's own message. */
  notifyError: (error: unknown, fallbackTitle?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TONE_ICON = {
  success: CheckCircle2,
  danger: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const

const TONE_CLASS = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  danger: 'border-red-200 bg-red-50 text-red-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'border-brand-200 bg-brand-50 text-brand-900',
} as const

const DISMISS_AFTER = 5000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = nextId.current++
      setToasts((current) => [...current, { ...toast, id }])
      setTimeout(() => dismiss(id), DISMISS_AFTER)
    },
    [dismiss],
  )

  const notifyError = useCallback(
    (error: unknown, fallbackTitle = 'Something went wrong') => {
      // The API normalizes failures into ApiError, so the server's message (and
      // the first field error, for a 422) is what the user should see —
      // mirroring how Filament surfaces a ValidationException.
      if (error instanceof ApiError) {
        const firstFieldError = Object.values(error.fieldErrors)[0]
        notify({ tone: 'danger', title: fallbackTitle, body: firstFieldError ?? error.message })
        return
      }
      notify({ tone: 'danger', title: fallbackTitle })
    },
    [notify],
  )

  const value = useMemo(() => ({ notify, notifyError }), [notify, notifyError])

  return (
    <ToastContext value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((toast) => {
          const Icon = TONE_ICON[toast.tone]
          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-sm',
                TONE_CLASS[toast.tone],
              )}
            >
              <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{toast.title}</p>
                {toast.body && <p className="mt-0.5 text-sm opacity-80">{toast.body}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
                className="opacity-60 hover:opacity-100"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext>
  )
}

export function useToast(): ToastContextValue {
  const context = use(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}
