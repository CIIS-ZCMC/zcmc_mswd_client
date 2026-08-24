import { z } from 'zod'

/** Option lists mirroring the constants on Filament's `CaseResource`. */
export const CASE_TYPES = [
  { value: 'medical', label: 'Medical' },
  { value: 'financial', label: 'Financial' },
  { value: 'psychosocial', label: 'Psychosocial' },
  { value: 'others', label: 'Others' },
] as const

export const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const

export const ADMISSION_TYPES = [
  { value: 'OPD', label: 'OPD' },
  { value: 'ER', label: 'ER' },
  { value: 'inpatient', label: 'Inpatient' },
] as const

export const CLASSIFICATIONS = [
  { value: 'indigent', label: 'Indigent' },
  { value: 'low_income', label: 'Low income' },
  { value: 'self_sufficient', label: 'Self-sufficient' },
  { value: 'others', label: 'Others' },
] as const

/** Statuses a case can be attached to by a new intake sheet. */
export const OPEN_STATUSES = ['open', 'ongoing']

export const apiCaseSchema = z.object({
  id: z.number(),
  case_code: z.string(),
  patient_id: z.number().nullish(),
  assigned_user_id: z.number().nullish(),
  assigned_user: z.object({ id: z.number().nullish(), name: z.string().nullish() }).nullish(),
  case_type: z.string().nullish(),
  priority_level: z.string().nullish(),
  status: z.string().nullish(),
  admission_type: z.string().nullish(),
  date_opened: z.string().nullish(),
  date_closed: z.string().nullish(),
})

type ApiCase = z.infer<typeof apiCaseSchema>

export interface CaseRecord {
  id: string
  caseCode: string
  patientId: string | null
  assignedUserName: string | null
  caseType: string | null
  priorityLevel: string | null
  status: string | null
  admissionType: string | null
  dateOpened: string | null
  dateClosed: string | null
}

function toCase(api: ApiCase): CaseRecord {
  return {
    id: String(api.id),
    caseCode: api.case_code,
    patientId: api.patient_id == null ? null : String(api.patient_id),
    assignedUserName: api.assigned_user?.name ?? null,
    caseType: api.case_type ?? null,
    priorityLevel: api.priority_level ?? null,
    status: api.status ?? null,
    admissionType: api.admission_type ?? null,
    dateOpened: api.date_opened ?? null,
    dateClosed: api.date_closed ?? null,
  }
}

export const caseSchema = apiCaseSchema.transform(toCase)

/** Assessments are case-scoped clinical records (Filament: a Case relation manager). */
export const assessmentSchema = z
  .object({
    id: z.number(),
    case_id: z.number().nullish(),
    classification: z.string().nullish(),
    total_family_income: z.union([z.string(), z.number()]).nullish(),
    presenting_problem: z.string().nullish(),
    family_background: z.string().nullish(),
    intervention_plan: z.string().nullish(),
    created_at: z.string().nullish(),
  })
  .transform((r) => ({
    id: String(r.id),
    caseId: r.case_id == null ? null : String(r.case_id),
    classification: r.classification ?? null,
    totalFamilyIncome:
      r.total_family_income == null || r.total_family_income === ''
        ? null
        : Number(r.total_family_income),
    presentingProblem: r.presenting_problem ?? null,
    familyBackground: r.family_background ?? null,
    interventionPlan: r.intervention_plan ?? null,
    createdAt: r.created_at ?? null,
  }))

export type Assessment = z.output<typeof assessmentSchema>

/* -------------------------------------------------------------------------- */
/* Write payloads — field names match the API so a 422 maps straight onto them */
/* -------------------------------------------------------------------------- */

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === '' ? undefined : value))

/** Mirrors `StoreCaseModelRequest`. `assigned_user_id` defaults to the caller. */
export const caseFormSchema = z.object({
  patient_id: z.string().min(1, 'Patient is required'),
  case_type: z.string().min(1, 'Case type is required'),
  priority_level: z.string().min(1, 'Priority is required'),
  admission_type: z.string().min(1, 'Admission type is required'),
  date_opened: optionalText,
  assigned_user_id: optionalText,
})

/** Mirrors `StoreAssessmentRequest`. */
export const assessmentFormSchema = z.object({
  classification: z.string().min(1, 'Classification is required'),
  total_family_income: optionalText.refine(
    (value) => !value || Number(value) >= 0,
    'Income cannot be negative',
  ),
  presenting_problem: optionalText,
  family_background: optionalText,
  intervention_plan: optionalText,
})

export type CaseFormInput = z.input<typeof caseFormSchema>
export type CaseFormOutput = z.output<typeof caseFormSchema>
export type AssessmentFormInput = z.input<typeof assessmentFormSchema>
export type AssessmentFormOutput = z.output<typeof assessmentFormSchema>

/** Badge tone for a case status, matching the colours Filament uses. */
export function statusTone(status: string | null): 'success' | 'warning' | 'neutral' | 'info' {
  switch (status) {
    case 'open':
      return 'success'
    case 'ongoing':
      return 'warning'
    case 'referred':
      return 'info'
    default:
      return 'neutral'
  }
}

export function priorityTone(priority: string | null): 'danger' | 'warning' | 'neutral' {
  switch (priority) {
    case 'high':
      return 'danger'
    case 'medium':
      return 'warning'
    default:
      return 'neutral'
  }
}
