import type { ApiUisMissingSection } from "./api.types"
import type { Assessment } from "./assessment.types"

/** One case (= one hospital encounter) of a patient with its UIS state. */
export interface PatientUisRow {
  caseId: number
  caseCode: string
  caseStatus: string
  transactionId: number | null
  transactionType: string | null
  dateOpened: string | null

  /** The case has an intake-time assessment, i.e. the UIS has data to print. */
  hasAssessment: boolean
  /** The case's assessment was promoted to its SCSR, so it no longer prints as a UIS. */
  hasSocialCase: boolean
  ready: boolean
  missing: ApiUisMissingSection[]
  printCount: number
  lastPrintedAt: string | null
  /** The case's newest intake assessment (with expenses), or null. */
  assessment: Assessment | null
}
