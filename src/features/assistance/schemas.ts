import { z } from 'zod'

/** Decimals arrive from Laravel as strings ("1500.00"); normalize to a number. */
const decimal = z
  .union([z.string(), z.number()])
  .nullish()
  .transform((value) => (value == null || value === '' ? null : Number(value)))

export const apiAssistanceSchema = z.object({
  id: z.number(),
  case_id: z.number().nullish(),
  assistant_type_id: z.number().nullish(),
  assistant_type: z.string().nullish(),
  guarantor_id: z.number().nullish(),
  guarantor: z.string().nullish(),
  amount: decimal,
  notes: z.string().nullish(),
  date_given: z.string().nullish(),
  status: z.string().nullish(),
  created_at: z.string().nullish(),
})

export const assistanceSchema = apiAssistanceSchema.transform((r) => ({
  id: String(r.id),
  caseId: r.case_id == null ? null : String(r.case_id),
  assistantTypeId: r.assistant_type_id == null ? null : String(r.assistant_type_id),
  assistantType: r.assistant_type ?? null,
  guarantorId: r.guarantor_id == null ? null : String(r.guarantor_id),
  guarantor: r.guarantor ?? null,
  amount: r.amount,
  notes: r.notes ?? null,
  dateGiven: r.date_given ?? null,
  status: r.status ?? null,
  createdAt: r.created_at ?? null,
}))

export type Assistance = z.output<typeof assistanceSchema>

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === '' ? undefined : value))

/** Mirrors `StorePatientAssistanceRequest`. */
export const assistanceFormSchema = z.object({
  assistant_type_id: z.string().min(1, 'Assistance type is required'),
  guarantor_id: optionalText,
  amount: optionalText.refine((value) => !value || Number(value) >= 0, 'Amount cannot be negative'),
  notes: optionalText,
  date_given: optionalText,
})

export type AssistanceFormInput = z.input<typeof assistanceFormSchema>
export type AssistanceFormOutput = z.output<typeof assistanceFormSchema>

/** Badge tone per lifecycle status (pending → approved → released, or cancelled). */
export function assistanceTone(status: string | null): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  switch (status) {
    case 'released':
      return 'success'
    case 'approved':
      return 'info'
    case 'pending':
      return 'warning'
    case 'cancelled':
      return 'danger'
    default:
      return 'neutral'
  }
}
