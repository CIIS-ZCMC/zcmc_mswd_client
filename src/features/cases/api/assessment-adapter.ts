import type { ApiAssessment, ApiMswdClassificationMatrix } from "@/features/patients/types/api.types"
import type { Assessment, MswdClassificationCode, MswdClassificationMatrix } from "../types/assessment.types"

export function adaptMswdClassificationMatrix(
  api: ApiMswdClassificationMatrix
): MswdClassificationMatrix {
  return {
    id: api.id,
    code: api.code as MswdClassificationCode,
    name: api.name,
    minPerCapitaIncome: api.min_per_capita_income !== null ? Number(api.min_per_capita_income) : null,
    maxPerCapitaIncome: api.max_per_capita_income !== null ? Number(api.max_per_capita_income) : null,
    discountPercentage: Number(api.discount_percentage || 0),
    maxAssistanceCap: api.max_assistance_cap !== null ? Number(api.max_assistance_cap) : null,
    isIndigent: Boolean(api.is_indigent),
    description: api.description ?? null,
  }
}

export function adaptAssessment(api: ApiAssessment): Assessment {
  const expenses = (api.expenses || []).map((e) => ({
    id: e.id,
    assessmentId: e.assessment_id,
    expenseType: e.expense_type,
    amount: Number(e.amount || 0),
  }))

  const expensesTotal = expenses.reduce((sum, e) => sum + e.amount, 0)

  return {
    id: api.id,
    caseId: api.case_id,
    createdBy: api.created_by,
    createdByName: api.created_by_user?.name || null,
    parentAssessmentId: api.parent_assessment_id ?? null,
    reassessmentReason: api.reassessment_reason ?? null,
    totalFamilyIncome: api.total_family_income !== null ? Number(api.total_family_income) : null,
    expensesTotal,
    expenses,
    householdSize: api.household_size ?? 1,
    netPerCapitaIncome: api.net_per_capita_income !== null && api.net_per_capita_income !== undefined
      ? Number(api.net_per_capita_income)
      : null,
    calculatedClassification: (api.calculated_classification as MswdClassificationCode) || null,
    classification: (api.classification as MswdClassificationCode) || "D",
    classificationOverrideReason: api.classification_override_reason ?? null,
    calculatedDiscountRate: api.calculated_discount_rate !== undefined && api.calculated_discount_rate !== null
      ? Number(api.calculated_discount_rate)
      : null,
    hasOverride: Boolean(api.has_override),
    housingType: api.housing_type ?? null,
    utilitiesAccess: api.utilities_access ?? null,
    presentingProblem: api.presenting_problem ?? null,
    familyBackground: api.family_background ?? null,
    socialFunctioning: api.social_functioning ?? null,
    assessmentNotes: api.assessment_notes ?? null,
    interventionPlan: api.intervention_plan ?? null,
    socialCaseStatus: api.social_case_status ?? null,
    parentAssessment: api.parent_assessment ? adaptAssessment(api.parent_assessment) : null,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  }
}
