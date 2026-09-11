import { apiClient, fetchBlob } from "@/lib/api-client"
import type {
  ApiActivity,
  ApiAssistantType,
  ApiDiagnostic,
  ApiEnvelope,
  ApiPaginated,
  ApiUnifiedIntakeSheet,
  ApiWatcherRelationshipType,
} from "../types/api.types"

/** GET /assistant-types — small unpaginated lookup table for the assistance select. */
export function listAssistantTypes(activeOnly = true) {
  return apiClient
    .get<ApiEnvelope<ApiAssistantType[]>>("/assistant-types", {
      params: { active: activeOnly ? 1 : undefined },
    })
    .then((res) => res.data)
}

/** GET /watcher-relationship-types — lookup table for watcher relationship options. */
export function listWatcherRelationshipTypes() {
  return apiClient
    .get<ApiEnvelope<ApiWatcherRelationshipType[]>>("/watcher-relationship-types")
    .then((res) => res.data)
}


export interface IntakeCasePayload {
  case_type: string
  priority_level: string
  admission_type: string
  date_opened?: string
}

export interface IntakeAssessmentPayload {
  classification: string
  total_family_income?: number
  housing_type?: string
  utilities_access?: string
  presenting_problem?: string
  family_background?: string
  social_functioning?: string
  assessment_notes?: string
  intervention_plan?: string
}

export interface CreateIntakeSheetPayload {
  referral_source?: string
  referral_details?: string
  date_of_intake?: string
  remarks?: string
  patient_id: number
  /** Exactly one of case_id / case must be set — see StoreUnifiedIntakeSheetRequest. */
  case_id?: number
  case?: IntakeCasePayload
  assessment?: IntakeAssessmentPayload
  assistances?: Array<{ assistant_type_id: number; amount?: number; notes?: string }>
  /** Only actually saved server-side when `assessment` is also present — there's nowhere to attach them otherwise. */
  expenses?: Array<{ expense_type: string; amount: number }>
}

/** POST /intake-sheets — creates the draft, opening/attaching a case and recording the assessment atomically. */
export function createIntakeSheet(payload: CreateIntakeSheetPayload) {
  return apiClient
    .post<ApiEnvelope<ApiUnifiedIntakeSheet>>("/intake-sheets", payload)
    .then((res) => res.data)
}

export interface UpdateIntakeSheetPayload {
  referral_source?: string
  referral_details?: string
  date_of_intake?: string
  remarks?: string
  assessment?: IntakeAssessmentPayload
}

/**
 * PUT /intake-sheets/{id} — only header fields + assessment are editable
 * once a draft exists (UpdateUnifiedIntakeSheetRequest). Patient, case, and
 * assistances are locked at creation.
 */
export function updateIntakeSheet(id: number, payload: UpdateIntakeSheetPayload) {
  return apiClient
    .put<ApiEnvelope<ApiUnifiedIntakeSheet>>(`/intake-sheets/${id}`, payload)
    .then((res) => res.data)
}

/** GET /intake-sheets/{id} — full detail, including case + assessment (not eager-loaded on the list). */
export function getIntakeSheet(id: number) {
  return apiClient
    .get<ApiEnvelope<ApiUnifiedIntakeSheet>>(`/intake-sheets/${id}`)
    .then((res) => res.data)
}

/** GET /intake-sheets?filter[patient_id]=X — this patient's intake history, newest first. */
export function listIntakeSheetsForPatient(patientId: number) {
  return apiClient
    .get<ApiPaginated<ApiUnifiedIntakeSheet>>("/intake-sheets", {
      filters: { patient_id: patientId },
      params: { per_page: 100 },
    })
    .then((res) => res.data)
}

/** POST /intake-sheets/{id}/submit — draft -> submitted. */
export function submitIntakeSheet(id: number) {
  return apiClient
    .post<ApiEnvelope<ApiUnifiedIntakeSheet>>(`/intake-sheets/${id}/submit`)
    .then((res) => res.data)
}

/** POST /intake-sheets/{id}/finalize — submitted -> finalized; archives the signed PDF server-side. */
export function finalizeIntakeSheet(id: number) {
  return apiClient
    .post<ApiEnvelope<ApiUnifiedIntakeSheet>>(`/intake-sheets/${id}/finalize`)
    .then((res) => res.data)
}

/** DELETE /intake-sheets/{id} — cancels (and soft-deletes) a draft/submitted sheet. Finalized sheets refuse this server-side. */
export function cancelIntakeSheet(id: number) {
  return apiClient.delete<void>(`/intake-sheets/${id}`)
}

/** GET /intake-sheets/{id}/history — field-level audit trail for the sheet and everything it links. */
export function getIntakeSheetHistory(id: number) {
  return apiClient
    .get<ApiEnvelope<ApiActivity[]>>(`/intake-sheets/${id}/history`)
    .then((res) => res.data)
}

/** GET /intake-sheets/{id}/pdf — streams the rendered form; downloaded client-side since it needs the bearer token. */
export function downloadIntakeSheetPdf(id: number, filename: string) {
  return fetchBlob(`/intake-sheets/${id}/pdf`, { download: 1 }).then((blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  })
}

export interface CreateDiagnosticPayload {
  diagnosis_name: string
  diagnosis_description?: string
  diagnosis_date?: string
  attending_physician?: string
  facility_name?: string
}

/** POST /cases/{case}/diagnostics — a real, separate clinical record; only possible once the intake's case_id is known. */
export function createDiagnostic(caseId: number, payload: CreateDiagnosticPayload) {
  return apiClient
    .post<ApiEnvelope<ApiDiagnostic>>(`/cases/${caseId}/diagnostics`, payload)
    .then((res) => res.data)
}
