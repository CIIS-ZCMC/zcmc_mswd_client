import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getLatestCaseForPatient } from "../api/patients-api"
import {
  cancelIntakeSheet,
  createDiagnostic,
  createIntakeSheet,
  finalizeIntakeSheet,
  getIntakeSheet,
  getIntakeSheetHistory,
  listAssistantTypes,
  listIntakeSheetsForPatient,
  submitIntakeSheet,
  updateIntakeSheet,
  type CreateDiagnosticPayload,
  type CreateIntakeSheetPayload,
  type UpdateIntakeSheetPayload,
} from "../api/intake-sheets-api"
import { patientDetailKeys } from "./use-patient-detail"

function intakeSheetKeys(patientId: number) {
  return {
    list: ["intake-sheets", "patient", patientId] as const,
    detail: (id: number) => ["intake-sheets", "detail", id] as const,
    history: (id: number) => ["intake-sheets", "detail", id, "history"] as const,
  }
}

/** Small, rarely-changing lookup table — one shared cache entry for every consumer. */
export function useAssistantTypes(activeOnly = true) {
  return useQuery({
    queryKey: ["assistant-types", activeOnly],
    queryFn: () => listAssistantTypes(activeOnly),
    staleTime: 5 * 60_000,
  })
}

/**
 * Reuses use-patient-detail's own query key for the patient's latest case,
 * so the wizard's "attach vs. open a new case" decision shares a cache
 * entry with the detail view instead of firing a second request.
 */
export function useLatestCaseForPatient(patientId: string) {
  const numericId = Number(patientId)
  const enabled = patientId !== "" && !Number.isNaN(numericId)

  return useQuery({
    queryKey: patientDetailKeys(numericId).latestCase,
    queryFn: () => getLatestCaseForPatient(numericId),
    enabled,
  })
}

export function useIntakeSheetsForPatient(patientId: string) {
  const numericId = Number(patientId)
  const enabled = patientId !== "" && !Number.isNaN(numericId)

  return useQuery({
    queryKey: intakeSheetKeys(numericId).list,
    queryFn: () => listIntakeSheetsForPatient(numericId),
    enabled,
  })
}

export function useIntakeSheet(id: number | null) {
  return useQuery({
    queryKey: intakeSheetKeys(0).detail(id ?? 0),
    queryFn: () => getIntakeSheet(id as number),
    enabled: id !== null,
  })
}

export function useIntakeSheetHistory(id: number | null) {
  return useQuery({
    queryKey: intakeSheetKeys(0).history(id ?? 0),
    queryFn: () => getIntakeSheetHistory(id as number),
    enabled: id !== null,
  })
}

function invalidateAfterWrite(queryClient: ReturnType<typeof useQueryClient>, patientId: number) {
  queryClient.invalidateQueries({ queryKey: intakeSheetKeys(patientId).list })
  queryClient.invalidateQueries({ queryKey: patientDetailKeys(patientId).profile })
  queryClient.invalidateQueries({ queryKey: patientDetailKeys(patientId).latestCase })
}

/**
 * Creates the intake sheet, then — only when the wizard collected a
 * diagnosis — follows up with a real Diagnostic record against the case the
 * sheet just resolved (case_id isn't known until the first call returns).
 */
export function useCreateIntakeSheet(patientId: string) {
  const queryClient = useQueryClient()
  const numericId = Number(patientId)

  return useMutation({
    mutationFn: async ({
      sheet,
      diagnosis,
    }: {
      sheet: CreateIntakeSheetPayload
      diagnosis?: CreateDiagnosticPayload
    }) => {
      const created = await createIntakeSheet(sheet)
      if (diagnosis && created.case_id) {
        await createDiagnostic(created.case_id, diagnosis)
      }
      return created
    },
    onSuccess: () => invalidateAfterWrite(queryClient, numericId),
  })
}

export function useUpdateIntakeSheet(patientId: string) {
  const queryClient = useQueryClient()
  const numericId = Number(patientId)

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateIntakeSheetPayload }) =>
      updateIntakeSheet(id, payload),
    onSuccess: (_data, variables) => {
      invalidateAfterWrite(queryClient, numericId)
      queryClient.invalidateQueries({ queryKey: intakeSheetKeys(numericId).detail(variables.id) })
    },
  })
}

export function useSubmitIntakeSheet(patientId: string) {
  const queryClient = useQueryClient()
  const numericId = Number(patientId)

  return useMutation({
    mutationFn: (id: number) => submitIntakeSheet(id),
    onSuccess: (_data, id) => {
      invalidateAfterWrite(queryClient, numericId)
      queryClient.invalidateQueries({ queryKey: intakeSheetKeys(numericId).detail(id) })
    },
  })
}

export function useFinalizeIntakeSheet(patientId: string) {
  const queryClient = useQueryClient()
  const numericId = Number(patientId)

  return useMutation({
    mutationFn: (id: number) => finalizeIntakeSheet(id),
    onSuccess: (_data, id) => {
      invalidateAfterWrite(queryClient, numericId)
      queryClient.invalidateQueries({ queryKey: intakeSheetKeys(numericId).detail(id) })
    },
  })
}

export function useCancelIntakeSheet(patientId: string) {
  const queryClient = useQueryClient()
  const numericId = Number(patientId)

  return useMutation({
    mutationFn: (id: number) => cancelIntakeSheet(id),
    onSuccess: () => invalidateAfterWrite(queryClient, numericId),
  })
}
