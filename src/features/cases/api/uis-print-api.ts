import { apiClient, fetchBlob } from "@/lib/api-client"
import type { ApiEnvelope } from "@/features/patients/types/api.types"
import type { ApiUisPrintLog } from "../types/api.types"

/**
 * GET /cases/{id}/uis/pdf — streams the rendered Unified Intake Sheet (ANNEX B)
 * from current case data and logs the print server-side.
 */
export function downloadCaseUisPdf(caseId: number | string, filename?: string): Promise<void> {
  return fetchBlob(`/cases/${caseId}/uis/pdf`, { download: 1 }).then((blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename || `UIS-CASE-${caseId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  })
}

/**
 * GET /cases/{id}/uis/prints — history of past UIS prints for this case.
 */
export function listCaseUisPrints(caseId: number | string): Promise<ApiUisPrintLog[]> {
  return apiClient
    .get<ApiEnvelope<ApiUisPrintLog[]>>(`/cases/${caseId}/uis/prints`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`Failed to load UIS print history for case ${caseId}:`, err)
      return []
    })
}

/**
 * GET /patient-transactions/{id}/uis/pdf — streams the rendered Unified Intake Sheet (ANNEX B)
 * directly from an encounter (HIS transaction).
 */
export function downloadEncounterUisPdf(
  encounterId: number | string,
  filename?: string
): Promise<void> {
  return fetchBlob(`/patient-transactions/${encounterId}/uis/pdf`, { download: 1 }).then((blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename || `UIS-ENCOUNTER-${encounterId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  })
}

/**
 * GET /patient-transactions/{id}/uis/prints — history of past UIS prints for an encounter.
 */
export function listEncounterUisPrints(
  encounterId: number | string
): Promise<ApiUisPrintLog[]> {
  return apiClient
    .get<ApiEnvelope<ApiUisPrintLog[]>>(`/patient-transactions/${encounterId}/uis/prints`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`Failed to load UIS print history for encounter ${encounterId}:`, err)
      return []
    })
}

