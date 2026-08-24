import { useState } from 'react'
import { ClipboardList, FileText, FolderOpen, HandCoins, Plus } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { MenuButton } from '@/components/ui/MenuButton'
import { FormField } from '@/components/common/FormField'
import { RecordFormModal } from '@/components/common/RecordFormModal'
import { useAuth } from '@/features/auth'
import { useAssistantTypes, useGuarantors, useUserOptions } from '@/features/lookups'
import {
  ADMISSION_TYPES,
  CASE_TYPES,
  CLASSIFICATIONS,
  PRIORITIES,
  assessmentFormSchema,
  caseFormSchema,
  useCasesForPatient,
  useCreateAssessment,
  useCreateCase,
  type AssessmentFormInput,
  type AssessmentFormOutput,
  type CaseFormInput,
  type CaseFormOutput,
} from '@/features/cases'
import {
  assistanceFormSchema,
  useCreateAssistance,
  type AssistanceFormInput,
  type AssistanceFormOutput,
} from '@/features/assistance'
import {
  REFERRAL_SOURCES,
  intakeFormSchema,
  useCreateIntakeSheet,
  type IntakeFormInput,
  type IntakeFormOutput,
} from '@/features/intake'
import type { Patient } from '../schemas'

type RecordKind = 'case' | 'intake' | 'assessment' | 'assistance'

const today = () => new Date().toISOString().slice(0, 10)

/**
 * One "Add record" button covering the four things a social worker opens
 * against a patient: a case, an intake sheet, an assessment and an assistance
 * request.
 *
 * Assessments and assistance are case-scoped on the API, so those two forms
 * ask which of the patient's cases the record belongs to.
 */
export function AddRecordMenu({ patient }: { patient: Patient }) {
  const { can } = useAuth()
  const [openForm, setOpenForm] = useState<RecordKind | null>(null)
  const close = () => setOpenForm(null)

  // Only fetched once a form that needs them is open.
  const needsCase = openForm === 'assessment' || openForm === 'assistance' || openForm === 'intake'
  const { data: cases, isLoading: casesLoading } = useCasesForPatient(patient.id, needsCase)
  const { data: workers } = useUserOptions(openForm === 'case' && can('users.view'))
  const { data: assistantTypes } = useAssistantTypes()
  const { data: guarantors } = useGuarantors()

  const [caseId, setCaseId] = useState('')

  const openCases = (cases?.items ?? []).filter((record) => record.status !== 'closed')

  // The cases query only starts once a form that needs it opens, so the list is
  // empty on the first render. Derive the selection instead of seeding state,
  // otherwise the picker would show the first case while holding ''.
  const selectedCaseId =
    caseId && openCases.some((record) => record.id === caseId) ? caseId : (openCases[0]?.id ?? '')

  const createCase = useCreateCase()
  const createIntake = useCreateIntakeSheet()
  const createAssessment = useCreateAssessment(selectedCaseId)
  const createAssistance = useCreateAssistance(selectedCaseId)

  function openWithCase(kind: RecordKind) {
    setCaseId('')
    setOpenForm(kind)
  }

  return (
    <>
      <MenuButton
        label="Add record"
        icon={<Plus className="size-4" aria-hidden />}
        items={[
          {
            key: 'case',
            label: 'Case',
            description: 'Open a new social case',
            icon: <FolderOpen className="size-4" aria-hidden />,
            visible: can('cases.create'),
            onSelect: () => setOpenForm('case'),
          },
          {
            key: 'intake',
            label: 'Intake sheet',
            description: 'Record a unified intake',
            icon: <FileText className="size-4" aria-hidden />,
            visible: can('intake.create'),
            onSelect: () => openWithCase('intake'),
          },
          {
            key: 'assessment',
            label: 'Assessment',
            description: 'Assess a case',
            icon: <ClipboardList className="size-4" aria-hidden />,
            visible: can('cases.create'),
            onSelect: () => openWithCase('assessment'),
          },
          {
            key: 'assistance',
            label: 'Assistance',
            description: 'Request aid on a case',
            icon: <HandCoins className="size-4" aria-hidden />,
            visible: can('assistance.create'),
            onSelect: () => openWithCase('assistance'),
          },
        ]}
      />

      {/* ---------------------------------------------------------------- Case */}
      <RecordFormModal<CaseFormInput, CaseFormOutput>
        open={openForm === 'case'}
        onClose={close}
        title="New case"
        description={`Opens a case for ${patient.lastName}, ${patient.firstName}.`}
        submitLabel="Open case"
        successMessage="Case opened"
        schema={caseFormSchema}
        defaultValues={{
          patient_id: patient.id,
          case_type: '',
          priority_level: '',
          admission_type: '',
          date_opened: today(),
          assigned_user_id: '',
        }}
        onSubmit={(values) => createCase.mutateAsync(values)}
      >
        {({ register, formState: { errors } }) => (
          <div className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" {...register('patient_id')} />

            <FormField label="Case type" required error={errors.case_type?.message}>
              <Select {...register('case_type')}>
                <option value="">Select</option>
                {CASE_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Priority" required error={errors.priority_level?.message}>
              <Select {...register('priority_level')}>
                <option value="">Select</option>
                {PRIORITIES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Admission type" required error={errors.admission_type?.message}>
              <Select {...register('admission_type')}>
                <option value="">Select</option>
                {ADMISSION_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Date opened" error={errors.date_opened?.message}>
              <Input type="date" {...register('date_opened')} />
            </FormField>

            {workers && (
              <FormField
                label="Assigned worker"
                hint="Defaults to you if left blank."
                error={errors.assigned_user_id?.message}
                className="sm:col-span-2"
              >
                <Select {...register('assigned_user_id')}>
                  <option value="">Me</option>
                  {workers.map((worker) => (
                    <option key={worker.value} value={worker.value}>
                      {worker.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            )}
          </div>
        )}
      </RecordFormModal>

      {/* -------------------------------------------------------- Intake sheet */}
      <RecordFormModal<IntakeFormInput, IntakeFormOutput>
        open={openForm === 'intake'}
        onClose={close}
        title="New intake sheet"
        description="Attach to an open case, or leave the case blank to open a new one."
        submitLabel="Create intake"
        successMessage="Intake sheet created"
        schema={intakeFormSchema}
        defaultValues={{
          patient_id: patient.id,
          case_id: '',
          case_type: '',
          priority_level: '',
          admission_type: '',
          referral_source: '',
          date_of_intake: today(),
          remarks: '',
        }}
        onSubmit={(values) => createIntake.mutateAsync(values)}
      >
        {({ register, watch, formState: { errors } }) => {
          const attachedCase = watch('case_id')
          return (
            <div className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" {...register('patient_id')} />

              <FormField
                label="Attach to case"
                hint={casesLoading ? 'Loading cases…' : 'Leave blank to open a new case.'}
                error={errors.case_id?.message}
                className="sm:col-span-2"
              >
                <Select {...register('case_id')}>
                  <option value="">Open a new case</option>
                  {openCases.map((record) => (
                    <option key={record.id} value={record.id}>
                      {record.caseCode} · {record.caseType ?? '—'} ({record.status})
                    </option>
                  ))}
                </Select>
              </FormField>

              {/* The API requires `case_id` xor a full `case` object. */}
              {!attachedCase && (
                <>
                  <FormField label="Case type" required error={errors.case_type?.message}>
                    <Select {...register('case_type')}>
                      <option value="">Select</option>
                      {CASE_TYPES.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  <FormField label="Priority" required error={errors.priority_level?.message}>
                    <Select {...register('priority_level')}>
                      <option value="">Select</option>
                      {PRIORITIES.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  <FormField
                    label="Admission type"
                    required
                    error={errors.admission_type?.message}
                    className="sm:col-span-2"
                  >
                    <Select {...register('admission_type')}>
                      <option value="">Select</option>
                      {ADMISSION_TYPES.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </>
              )}

              <FormField label="Referral source" error={errors.referral_source?.message}>
                <Select {...register('referral_source')}>
                  <option value="">Select</option>
                  {REFERRAL_SOURCES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Date of intake" error={errors.date_of_intake?.message}>
                <Input type="date" {...register('date_of_intake')} />
              </FormField>

              <FormField label="Remarks" error={errors.remarks?.message} className="sm:col-span-2">
                <Textarea rows={3} {...register('remarks')} />
              </FormField>
            </div>
          )
        }}
      </RecordFormModal>

      {/* ---------------------------------------------------------- Assessment */}
      <RecordFormModal<AssessmentFormInput, AssessmentFormOutput>
        open={openForm === 'assessment'}
        onClose={close}
        title="New assessment"
        description="Recorded against one of this patient's cases."
        submitLabel="Save assessment"
        successMessage="Assessment recorded"
        schema={assessmentFormSchema}
        defaultValues={{
          classification: '',
          total_family_income: '',
          presenting_problem: '',
          family_background: '',
          intervention_plan: '',
        }}
        onSubmit={(values) => createAssessment.mutateAsync(values)}
      >
        {({ register, formState: { errors } }) => (
          <div className="grid gap-4 sm:grid-cols-2">
            <CasePicker
              value={selectedCaseId}
              onChange={setCaseId}
              options={openCases}
              isLoading={casesLoading}
            />

            <FormField label="Classification" required error={errors.classification?.message}>
              <Select {...register('classification')}>
                <option value="">Select</option>
                {CLASSIFICATIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField
              label="Total family income"
              error={errors.total_family_income?.message}
            >
              <Input type="number" min={0} step="0.01" {...register('total_family_income')} />
            </FormField>

            <FormField
              label="Presenting problem"
              error={errors.presenting_problem?.message}
              className="sm:col-span-2"
            >
              <Textarea rows={3} {...register('presenting_problem')} />
            </FormField>

            <FormField
              label="Family background"
              error={errors.family_background?.message}
              className="sm:col-span-2"
            >
              <Textarea rows={3} {...register('family_background')} />
            </FormField>

            <FormField
              label="Intervention plan"
              error={errors.intervention_plan?.message}
              className="sm:col-span-2"
            >
              <Textarea rows={3} {...register('intervention_plan')} />
            </FormField>
          </div>
        )}
      </RecordFormModal>

      {/* ---------------------------------------------------------- Assistance */}
      <RecordFormModal<AssistanceFormInput, AssistanceFormOutput>
        open={openForm === 'assistance'}
        onClose={close}
        title="New assistance request"
        description="Recorded against one of this patient's cases, starting as pending."
        submitLabel="Request assistance"
        successMessage="Assistance requested"
        schema={assistanceFormSchema}
        defaultValues={{
          assistant_type_id: '',
          guarantor_id: '',
          amount: '',
          notes: '',
          date_given: today(),
        }}
        onSubmit={(values) => createAssistance.mutateAsync(values)}
      >
        {({ register, formState: { errors } }) => (
          <div className="grid gap-4 sm:grid-cols-2">
            <CasePicker
              value={selectedCaseId}
              onChange={setCaseId}
              options={openCases}
              isLoading={casesLoading}
            />

            <FormField label="Assistance type" required error={errors.assistant_type_id?.message}>
              <Select {...register('assistant_type_id')}>
                <option value="">Select</option>
                {assistantTypes?.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Guarantor" error={errors.guarantor_id?.message}>
              <Select {...register('guarantor_id')}>
                <option value="">None</option>
                {guarantors?.map((guarantor) => (
                  <option key={guarantor.value} value={guarantor.value}>
                    {guarantor.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Amount" error={errors.amount?.message}>
              <Input type="number" min={0} step="0.01" {...register('amount')} />
            </FormField>

            <FormField label="Date" error={errors.date_given?.message}>
              <Input type="date" {...register('date_given')} />
            </FormField>

            <FormField label="Notes" error={errors.notes?.message} className="sm:col-span-2">
              <Textarea rows={3} {...register('notes')} />
            </FormField>
          </div>
        )}
      </RecordFormModal>
    </>
  )
}

/**
 * Case selector for the record types the API scopes to a case. Kept outside the
 * form because the case id is a route segment, not a posted field.
 */
function CasePicker({
  value,
  onChange,
  options,
  isLoading,
}: {
  value: string
  onChange: (value: string) => void
  options: { id: string; caseCode: string; caseType: string | null; status: string | null }[]
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <p className="text-sm text-ink-muted sm:col-span-2" role="status">
        Loading this patient's cases…
      </p>
    )
  }

  if (options.length === 0) {
    return (
      <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 sm:col-span-2">
        This patient has no open case yet. Add a case first — assessments and assistance are
        recorded against one.
      </p>
    )
  }

  return (
    <FormField label="Case" required className="sm:col-span-2">
      <Select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((record) => (
          <option key={record.id} value={record.id}>
            {record.caseCode} · {record.caseType ?? '—'} ({record.status})
          </option>
        ))}
      </Select>
    </FormField>
  )
}
