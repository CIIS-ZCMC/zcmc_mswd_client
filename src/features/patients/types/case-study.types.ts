/**
 * Backend `assessments.classification` is a free string (see migration
 * comment: "indigent, low_income, self_sufficient, others") with no DB or
 * validation-level enum — so this is intentionally `string`, not a fixed
 * union. Previously this was "Category C1"|"C2"|"C3"|"D", which doesn't
 * exist anywhere in the backend; dropped in favor of the real values.
 */
export type MedicalCategory = string

export interface FamilyMember {
  id: string
  fullName: string
  relationship: string
  age: number
  /** Not used by the current Family tab UI; kept optional for mock-data compatibility. */
  civilStatus?: string
  occupation: string
  monthlyIncome: number
  isDependent: boolean
}

export interface StaffAssignment {
  socialWorker: string
  socialWorkerId: string
  caseOfficer: string
  attendingPhysician: string
  assignedDate: string
  shift: "Morning" | "Afternoon" | "Night"
}

export interface SocialCaseStudy {
  caseNumber: string
  assessmentDate: string
  category: MedicalCategory
  classificationDetails: string
  presentingProblem: string
  socialWorkerNotes: string
  recommendedAssistance: string
  approvedAmount?: number
}
