export type MswdClassificationCode = "A" | "B" | "C1" | "C2" | "C3" | "D"

export interface MswdClassificationMatrix {
  id: number
  code: MswdClassificationCode
  name: string
  minPerCapitaIncome: number | null
  maxPerCapitaIncome: number | null
  discountPercentage: number
  maxAssistanceCap: number | null
  isIndigent: boolean
  description?: string | null
}

export interface AssessmentExpense {
  id: number
  assessmentId: number
  expenseType: string
  amount: number
}

export interface Assessment {
  id: number
  caseId: number
  createdBy: number
  createdByName?: string | null
  parentAssessmentId: number | null
  reassessmentReason: string | null
  totalFamilyIncome: number | null
  expensesTotal: number
  expenses: AssessmentExpense[]
  householdSize: number
  netPerCapitaIncome: number | null
  calculatedClassification: MswdClassificationCode | null
  classification: MswdClassificationCode | string
  classificationOverrideReason: string | null
  calculatedDiscountRate: number | null
  hasOverride: boolean
  housingType: string | null
  utilitiesAccess: string | null
  presentingProblem: string | null
  familyBackground: string | null
  socialFunctioning: string | null
  assessmentNotes: string | null
  interventionPlan: string | null
  socialCaseStatus: string | null
  parentAssessment?: Assessment | null
  createdAt: string
  updatedAt: string
}

export interface ReassessmentPayload {
  reassessment_reason: string
  total_family_income: number
  household_size: number
  housing_type?: string
  utilities_access?: string
  presenting_problem?: string
  expenses?: Array<{ expense_type: string; amount: number }>
  classification_override?: string
  classification_override_reason?: string
}

export interface PromoteAssessmentPayload {
  assessment_id: number
}
