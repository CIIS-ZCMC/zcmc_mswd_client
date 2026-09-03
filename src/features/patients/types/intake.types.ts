/**
 * Real UnifiedIntakeSheet workflow types. Replaces the old fully-fictional
 * IntakeSheetRecord (intakeType/ward/bedNo/informant fields, a free "status"
 * dropdown) with the backend's actual shape and lifecycle: draft ->
 * submitted -> finalized, or cancelled at any point before finalization.
 * See api.types.ts (ApiUnifiedIntakeSheet) for the raw resource this is
 * adapted from.
 */

export type IntakeSheetStatus = "draft" | "submitted" | "finalized" | "cancelled"

/**
 * `cases.case_type` / `priority_level` / `admission_type` and
 * `assessments.classification` have no DB-level enum (StoreCaseModelRequest
 * / StoreUnifiedIntakeSheetRequest just validate `string`) — these are the
 * real values documented in the migrations' own inline comments, not an
 * invented list.
 */
export const CASE_TYPE_OPTIONS = ["medical", "financial", "psychosocial", "others"] as const
export const PRIORITY_LEVEL_OPTIONS = ["low", "medium", "high"] as const
export const ADMISSION_TYPE_OPTIONS = ["OPD", "ER", "inpatient"] as const
export const ASSESSMENT_CLASSIFICATION_OPTIONS = ["indigent", "low_income", "self_sufficient", "others"] as const

/** Case statuses an intake may attach to instead of opening a new case (mirrors UnifiedIntakeSheet::ATTACHABLE_CASE_STATUSES). */
export const ATTACHABLE_CASE_STATUSES = ["open", "ongoing"] as const

export interface IntakeSheetSummary {
  id: number
  intakeNo: string
  status: IntakeSheetStatus
  dateOfIntake: string | null
  referralSource: string
  caseCode: string
  workerLabel: string
  createdAt: string
}

export interface IntakeSheetDetail extends IntakeSheetSummary {
  referralDetails: string
  remarks: string
  submittedAt: string | null
  finalizedAt: string | null
  caseId: number | null
  assessment: {
    classification: string
    totalFamilyIncome: number | null
    presentingProblem: string
    familyBackground: string
    interventionPlan: string
  } | null
}

export interface IntakeAssessmentInput {
  classification: string
  totalFamilyIncome?: number
  presentingProblem?: string
  familyBackground?: string
  interventionPlan?: string
}

export interface IntakeNewCaseInput {
  caseType: string
  priorityLevel: string
  admissionType: string
}

export interface IntakeAssistanceInput {
  assistantTypeId: number
  amount?: number
  notes?: string
}

export interface IntakeDiagnosisInput {
  diagnosisName: string
  diagnosisDescription?: string
  diagnosisDate?: string
  attendingPhysician?: string
  facilityName?: string
}
