import { useNavigate, useParams } from 'react-router'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/common/EmptyState'
import { useToast } from '@/components/ui/toast-context'
import { PatientForm } from '../components/PatientForm'
import { usePatient, useUpdatePatient } from '../queries'
import { patientFullName, type PatientFormInput, type PatientFormOutput } from '../schemas'

export default function PatientEditPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notify } = useToast()
  const { data: patient, isLoading } = usePatient(id)
  const updatePatient = useUpdatePatient(id)

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-8 text-brand-600" />
      </div>
    )
  }

  if (!patient) {
    return (
      <Card className="p-8">
        <EmptyState message="That patient record could not be found." />
      </Card>
    )
  }

  // The form speaks the API's field names, so the record maps back directly.
  // Dates arrive as full ISO timestamps but `<input type="date">` wants Y-M-D.
  const defaultValues: Partial<PatientFormInput> = {
    sector_id: patient.sectorId ?? '',
    hospital_id: patient.hospitalId ?? '',
    first_name: patient.firstName,
    last_name: patient.lastName,
    middle_name: patient.middleName ?? '',
    extension_name: patient.extensionName ?? '',
    sex: patient.sex,
    civil_status: patient.civilStatus ?? '',
    birthdate: patient.birthdate?.slice(0, 10) ?? '',
    estimated_age: patient.estimatedAge == null ? '' : String(patient.estimatedAge),
    address: patient.address ?? '',
    barangay: patient.barangay ?? '',
    municipality: patient.municipality ?? '',
    province: patient.province ?? '',
    contact_number: patient.contactNumber ?? '',
  }

  async function handleSubmit(values: PatientFormOutput) {
    await updatePatient.mutateAsync(values)
    notify({ tone: 'success', title: 'Patient updated' })
    navigate(`/patients/${id}`)
  }

  return (
    <>
      <PageHeader title={`Edit ${patientFullName(patient)}`} description="Update the patient record." />
      <Card className="max-w-4xl">
        <CardBody className="p-6">
          <PatientForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/patients/${id}`)}
            submitLabel="Save changes"
          />
        </CardBody>
      </Card>
    </>
  )
}
