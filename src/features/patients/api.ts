import { apiClient } from '@/lib/api-client'
import { collection, paginated, resource } from '@/lib/api-envelope'
import type { Paginated } from '@/types'
import type { ListQueryParams } from '@/hooks/useListQuery'
import {
  activitySchema,
  caretakerSchema,
  documentSchema,
  familyMemberSchema,
  patientIdSchema,
  patientSchema,
  watcherSchema,
  type Patient,
  type PatientFormOutput,
} from './schemas'

/** Strip keys the form left undefined so we never clear a field by accident. */
function defined(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined))
}

export const patientsApi = {
  async list(params: ListQueryParams): Promise<Paginated<Patient>> {
    const { data } = await apiClient.get('/patients', { params })
    return paginated(patientSchema).parse(data)
  },

  async detail(id: string): Promise<Patient> {
    const { data } = await apiClient.get(`/patients/${id}`)
    return resource(patientSchema).parse(data)
  },

  async create(input: PatientFormOutput): Promise<Patient> {
    const { data } = await apiClient.post('/patients', defined(input))
    return resource(patientSchema).parse(data)
  },

  async update(id: string, input: Partial<PatientFormOutput>): Promise<Patient> {
    const { data } = await apiClient.put(`/patients/${id}`, defined(input))
    return resource(patientSchema).parse(data)
  },

  /** Soft-delete. The API refuses while any case is open or ongoing. */
  async archive(id: string): Promise<void> {
    await apiClient.delete(`/patients/${id}`)
  },

  async restore(id: string): Promise<void> {
    await apiClient.post(`/patients/${id}/restore`)
  },

  /** Fold this patient into `targetId`, reassigning every owned record. */
  async merge(id: string, targetId: string): Promise<void> {
    await apiClient.post(`/patients/${id}/merge`, { target_id: Number(targetId) })
  },

  /** Reverse the most recent un-reversed merge into this patient. */
  async unmerge(id: string): Promise<void> {
    await apiClient.post(`/patients/${id}/unmerge`)
  },

  async ids(id: string) {
    const { data } = await apiClient.get(`/patients/${id}/ids`)
    return collection(patientIdSchema).parse(data)
  },

  async familyMembers(id: string) {
    const { data } = await apiClient.get(`/patients/${id}/family-members`)
    return collection(familyMemberSchema).parse(data)
  },

  async watchers(id: string) {
    const { data } = await apiClient.get(`/patients/${id}/watchers`)
    return collection(watcherSchema).parse(data)
  },

  async caretakers(id: string) {
    const { data } = await apiClient.get(`/patients/${id}/caretakers`)
    return collection(caretakerSchema).parse(data)
  },

  async documents(id: string) {
    const { data } = await apiClient.get(`/patients/${id}/documents`)
    return collection(documentSchema).parse(data)
  },

  async history(id: string) {
    const { data } = await apiClient.get(`/patients/${id}/history`)
    return collection(activitySchema).parse(data)
  },

  /** Candidate duplicates — same name and birthdate. */
  async duplicates(id: string) {
    const { data } = await apiClient.get(`/patients/${id}/duplicates`)
    return collection(patientSchema).parse(data)
  },
}
