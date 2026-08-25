export type MedicalCategory =
  | "Category C1"
  | "Category C2"
  | "Category C3"
  | "Category D"

export interface FamilyMember {
  id: string
  fullName: string
  relationship: string
  age: number
  civilStatus: string
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
