import { apiClient } from "@/lib/api-client"
import type { ApiEnvelope } from "@/features/patients/types/api.types"
import type { ApiPatientUisRow } from "../types/api.types"
import type { PatientUisRow } from "../types/uis.types"
import { adaptAssessment } from "./assessment-adapter"

function adaptPatientUisRow(api: ApiPatientUisRow): PatientUisRow {
  return {
    caseId: api.case.id,
    caseCode: api.case.case_code,
    caseStatus: api.case.status,
    transactionId: api.case.transaction_id ?? null,
    transactionType: api.case.transaction_type ?? null,
    dateOpened: api.case.date_opened ?? null,
    hasAssessment: api.uis.has_assessment,
    hasSocialCase: api.uis.has_social_case,
    ready: api.uis.ready,
    missing: api.uis.missing,
    printCount: api.uis.print_count,
    lastPrintedAt: api.uis.last_printed_at ?? null,
    assessment: api.uis.assessment ? adaptAssessment(api.uis.assessment) : null,
  }
}

/**
 * GET /patients/{id}/uis — every case of the patient (newest first) with its
 * intake assessment, readiness and print stats, in one request.
 */
export async function getPatientUis(patientId: number | string): Promise<PatientUisRow[]> {
  const res = await apiClient.get<ApiEnvelope<ApiPatientUisRow[]>>(`/patients/${patientId}/uis`)
  return (res.data ?? []).map(adaptPatientUisRow)
}
