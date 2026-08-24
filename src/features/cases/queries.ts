import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { patientKeys } from '@/features/patients'
import { casesApi } from './api'
import type { AssessmentFormOutput, CaseFormOutput } from './schemas'

export const caseKeys = {
  all: ['cases'] as const,
  lists: () => [...caseKeys.all, 'list'] as const,
  forPatient: (patientId: string) => [...caseKeys.lists(), { patientId }] as const,
  detail: (id: string) => [...caseKeys.all, 'detail', id] as const,
  assessments: (id: string) => [...caseKeys.detail(id), 'assessments'] as const,
}

export function useCasesForPatient(patientId: string, enabled = true) {
  return useQuery({
    queryKey: caseKeys.forPatient(patientId),
    queryFn: () => casesApi.forPatient(patientId),
    enabled: Boolean(patientId) && enabled,
  })
}

export function useCaseAssessments(caseId: string, enabled = true) {
  return useQuery({
    queryKey: caseKeys.assessments(caseId),
    queryFn: () => casesApi.assessments(caseId),
    enabled: Boolean(caseId) && enabled,
  })
}

/** Assessments across every one of a patient's cases, flattened. */
export function useAssessmentsForCases(caseIds: string[], enabled = true) {
  return useQueries({
    queries: caseIds.map((caseId) => ({
      queryKey: caseKeys.assessments(caseId),
      queryFn: () => casesApi.assessments(caseId),
      enabled,
    })),
    combine: (results) => ({
      data: results.flatMap((result) => result.data ?? []),
      isLoading: results.some((result) => result.isLoading),
    }),
  })
}

export function useCreateCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CaseFormOutput) => casesApi.create(input),
    onSuccess: (record) => {
      void queryClient.invalidateQueries({ queryKey: caseKeys.lists() })
      // The patient's `cases_count` and Cases tab both change.
      if (record.patientId) {
        void queryClient.invalidateQueries({ queryKey: patientKeys.detail(record.patientId) })
      }
    },
  })
}

export function useCreateAssessment(caseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AssessmentFormOutput) => casesApi.createAssessment(caseId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: caseKeys.assessments(caseId) })
    },
  })
}
