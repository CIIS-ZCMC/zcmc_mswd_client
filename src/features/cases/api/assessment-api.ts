import { apiClient } from "@/lib/api-client"
import type { ApiEnvelope, ApiAssessment, ApiMswdClassificationMatrix, ApiSocialCase } from "@/features/patients/types/api.types"
import type { Assessment, MswdClassificationMatrix, ReassessmentPayload } from "../types/assessment.types"
import { adaptAssessment, adaptMswdClassificationMatrix } from "./assessment-adapter"

/** GET /mswd-classification-matrix — fetches list of classification tiers */
export async function getMswdClassificationMatrix(): Promise<MswdClassificationMatrix[]> {
  const res = await apiClient.get<ApiEnvelope<ApiMswdClassificationMatrix[]> | ApiMswdClassificationMatrix[]>(
    "/mswd-classification-matrix"
  )
  const rawData = Array.isArray(res) ? res : (res as ApiEnvelope<ApiMswdClassificationMatrix[]>).data || []
  return rawData.map(adaptMswdClassificationMatrix)
}

/** GET /cases/{case}/assessments — fetches historical assessments list for a case episode */
export async function getCaseAssessments(caseId: number): Promise<Assessment[]> {
  const res = await apiClient.get<ApiEnvelope<ApiAssessment[]> | ApiAssessment[]>(
    `/cases/${caseId}/assessments`
  )
  const rawData = Array.isArray(res) ? res : (res as ApiEnvelope<ApiAssessment[]>).data || []
  return rawData.map(adaptAssessment)
}

/**
 * The latest assessment for a case episode, or null when it has none.
 *
 * There is no `/cases/{case}/assessment/latest` route on the server — calling it
 * 404s. GET /cases/{case}/assessments already returns the case's assessments
 * newest-first (the controller uses `->latest()`), so the head of that list is
 * the latest. Reuse it rather than hitting a nonexistent endpoint.
 */
export async function getLatestAssessment(caseId: number): Promise<Assessment | null> {
  const assessments = await getCaseAssessments(caseId)
  return assessments[0] ?? null
}

/** POST /cases/{case}/reassess — creates a new linked re-assessment snapshot */
export async function reassessCase(caseId: number, payload: ReassessmentPayload): Promise<Assessment> {
  const res = await apiClient.post<ApiEnvelope<ApiAssessment>>(`/cases/${caseId}/reassess`, payload)
  return adaptAssessment(res.data)
}

/** POST /assessments/{assessment}/promote-to-social-case — elevates assessment snapshot to draft SCSR */
export async function promoteAssessmentToSocialCase(assessmentId: number): Promise<ApiSocialCase> {
  const res = await apiClient.post<ApiEnvelope<ApiSocialCase>>(
    `/assessments/${assessmentId}/promote-to-social-case`
  )
  return res.data
}
