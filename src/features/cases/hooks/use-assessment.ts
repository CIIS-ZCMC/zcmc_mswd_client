import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getCaseAssessments,
  getLatestAssessment,
  getMswdClassificationMatrix,
  promoteAssessmentToSocialCase,
  reassessCase,
} from "../api/assessment-api"
import type { ReassessmentPayload } from "../types/assessment.types"

export const assessmentKeys = {
  matrix: ["mswd-classification-matrix"] as const,
  caseAssessments: (caseId: number) => ["cases", caseId, "assessments"] as const,
  latestAssessment: (caseId: number) => ["cases", caseId, "assessments", "latest"] as const,
}

export function useMswdClassificationMatrix() {
  return useQuery({
    queryKey: assessmentKeys.matrix,
    queryFn: () => getMswdClassificationMatrix(),
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  })
}

export function useCaseAssessments(caseId: number | null | undefined) {
  return useQuery({
    queryKey: assessmentKeys.caseAssessments(caseId ?? 0),
    queryFn: () => getCaseAssessments(caseId!),
    enabled: Boolean(caseId && caseId > 0),
  })
}

export function useLatestAssessment(caseId: number | null | undefined) {
  return useQuery({
    queryKey: assessmentKeys.latestAssessment(caseId ?? 0),
    queryFn: () => getLatestAssessment(caseId!),
    enabled: Boolean(caseId && caseId > 0),
  })
}

export function useReassessCase(caseId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ReassessmentPayload) => reassessCase(caseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.caseAssessments(caseId) })
      queryClient.invalidateQueries({ queryKey: assessmentKeys.latestAssessment(caseId) })
      queryClient.invalidateQueries({ queryKey: ["cases", caseId, "social-case"] })
    },
  })
}

export function usePromoteAssessmentToSocialCase(caseId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assessmentId: number) => promoteAssessmentToSocialCase(assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases", caseId, "social-case"] })
      queryClient.invalidateQueries({ queryKey: assessmentKeys.caseAssessments(caseId) })
      queryClient.invalidateQueries({ queryKey: assessmentKeys.latestAssessment(caseId) })
    },
  })
}
