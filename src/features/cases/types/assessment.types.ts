export type MswdClassificationCode = "A" | "B" | "C1" | "C2" | "C3" | "D"

/**
 * Pre-MSWD classification words still held by old assessment rows. They are
 * not brackets — show them as "legacy", never map them to a code.
 */
export type LegacyClassification = "indigent" | "low_income" | "self_sufficient" | "others"

/** One row of UIS §II "other source/s of family income". */
export interface OtherIncomeSource {
  source: string
  amount: number | null
}

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
  classification: MswdClassificationCode | LegacyClassification | null
  classificationOverrideReason: string | null
  calculatedDiscountRate: number | null
  hasOverride: boolean
  housingType: string | null
  utilitiesAccess: string | null
  houseTenure: string | null
  lightSource: string[]
  waterSource: string[]
  presentingProblem: string | null
  problemCategories: string[]
  problemSpecify: string | null
  informantName: string | null
  informantRelationship: string | null
  otherIncomeSources: OtherIncomeSource[]
  referralSource: string | null
  medicalHistory: string | null
  recommendation: string | null
  recommendationMode: string | null
  fundSource: string | null
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
