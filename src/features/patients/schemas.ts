import { z } from 'zod'

/**
 * Patients as `App\Http\Resources\PatientResource` sends them: snake_case, a
 * numeric id, and decimals serialized as strings. Parse that shape here, then
 * map to the camelCase types the app uses.
 */

/** Laravel casts decimals to strings; accept either and normalize to a number. */
const decimal = z
  .union([z.string(), z.number()])
  .nullish()
  .transform((value) => (value == null || value === '' ? null : Number(value)))

/** `hospital_id` / `mswd_id` are integers in the DB but display as text. */
const idNumber = z
  .union([z.string(), z.number()])
  .nullish()
  .transform((value) => (value == null ? null : String(value)))

export const SEXES = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
] as const

export const CIVIL_STATUSES = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'separated', label: 'Separated' },
] as const

const sectorSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullish(),
})

export const apiPatientSchema = z.object({
  id: z.number(),
  sector_id: z.number().nullish(),
  hospital_id: idNumber,
  mswd_id: idNumber,
  first_name: z.string(),
  last_name: z.string(),
  middle_name: z.string().nullish(),
  extension_name: z.string().nullish(),
  birthdate: z.string().nullish(),
  estimated_age: z.number().nullish(),
  sex: z.string(),
  civil_status: z.string().nullish(),
  address: z.string().nullish(),
  barangay: z.string().nullish(),
  municipality: z.string().nullish(),
  province: z.string().nullish(),
  contact_number: z.string().nullish(),
  archived_at: z.string().nullish(),
  cases_count: z.number().nullish(),
  patient_ids_count: z.number().nullish(),
  family_members_count: z.number().nullish(),
  watchers_count: z.number().nullish(),
  documents_count: z.number().nullish(),
  sector: sectorSchema.nullish(),
  created_at: z.string().nullish(),
})

type ApiPatient = z.infer<typeof apiPatientSchema>

export interface Patient {
  id: string
  sectorId: string | null
  sectorName: string | null
  hospitalId: string | null
  mswdId: string | null
  firstName: string
  lastName: string
  middleName: string | null
  extensionName: string | null
  birthdate: string | null
  estimatedAge: number | null
  sex: string
  civilStatus: string | null
  address: string | null
  barangay: string | null
  municipality: string | null
  province: string | null
  contactNumber: string | null
  /** Set when the patient is soft-deleted; drives the archived badge. */
  archivedAt: string | null
  isArchived: boolean
  counts: {
    cases: number | null
    ids: number | null
    familyMembers: number | null
    watchers: number | null
    documents: number | null
  }
  createdAt: string | null
}

function toPatient(api: ApiPatient): Patient {
  return {
    id: String(api.id),
    sectorId: api.sector_id == null ? null : String(api.sector_id),
    sectorName: api.sector?.name ?? null,
    hospitalId: api.hospital_id,
    mswdId: api.mswd_id,
    firstName: api.first_name,
    lastName: api.last_name,
    middleName: api.middle_name ?? null,
    extensionName: api.extension_name ?? null,
    birthdate: api.birthdate ?? null,
    estimatedAge: api.estimated_age ?? null,
    sex: api.sex,
    civilStatus: api.civil_status ?? null,
    address: api.address ?? null,
    barangay: api.barangay ?? null,
    municipality: api.municipality ?? null,
    province: api.province ?? null,
    contactNumber: api.contact_number ?? null,
    archivedAt: api.archived_at ?? null,
    isArchived: Boolean(api.archived_at),
    counts: {
      cases: api.cases_count ?? null,
      ids: api.patient_ids_count ?? null,
      familyMembers: api.family_members_count ?? null,
      watchers: api.watchers_count ?? null,
      documents: api.documents_count ?? null,
    },
    createdAt: api.created_at ?? null,
  }
}

export const patientSchema = apiPatientSchema.transform(toPatient)

/* -------------------------------------------------------------------------- */
/* Related records                                                            */
/* -------------------------------------------------------------------------- */

export const patientIdSchema = z
  .object({
    id: z.number(),
    id_type: z.string(),
    id_number: z.string(),
    date_issued: z.string().nullish(),
    date_expiry: z.string().nullish(),
    is_verified: z.boolean().nullish(),
  })
  .transform((r) => ({
    id: String(r.id),
    idType: r.id_type,
    idNumber: r.id_number,
    dateIssued: r.date_issued ?? null,
    dateExpiry: r.date_expiry ?? null,
    isVerified: Boolean(r.is_verified),
  }))

export const familyMemberSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    relationship: z.string().nullish(),
    age: z.number().nullish(),
    occupation: z.string().nullish(),
    monthly_income: decimal,
    education: z.string().nullish(),
    contact_number: z.string().nullish(),
    is_living_with_patient: z.boolean().nullish(),
  })
  .transform((r) => ({
    id: String(r.id),
    name: r.name,
    relationship: r.relationship ?? null,
    age: r.age ?? null,
    occupation: r.occupation ?? null,
    monthlyIncome: r.monthly_income,
    education: r.education ?? null,
    contactNumber: r.contact_number ?? null,
    isLivingWithPatient: Boolean(r.is_living_with_patient),
  }))

export const watcherSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    relationship: z.string().nullish(),
    contact_number: z.string().nullish(),
    address: z.string().nullish(),
    is_primary: z.boolean().nullish(),
  })
  .transform((r) => ({
    id: String(r.id),
    name: r.name,
    relationship: r.relationship ?? null,
    contactNumber: r.contact_number ?? null,
    address: r.address ?? null,
    isPrimary: Boolean(r.is_primary),
  }))

export const caretakerSchema = z
  .object({
    id: z.number(),
    user_id: z.number().nullish(),
    user: z.object({ id: z.number(), name: z.string().nullish() }).nullish(),
    role: z.string().nullish(),
    assigned_date: z.string().nullish(),
    is_active: z.boolean().nullish(),
  })
  .transform((r) => ({
    id: String(r.id),
    userId: r.user_id == null ? null : String(r.user_id),
    userName: r.user?.name ?? null,
    role: r.role ?? null,
    assignedDate: r.assigned_date ?? null,
    isActive: Boolean(r.is_active),
  }))

export const documentSchema = z
  .object({
    id: z.number(),
    document_type: z.string().nullish(),
    file_name: z.string().nullish(),
    file_type: z.string().nullish(),
    created_at: z.string().nullish(),
  })
  .transform((r) => ({
    id: String(r.id),
    documentType: r.document_type ?? null,
    fileName: r.file_name ?? null,
    fileType: r.file_type ?? null,
    createdAt: r.created_at ?? null,
  }))

export const activitySchema = z
  .object({
    id: z.number(),
    event: z.string().nullish(),
    description: z.string().nullish(),
    causer: z.object({ id: z.number().nullish(), name: z.string().nullish() }).nullish(),
    created_at: z.string().nullish(),
  })
  .transform((r) => ({
    id: String(r.id),
    event: r.event ?? null,
    description: r.description ?? null,
    causerName: r.causer?.name ?? null,
    createdAt: r.created_at ?? null,
  }))

export type PatientId = z.output<typeof patientIdSchema>
export type FamilyMember = z.output<typeof familyMemberSchema>
export type Watcher = z.output<typeof watcherSchema>
export type Caretaker = z.output<typeof caretakerSchema>
export type PatientDocument = z.output<typeof documentSchema>
export type PatientActivity = z.output<typeof activitySchema>

/* -------------------------------------------------------------------------- */
/* Write payloads                                                             */
/* -------------------------------------------------------------------------- */

/** Optional text field: '' from an untouched input means "not provided". */
const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === '' ? undefined : value))

/**
 * Mirrors `StorePatientRequest`. Field names stay snake_case here because this
 * object is posted to the API verbatim.
 */
export const patientFormSchema = z.object({
  sector_id: z.string().min(1, 'Sector is required'),
  hospital_id: optionalText,
  first_name: z.string().trim().min(1, 'First name is required'),
  last_name: z.string().trim().min(1, 'Last name is required'),
  middle_name: optionalText,
  extension_name: optionalText,
  sex: z.string().min(1, 'Sex is required'),
  civil_status: optionalText,
  birthdate: optionalText.refine(
    (value) => !value || new Date(value) <= new Date(),
    'Date of birth cannot be in the future',
  ),
  estimated_age: optionalText.refine(
    (value) => !value || Number(value) >= 0,
    'Age cannot be negative',
  ),
  address: optionalText,
  barangay: optionalText,
  municipality: optionalText,
  province: optionalText,
  contact_number: optionalText,
})

export type PatientFormInput = z.input<typeof patientFormSchema>
export type PatientFormOutput = z.output<typeof patientFormSchema>

/** "Dela Cruz, Juan Santos" — the label Filament builds in its table column. */
export function patientFullName(patient: Patient): string {
  const given = [patient.firstName, patient.middleName, patient.extensionName]
    .filter(Boolean)
    .join(' ')
  return `${patient.lastName}, ${given}`
}

/** Age from the birthdate, falling back to the recorded estimate. */
export function patientAge(patient: Patient): number | null {
  if (!patient.birthdate) return patient.estimatedAge
  const birth = new Date(patient.birthdate)
  if (Number.isNaN(birth.getTime())) return patient.estimatedAge

  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDelta = now.getMonth() - birth.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birth.getDate())) age -= 1
  return age
}
