import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FormField } from '@/components/common/FormField'
import { Spinner } from '@/components/ui/Spinner'
import { useSectors } from '@/features/lookups'
import { ApiError } from '@/types'
import {
  CIVIL_STATUSES,
  SEXES,
  patientFormSchema,
  type PatientFormInput,
  type PatientFormOutput,
} from '../schemas'

interface PatientFormProps {
  defaultValues?: Partial<PatientFormInput>
  onSubmit: (values: PatientFormOutput) => Promise<unknown>
  onCancel?: () => void
  submitLabel?: string
}

const EMPTY: PatientFormInput = {
  sector_id: '',
  hospital_id: '',
  first_name: '',
  last_name: '',
  middle_name: '',
  extension_name: '',
  sex: '',
  civil_status: '',
  birthdate: '',
  estimated_age: '',
  address: '',
  barangay: '',
  municipality: '',
  province: '',
  contact_number: '',
}

/**
 * Reference form for the whole app: Zod schema → RHF resolver → `FormField`
 * controls → server field errors mapped back with `setError`. Field names match
 * the API's, so a 422 maps onto the right input with no translation.
 *
 * Mirrors the Identity and Address sections of Filament's `PatientResource::form()`.
 */
export function PatientForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save patient',
}: PatientFormProps) {
  const { data: sectors, isLoading: sectorsLoading } = useSectors()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormInput, unknown, PatientFormOutput>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: { ...EMPTY, ...defaultValues },
  })

  async function submit(values: PatientFormOutput) {
    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof PatientFormInput, { message })
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
    <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-sm font-semibold text-ink">Identity</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Sector" required error={errors.sector_id?.message}>
            <Select {...register('sector_id')} disabled={sectorsLoading}>
              <option value="">{sectorsLoading ? 'Loading…' : 'Select a sector'}</option>
              {sectors?.map((sector) => (
                <option key={sector.value} value={sector.value}>
                  {sector.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Hospital number"
            hint="From the hospital system, if any."
            error={errors.hospital_id?.message}
          >
            <Input inputMode="numeric" {...register('hospital_id')} />
          </FormField>

          <FormField label="First name" required error={errors.first_name?.message}>
            <Input {...register('first_name')} />
          </FormField>

          <FormField label="Last name" required error={errors.last_name?.message}>
            <Input {...register('last_name')} />
          </FormField>

          <FormField label="Middle name" error={errors.middle_name?.message}>
            <Input {...register('middle_name')} />
          </FormField>

          <FormField label="Suffix" error={errors.extension_name?.message}>
            <Input {...register('extension_name')} />
          </FormField>

          <FormField label="Sex" required error={errors.sex?.message}>
            <Select {...register('sex')}>
              <option value="">Select</option>
              {SEXES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Civil status" error={errors.civil_status?.message}>
            <Select {...register('civil_status')}>
              <option value="">Select</option>
              {CIVIL_STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Date of birth" error={errors.birthdate?.message}>
            <Input type="date" {...register('birthdate')} />
          </FormField>

          <FormField
            label="Estimated age"
            hint="When the birthdate is unknown."
            error={errors.estimated_age?.message}
          >
            <Input type="number" min={0} {...register('estimated_age')} />
          </FormField>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-sm font-semibold text-ink">Address &amp; contact</legend>

        <FormField label="Address" error={errors.address?.message}>
          <Input {...register('address')} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Barangay" error={errors.barangay?.message}>
            <Input {...register('barangay')} />
          </FormField>

          <FormField label="Municipality" error={errors.municipality?.message}>
            <Input {...register('municipality')} />
          </FormField>

          <FormField label="Province" error={errors.province?.message}>
            <Input {...register('province')} />
          </FormField>

          <FormField label="Contact number" error={errors.contact_number?.message}>
            <Input inputMode="tel" {...register('contact_number')} />
          </FormField>
        </div>
      </fieldset>

      {errors.root && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.root.message}
        </p>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner className="size-4" />}
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
