import { useEffect, useId, type ReactNode } from 'react'
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Path,
  type UseFormReturn,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodType } from 'zod'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/toast-context'
import { ApiError } from '@/types'

interface RecordFormModalProps<TInput extends FieldValues, TOutput> {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  submitLabel?: string
  successMessage: string
  /** Zod schema whose input drives the fields and whose output is submitted. */
  schema: ZodType<TOutput, TInput>
  defaultValues: DefaultValues<TInput>
  onSubmit: (values: TOutput) => Promise<unknown>
  /** Renders the fields, given the RHF instance. */
  children: (form: UseFormReturn<TInput, unknown, TOutput>) => ReactNode
}

/**
 * A create form in a dialog: Zod schema → RHF resolver → fields → server field
 * errors mapped back onto the matching inputs, then a success toast.
 *
 * Every "add record" form goes through this so validation, error surfacing and
 * reset-on-close behave the same everywhere.
 */
export function RecordFormModal<TInput extends FieldValues, TOutput>({
  open,
  onClose,
  title,
  description,
  submitLabel = 'Save',
  successMessage,
  schema,
  defaultValues,
  onSubmit,
  children,
}: RecordFormModalProps<TInput, TOutput>) {
  const { notify } = useToast()
  // Every mounted modal renders its own form, and all four live in the DOM at
  // once (a closed <dialog> still renders). A shared id would make the footer's
  // `form=` attribute resolve to whichever form came first in the document.
  const formId = useId()

  const form = useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const {
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = form

  // Reopening should start clean rather than showing the last attempt.
  useEffect(() => {
    if (open) reset(defaultValues)
    // `defaultValues` is rebuilt per render by callers; keying off `open` is
    // what makes this a reset-on-open rather than a reset-on-every-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reset])

  async function submit(values: TOutput) {
    try {
      await onSubmit(values)
      notify({ tone: 'success', title: successMessage })
      onClose()
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as Path<TInput>, { message })
        }
        if (!Object.keys(error.fieldErrors).length) {
          setError('root', { message: error.message })
        }
      } else {
        setError('root', { message: 'Could not save the record. Please try again.' })
      }
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      className="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={isSubmitting}>
            {isSubmitting && <Spinner className="size-4" />}
            {isSubmitting ? 'Saving…' : submitLabel}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
        {children(form)}

        {errors.root && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {errors.root.message}
          </p>
        )}
      </form>
    </Modal>
  )
}
