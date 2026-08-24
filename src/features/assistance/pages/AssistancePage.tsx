import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/common/EmptyState'

export default function AssistancePage() {
  return (
    <>
      <PageHeader title="Assistance requests" description="Financial and medical assistance requests awaiting action." />
      <Card>
        <EmptyState message="This module has not been built yet." />
      </Card>
    </>
  )
}
