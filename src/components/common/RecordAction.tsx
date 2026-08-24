import { useState, type ReactNode } from 'react'
import { Button, type ButtonProps } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toast-context'

interface RecordActionProps<TInput> {
  label: string
  icon?: ReactNode
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  /** Hide entirely — use for permission and state gating, as Filament's `visible()` does. */
  visible?: boolean
  /** Confirmation copy. Omit both this and `form` to run immediately. */
  confirm?: { title: string; description?: string; confirmLabel?: string }
  /**
   * Render a form inside the confirmation dialog. Receives a setter for the
   * payload passed to `onRun`, mirroring Filament's `->schema([...])` actions.
   */
  form?: (args: { value: TInput; onChange: (value: TInput) => void }) => ReactNode
  /** Initial payload when `form` is used. */
  initialValue?: TInput
  /** Disable the confirm button until the payload is complete. */
  isValid?: (value: TInput) => boolean
  onRun: (value: TInput) => Promise<unknown>
  successMessage?: string
  errorMessage?: string
}

/**
 * One record action: a button that optionally confirms, optionally collects a
 * small payload, runs a mutation, then reports the outcome as a toast.
 *
 * This is the client's counterpart to a Filament `Action` — the same primitive
 * backs plain confirms (close, archive, finalize) and form actions (assign,
 * refer, merge).
 */
export function RecordAction<TInput = void>({
  label,
  icon,
  variant = 'secondary',
  size = 'sm',
  visible = true,
  confirm,
  form,
  initialValue,
  isValid,
  onRun,
  successMessage,
  errorMessage,
}: RecordActionProps<TInput>) {
  const { notify, notifyError } = useToast()
  const [open, setOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const [value, setValue] = useState<TInput>(initialValue as TInput)

  if (!visible) return null

  const needsDialog = Boolean(confirm ?? form)

  async function run(payload: TInput) {
    setRunning(true)
    try {
      await onRun(payload)
      if (successMessage) notify({ tone: 'success', title: successMessage })
      setOpen(false)
      setValue(initialValue as TInput)
    } catch (error) {
      // Stay open on failure so the user can correct the input and retry.
      notifyError(error, errorMessage ?? `Could not ${label.toLowerCase()}`)
    } finally {
      setRunning(false)
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        disabled={running}
        onClick={() => {
          if (needsDialog) {
            setValue(initialValue as TInput)
            setOpen(true)
          } else {
            void run(initialValue as TInput)
          }
        }}
      >
        {icon}
        {label}
      </Button>

      {needsDialog && (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title={confirm?.title ?? label}
          description={confirm?.description}
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)} disabled={running}>
                Cancel
              </Button>
              <Button
                variant={variant === 'danger' ? 'danger' : 'primary'}
                disabled={running || (isValid ? !isValid(value) : false)}
                onClick={() => void run(value)}
              >
                {running ? 'Working…' : (confirm?.confirmLabel ?? label)}
              </Button>
            </>
          }
        >
          {form?.({ value, onChange: setValue })}
        </Modal>
      )}
    </>
  )
}
