import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ListQueryParams } from '@/hooks/useListQuery'
import { patientsApi } from './api'
import type { PatientFormOutput } from './schemas'

/**
 * Query key factory. Always build keys from here so mutations can invalidate by
 * prefix (`patientKeys.lists()`) without knowing the exact filters in play.
 */
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (params: ListQueryParams) => [...patientKeys.lists(), params] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
  relation: (id: string, name: string) => [...patientKeys.detail(id), name] as const,
}

export function usePatients(params: ListQueryParams) {
  return useQuery({
    queryKey: patientKeys.list(params),
    queryFn: () => patientsApi.list(params),
    // Keep the previous page on screen while the next one loads.
    placeholderData: (previous) => previous,
  })
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => patientsApi.detail(id),
    enabled: Boolean(id),
  })
}

/** One hook per relation tab; `enabled` keeps inactive tabs off the network. */
function useRelation<T>(id: string, name: string, fetcher: (id: string) => Promise<T>, enabled = true) {
  return useQuery({
    queryKey: patientKeys.relation(id, name),
    queryFn: () => fetcher(id),
    enabled: Boolean(id) && enabled,
  })
}

export const usePatientIds = (id: string, enabled?: boolean) =>
  useRelation(id, 'ids', patientsApi.ids, enabled)
export const usePatientFamily = (id: string, enabled?: boolean) =>
  useRelation(id, 'family-members', patientsApi.familyMembers, enabled)
export const usePatientWatchers = (id: string, enabled?: boolean) =>
  useRelation(id, 'watchers', patientsApi.watchers, enabled)
export const usePatientCaretakers = (id: string, enabled?: boolean) =>
  useRelation(id, 'caretakers', patientsApi.caretakers, enabled)
export const usePatientDocuments = (id: string, enabled?: boolean) =>
  useRelation(id, 'documents', patientsApi.documents, enabled)
export const usePatientHistory = (id: string, enabled?: boolean) =>
  useRelation(id, 'history', patientsApi.history, enabled)
export const usePatientDuplicates = (id: string, enabled?: boolean) =>
  useRelation(id, 'duplicates', patientsApi.duplicates, enabled)

export function useCreatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PatientFormOutput) => patientsApi.create(input),
    onSuccess: (patient) => {
      queryClient.setQueryData(patientKeys.detail(patient.id), patient)
      void queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
    },
  })
}

export function useUpdatePatient(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<PatientFormOutput>) => patientsApi.update(id, input),
    onSuccess: (patient) => {
      queryClient.setQueryData(patientKeys.detail(id), patient)
      void queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
    },
  })
}

/**
 * Record actions. Each refreshes both the detail and the list, since archiving
 * or merging changes whether the patient appears in the current filter.
 */
function useRecordAction(id: string, action: (id: string) => Promise<void>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => action(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: patientKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
    },
  })
}

export const useArchivePatient = (id: string) => useRecordAction(id, patientsApi.archive)
export const useRestorePatient = (id: string) => useRecordAction(id, patientsApi.restore)
export const useUnmergePatient = (id: string) => useRecordAction(id, patientsApi.unmerge)

export function useMergePatient(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (targetId: string) => patientsApi.merge(id, targetId),
    onSuccess: () => {
      // A merge rewrites records on both patients, so drop the whole namespace.
      void queryClient.invalidateQueries({ queryKey: patientKeys.all })
    },
  })
}
