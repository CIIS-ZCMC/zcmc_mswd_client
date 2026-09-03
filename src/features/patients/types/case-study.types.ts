/**
 * Backend `assessments.classification` is a free string (see migration
 * comment: "indigent, low_income, self_sufficient, others") with no DB or
 * validation-level enum — so this is intentionally `string`, not a fixed
 * union. Previously this was "Category C1"|"C2"|"C3"|"D", which doesn't
 * exist anywhere in the backend; dropped in favor of the real values.
 */
export type MedicalCategory = string

/** Mirrors the backend `patient_family_members` columns one-for-one. */
export interface FamilyMember {
  id: string
  fullName: string
  relationship: string
  /** Normalized to `YYYY-MM-DD`; the API emits a full ISO datetime. */
  birthdate: string
  sex: string
  age: number
  occupation: string
  monthlyIncome: number
  educationalAttainment: string
  contactNumber: string
  isLivingWithPatient: boolean
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
