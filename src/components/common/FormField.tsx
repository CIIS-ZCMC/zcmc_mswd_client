import { useId, type ReactElement, cloneElement } from 'react'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  /** Message from RHF's `formState.errors.<name>?.message`. */
  error?: string
  hint?: string
  required?: boolean
  className?: string
  /** A single control — it receives `id`, `invalid` and `aria-describedby`. */
  children: ReactElement<{ id?: string; invalid?: boolean; 'aria-describedby'?: string }>
}

/**
 * Label + control + error, wired together for screen readers. Every form in the
 * app renders its fields through this so validation UI stays consistent.
 */
export function FormField({
  label,
  error,
  hint,
  required,
  className,
  children,
}: FormFieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  const message = error ?? hint

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && (
          <span className="ml-0.5 text-red-600" aria-hidden>
            *
          </span>
        )}
      </label>
      {cloneElement(children, {
        id,
        invalid: Boolean(error),
        'aria-describedby': message ? messageId : undefined,
      })}
      {message && (
        <p
          id={messageId}
          role={error ? 'alert' : undefined}
          className={cn('text-xs', error ? 'text-red-600' : 'text-ink-muted')}
        >
          {message}
        </p>
      )}
    </div>
  )
}
