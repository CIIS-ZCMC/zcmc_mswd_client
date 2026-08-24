import { apiClient } from '@/lib/api-client'
import { collection, resource } from '@/lib/api-envelope'
import { assistanceSchema, type AssistanceFormOutput } from './schemas'

function defined(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined))
}

export const assistanceApi = {
  /** Assistance is always case-scoped; there is no global list endpoint. */
  async forCase(caseId: string) {
    const { data } = await apiClient.get(`/cases/${caseId}/assistances`)
    return collection(assistanceSchema).parse(data)
  },

  async create(caseId: string, input: AssistanceFormOutput) {
    const { data } = await apiClient.post(`/cases/${caseId}/assistances`, defined(input))
    return resource(assistanceSchema).parse(data)
  },
}
