import { z } from 'zod'

export const REFERRAL_SOURCES = [
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'ward_referral', label: 'Ward referral' },
  { value: 'mswdo', label: 'MSWDO' },
  { value: 'others', label: 'Others' },
] as const

export const apiIntakeSheetSchema = z.object({
  id: z.number(),
  intake_no: z.string(),
  status: z.string().nullish(),
  referral_source: z.string().nullish(),
  date_of_intake: z.string().nullish(),
  remarks: z.string().nullish(),
  patient_id: z.number().nullish(),
  case_id: z.number().nullish(),
  created_at: z.string().nullish(),
})

export const intakeSheetSchema = apiIntakeSheetSchema.transform((r) => ({
  id: String(r.id),
  intakeNo: r.intake_no,
  status: r.status ?? null,
  referralSource: r.referral_source ?? null,
  dateOfIntake: r.date_of_intake ?? null,
  remarks: r.remarks ?? null,
  patientId: r.patient_id == null ? null : String(r.patient_id),
  caseId: r.case_id == null ? null : String(r.case_id),
  createdAt: r.created_at ?? null,
}))

export type IntakeSheet = z.output<typeof intakeSheetSchema>

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === '' ? undefined : value))

/**
 * The subset of `StoreUnifiedIntakeSheetRequest` this form collects: an
 * existing patient, plus either an existing case or a new one, plus the intake
 * header. The full seven-step wizard (family, IDs, assistance repeaters) is
 * Phase 3 — this covers opening a sheet against a patient already on file.
 *
 * The request enforces `case_id` xor `case`, so exactly one must be sent.
 */
export const intakeFormSchema = z
  .object({
    patient_id: z.string().min(1, 'Patient is required'),
    /** Empty means "open a new case", which requires the case fields below. */
    case_id: optionalText,
    case_type: optionalText,
    priority_level: optionalText,
    admission_type: optionalText,
    referral_source: optionalText,
    date_of_intake: optionalText,
    remarks: optionalText,
  })
  .superRefine((values, ctx) => {
    if (values.case_id) return

    // No existing case chosen, so the new-case fields become required.
    for (const [field, label] of [
      ['case_type', 'Case type'],
      ['priority_level', 'Priority'],
      ['admission_type', 'Admission type'],
    ] as const) {
      if (!values[field]) {
        ctx.addIssue({ code: 'custom', path: [field], message: `${label} is required` })
      }
    }
  })

export type IntakeFormInput = z.input<typeof intakeFormSchema>
export type IntakeFormOutput = z.output<typeof intakeFormSchema>

export function intakeTone(status: string | null): 'success' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'finalized':
      return 'success'
    case 'submitted':
      return 'warning'
    case 'cancelled':
      return 'danger'
    default:
      return 'neutral'
  }
}
