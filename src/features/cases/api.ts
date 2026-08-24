import { apiClient } from '@/lib/api-client'
import { collection, paginated, resource } from '@/lib/api-envelope'
import type { Paginated } from '@/types'
import type { ListQueryParams } from '@/hooks/useListQuery'
import {
  assessmentSchema,
  caseSchema,
  type AssessmentFormOutput,
  type CaseFormOutput,
  type CaseRecord,
} from './schemas'

/** Strip keys the form left undefined so the server applies its own defaults. */
function defined(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined))
}

export const casesApi = {
  async list(params: ListQueryParams): Promise<Paginated<CaseRecord>> {
    const { data } = await apiClient.get('/cases', { params })
    return paginated(caseSchema).parse(data)
  },

  /** Every case belonging to one patient, newest first. */
  async forPatient(patientId: string): Promise<Paginated<CaseRecord>> {
    const { data } = await apiClient.get('/cases', {
      params: { 'filter[patient_id]': patientId, per_page: 100 },
    })
    return paginated(caseSchema).parse(data)
  },

  async create(input: CaseFormOutput): Promise<CaseRecord> {
    const { data } = await apiClient.post('/cases', defined(input))
    return resource(caseSchema).parse(data)
  },

  async assessments(caseId: string) {
    const { data } = await apiClient.get(`/cases/${caseId}/assessments`)
    return collection(assessmentSchema).parse(data)
  },

  async createAssessment(caseId: string, input: AssessmentFormOutput) {
    const { data } = await apiClient.post(`/cases/${caseId}/assessments`, defined(input))
    return resource(assessmentSchema).parse(data)
  },
}
