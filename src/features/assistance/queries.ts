import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { assistanceApi } from './api'
import type { AssistanceFormOutput } from './schemas'

export const assistanceKeys = {
  all: ['assistance'] as const,
  forCase: (caseId: string) => [...assistanceKeys.all, 'case', caseId] as const,
}

export function useAssistanceForCase(caseId: string, enabled = true) {
  return useQuery({
    queryKey: assistanceKeys.forCase(caseId),
    queryFn: () => assistanceApi.forCase(caseId),
    enabled: Boolean(caseId) && enabled,
  })
}

/**
 * Assistance is case-scoped on the API, so a patient-level view fans out across
 * their cases and flattens the results. `caseIds` is small (a patient's open
 * cases), so this stays a handful of parallel requests.
 */
export function useAssistanceForCases(caseIds: string[], enabled = true) {
  return useQueries({
    queries: caseIds.map((caseId) => ({
      queryKey: assistanceKeys.forCase(caseId),
      queryFn: () => assistanceApi.forCase(caseId),
      enabled,
    })),
    combine: (results) => ({
      data: results.flatMap((result) => result.data ?? []),
      isLoading: results.some((result) => result.isLoading),
    }),
  })
}

export function useCreateAssistance(caseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AssistanceFormOutput) => assistanceApi.create(caseId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assistanceKeys.forCase(caseId) })
    },
  })
}
