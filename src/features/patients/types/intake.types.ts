import type { MedicalCategory } from "./case-study.types"

export type IntakeType =
  | "Initial Admission Intake"
  | "Readmission Evaluation"
  | "Re-assessment / Upgrade"
  | "ER Fast-Track Intake"

export type IntakeStatus = "Verified" | "Pending Review" | "Archived"

export type HousingStatus =
  | "Owned"
  | "Rented"
  | "Informal Settler"
  | "Living with Relatives"

export interface IntakeSheetRecord {
  id: string
  controlNo: string
  intakeDate: string
  intakeTime: string
  intakeType: IntakeType
  ward: string
  bedNo: string
  informantName: string
  informantRelationship: string
  informantContact: string
  householdSize: number
  monthlyIncome: number
  perCapitaIncome: number
  housingStatus: HousingStatus
  diagnosis: string
  presentingProblem: string
  socialWorkerNotes: string
  category: MedicalCategory
  recommendedAssistance: string
  approvedAmount: number
  socialWorker: string
  socialWorkerId: string
  status: IntakeStatus
}
