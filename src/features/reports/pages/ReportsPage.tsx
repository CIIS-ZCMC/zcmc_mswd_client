import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/common/EmptyState'

export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports" description="Statistical reports and exports for the social welfare unit." />
      <Card>
        <EmptyState message="This module has not been built yet." />
      </Card>
    </>
  )
}
