import type { AuditHistory } from "./audit.types"
import type { FamilyMember, MedicalCategory, SocialCaseStudy, StaffAssignment } from "./case-study.types"
import type { DocumentItem } from "./document.types"
import type { IntakeSheetRecord } from "./intake.types"
import type { Watcher } from "./watcher.types"

export type AdmissionStatus = "In-Patient" | "Out-Patient" | "ER Emergency"
export type Gender = "Male" | "Female" | "Other"
export type CivilStatus = "Single" | "Married" | "Widowed" | "Separated"

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
  familyMembers: FamilyMember[]
  watchers: Watcher[]
  assignedStaff: StaffAssignment
  caseStudy: SocialCaseStudy
  intakeSheets: IntakeSheetRecord[]
  documents: DocumentItem[]
  history: AuditHistory[]
}
