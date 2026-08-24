import { useNavigate } from 'react-router'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { useToast } from '@/components/ui/toast-context'
import { PatientForm } from '../components/PatientForm'
import { useCreatePatient } from '../queries'
import type { PatientFormOutput } from '../schemas'

export default function PatientIntakePage() {
  const navigate = useNavigate()
  const { notify } = useToast()
  const createPatient = useCreatePatient()

  async function handleSubmit(values: PatientFormOutput) {
    const patient = await createPatient.mutateAsync(values)
    notify({ tone: 'success', title: 'Patient registered' })
    navigate(`/patients/${patient.id}`, { replace: true })
  }

  return (
    <>
      <PageHeader title="New patient" description="Register a patient with the social welfare unit." />
      <Card className="max-w-4xl">
        <CardBody className="p-6">
          <PatientForm onSubmit={handleSubmit} onCancel={() => navigate('/patients')} />
        </CardBody>
      </Card>
    </>
  )
}
