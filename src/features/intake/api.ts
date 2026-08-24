import { apiClient } from '@/lib/api-client'
import { resource } from '@/lib/api-envelope'
import { intakeSheetSchema, type IntakeFormOutput } from './schemas'

export const intakeApi = {
  /**
   * Posts the nested payload `StoreUnifiedIntakeSheetRequest` expects: a flat
   * header, plus either `case_id` or a nested `case` object.
   */
  async create(input: IntakeFormOutput) {
    const body: Record<string, unknown> = { patient_id: Number(input.patient_id) }

    if (input.case_id) {
      body.case_id = Number(input.case_id)
    } else {
      body.case = {
        case_type: input.case_type,
        priority_level: input.priority_level,
        admission_type: input.admission_type,
      }
    }

    if (input.referral_source) body.referral_source = input.referral_source
    if (input.date_of_intake) body.date_of_intake = input.date_of_intake
    if (input.remarks) body.remarks = input.remarks

    const { data } = await apiClient.post('/intake-sheets', body)
    return resource(intakeSheetSchema).parse(data)
  },
}
