import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  className?: string
}

/**
 * Dialog built on `<dialog>`, so focus trapping, Escape and the top layer come
 * from the platform rather than from us.
 */
export function Modal({ open, onClose, title, description, children, footer, className }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  // Escape closes the dialog natively; mirror that back into React state.
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    const handleCancel = (event: Event) => {
      event.preventDefault()
      onClose()
    }
    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [onClose])

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      className={cn(
        'w-full max-w-lg rounded-xl border border-border bg-card p-0 text-foreground shadow-lg',
        'backdrop:bg-black/40 backdrop:backdrop-blur-xs',
        className,
      )}
      // A click landing on the dialog itself (not its content) is the backdrop.
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 id="modal-title" className="text-base font-bold tracking-tight text-foreground">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
          <X className="size-4" aria-hidden />
        </Button>
      </div>

      {children && <div className="px-5 py-4">{children}</div>}

      {footer && (
        <div className="flex justify-end gap-2 border-t border-border bg-muted/20 px-5 py-4">{footer}</div>
      )}
    </dialog>
  )
}
