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

/** GET /cases/{case}/assessment/latest — fetches latest active assessment for a case episode */
export async function getLatestAssessment(caseId: number): Promise<Assessment | null> {
  return apiClient
    .get<ApiEnvelope<ApiAssessment>>(`/cases/${caseId}/assessment/latest`)
    .then((res) => adaptAssessment(res.data))
    .catch((err: any) => {
      if (err?.status === 404 || err?.response?.status === 404) {
        return null
      }
      throw err
    })
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
