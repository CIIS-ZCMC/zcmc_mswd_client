import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createFamilyMember,
  createWatcher,
  deleteFamilyMember,
  updateFamilyMember,
  updatePatientBackground,
  type CreateFamilyMemberPayload,
  type CreateWatcherPayload,
  type UpdateFamilyMemberPayload,
  type UpdatePatientBackgroundPayload,
} from "../api/patients-api"
import { patientDetailKeys } from "./use-patient-detail"

/**
 * Real server-backed writes for the patient detail view. Distinct from
 * usePatientMutations (which only splices local state for the not-yet-wired
 * Intake Sheet flow) — these hit the API and invalidate the profile query
 * on success so the new record shows up from the server, not a client guess.
 */
export function useAddFamilyMember(patientId: string) {
  const queryClient = useQueryClient()
  const numericId = Number(patientId)

  return useMutation({
    mutationFn: (payload: CreateFamilyMemberPayload) => createFamilyMember(numericId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientDetailKeys(numericId).profile })
    },
  })
}

export function useUpdateFamilyMember(patientId: string) {
  const queryClient = useQueryClient()
  const numericId = Number(patientId)

  return useMutation({
    mutationFn: ({ memberId, payload }: { memberId: string | number; payload: UpdateFamilyMemberPayload }) =>
      updateFamilyMember(memberId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientDetailKeys(numericId).profile })
    },
  })
}

export function useDeleteFamilyMember(patientId: string) {
  const queryClient = useQueryClient()
  const numericId = Number(patientId)

  return useMutation({
    mutationFn: (memberId: string | number) => deleteFamilyMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientDetailKeys(numericId).profile })
    },
  })
}

/** Edits the patient's own master-record background fields (religion, occupation, monthly income, ...) — separate from any one intake/assessment. */
export function useUpdatePatientBackground(patientId: string) {
  const queryClient = useQueryClient()
  const numericId = Number(patientId)

  return useMutation({
    mutationFn: (payload: UpdatePatientBackgroundPayload) => updatePatientBackground(numericId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientDetailKeys(numericId).profile })
    },
  })
}

export function useAddWatcher(patientId: string) {
  const queryClient = useQueryClient()
  const numericId = Number(patientId)

  return useMutation({
    mutationFn: (payload: CreateWatcherPayload) => createWatcher(numericId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientDetailKeys(numericId).profile })
    },
  })
}
