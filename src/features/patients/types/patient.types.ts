import type { AuditHistory } from "./audit.types"
import type { FamilyMember, MedicalCategory, SocialCaseStudy, StaffAssignment } from "./case-study.types"
import type { DocumentItem } from "./document.types"
import type { Watcher } from "./watcher.types"

/**
 * Backend `cases.admission_type`, `patients.sex` and `patients.civil_status`
 * are all free strings with no DB-level enum (StorePatientRequest just
 * validates `string|max:255`) — typed as `string` rather than a fixed union
 * that the backend doesn't actually enforce.
 */
export type AdmissionStatus = string
export type Gender = string
export type CivilStatus = string

export interface PatientRecord {
  id: string
  hospitalNo: string
  mswdNo: string
  fullName: string
  age: number
  gender: Gender
  birthDate: string
  civilStatus: CivilStatus
  contactNo: string
  address: string
  barangay: string
  city: string
  intakeDate: string
  admissionStatus: AdmissionStatus
  ward: string
  bedNo: string
  diagnosis: string
  category: MedicalCategory
  philHealthNo: string
  seniorCitizenId?: string
  pwdId?: string
  /**
   * Background/economic profile — all optional since older mock data and any
   * patient created before this field set existed won't have them on file.
   */
  religion?: string
  nationality?: string
  placeOfBirth?: string
  permanentAddress?: string
  presentAddress?: string
  educationalAttainment?: string
  occupation?: string
  employer?: string
  /** The patient's own income — distinct from caseStudy's family total and from each family member's own monthlyIncome. */
  monthlyIncome?: number
  familyMembers: FamilyMember[]
  watchers: Watcher[]
  assignedStaff: StaffAssignment
  caseStudy: SocialCaseStudy
  /**
   * Legacy mock-only field from the original flat design. Real intake
   * sheet data is fetched independently via useIntakeSheetsForPatient
   * (same pattern as case/assessment data) — nothing in the real data
   * path reads this. Kept here, untyped, only so mock-patients.ts's old
   * literal data still type-checks.
   */
  intakeSheets?: unknown[]
  documents: DocumentItem[]
  history: AuditHistory[]
}
