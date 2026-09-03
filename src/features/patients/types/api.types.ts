/**
 * Raw shapes returned by the Laravel API (snake_case, as the backend
 * Resources emit them) — kept separate from the UI-facing types in
 * `patient.types.ts` etc. `patients-adapter.ts` is the only place that
 * should read these directly.
 */

export interface ApiPaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ApiPaginated<T> {
  data: T[]
  meta: ApiPaginationMeta
  links: Record<string, string | null>
}

export interface ApiEnvelope<T> {
  data: T
}

export interface ApiSector {
  id: number
  name: string
}

export interface ApiPatientId {
  id: number
  patient_id: number
  id_type: string
  id_number: string
  date_issued: string | null
  date_expiry: string | null
  is_verified: boolean
}

export interface ApiFamilyMember {
  id: number
  patient_id: number
  name: string
  relationship: string | null
  age: number | null
  birthdate: string | null
  sex: string | null
  occupation: string | null
  monthly_income: string | number | null
  educational_attainment: string | null
  contact_number: string | null
  is_living_with_patient: boolean
}

export interface ApiWatcher {
  id: number
  patient_id: number
  name: string
  relationship: string | null
  contact_number: string | null
  address: string | null
  is_primary: boolean
}

export interface ApiCaretaker {
  id: number
  patient_id: number
  user_id: number
  role: string
  assigned_date: string
  unassigned_date: string | null
  is_active: boolean
}

export interface ApiDocument {
  id: number
  case_id: number | null
  patient_id: number | null
  intervention_id: number | null
  uploaded_by: number | null
  document_type: string
  file_name: string
  file_path: string
  file_type: string
  created_at: string
  updated_at: string
}

export interface ApiUserLite {
  id: number
  name: string
}

export interface ApiCase {
  id: number
  case_code: string
  patient_id: number
  assigned_user_id: number | null
  case_type: string | null
  priority_level: string | null
  status: string
  admission_type: string | null
  date_opened: string | null
  date_closed: string | null
  assigned_user?: ApiUserLite | null
  created_at: string
  updated_at: string
}

export interface ApiAssessmentExpense {
  id: number
  assessment_id: number
  expense_type: string
  amount: string | number
  created_at: string
  updated_at: string
}

export interface ApiAssessment {
  id: number
  case_id: number
  created_by: number
  total_family_income: string | number | null
  housing_type: string | null
  utilities_access: string | null
  classification: string
  presenting_problem: string | null
  family_background: string | null
  social_functioning: string | null
  assessment_notes: string | null
  intervention_plan: string | null
  expenses?: ApiAssessmentExpense[]
  created_at: string
  updated_at: string
}

export interface ApiActivity {
  id: number
  log_name: string | null
  event: string | null
  description: string
  subject_type: string
  subject_id: number
  causer?: { id: number; name: string | null } | null
  changes: Record<string, unknown> | null
  created_at: string
}

export interface ApiPatient {
  id: number
  sector_id: number
  hospital_id: number | null
  mswd_id: number | null
  first_name: string
  last_name: string
  middle_name: string | null
  extension_name: string | null
  birthdate: string | null
  estimated_age: number | null
  sex: string
  civil_status: string | null
  address: string | null
  barangay: string | null
  municipality: string | null
  province: string | null
  contact_number: string | null
  religion: string | null
  nationality: string | null
  place_of_birth: string | null
  permanent_address: string | null
  present_address: string | null
  educational_attainment: string | null
  occupation: string | null
  employer: string | null
  monthly_income: string | number | null
  archived_at: string | null
  cases_count?: number
  patient_ids_count?: number
  family_members_count?: number
  watchers_count?: number
  documents_count?: number
  sector?: ApiSector
  patient_ids?: ApiPatientId[]
  family_members?: ApiFamilyMember[]
  watchers?: ApiWatcher[]
  caretakers?: ApiCaretaker[]
  cases?: ApiCase[]
  documents?: ApiDocument[]
  created_at: string
  updated_at: string
}

export interface ApiAssistantType {
  id: number
  name: string
  code: string | null
  category: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ApiDiagnostic {
  id: number
  case_id: number
  created_by: number
  diagnosis_name: string
  diagnosis_description: string | null
  diagnosis_date: string | null
  attending_physician: string | null
  facility_name: string | null
  created_at: string
  updated_at: string
}

export interface ApiUnifiedIntakeSheet {
  id: number
  intake_no: string
  status: "draft" | "submitted" | "finalized" | "cancelled"
  referral_source: string | null
  referral_details: string | null
  date_of_intake: string | null
  remarks: string | null
  patient_id: number
  case_id: number | null
  assessment_id: number | null
  intake_worker_id: number | null
  submitted_at: string | null
  finalized_at: string | null
  finalized_by: number | null
  patient?: ApiPatient
  case?: ApiCase
  assessment?: ApiAssessment
  created_at: string
  updated_at: string
}
