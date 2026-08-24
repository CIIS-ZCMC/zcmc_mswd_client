import { useMutation, useQueryClient } from '@tanstack/react-query'
import { caseKeys } from '@/features/cases'
import { patientKeys } from '@/features/patients'
import { intakeApi } from './api'
import type { IntakeFormOutput } from './schemas'

export const intakeKeys = {
  all: ['intake-sheets'] as const,
  lists: () => [...intakeKeys.all, 'list'] as const,
}

export function useCreateIntakeSheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: IntakeFormOutput) => intakeApi.create(input),
    onSuccess: (sheet) => {
      void queryClient.invalidateQueries({ queryKey: intakeKeys.lists() })
      // An intake can open a case, so the patient's cases may have changed.
      void queryClient.invalidateQueries({ queryKey: caseKeys.lists() })
      if (sheet.patientId) {
        void queryClient.invalidateQueries({ queryKey: patientKeys.detail(sheet.patientId) })
      }
    },
  })
}
