import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/common/EmptyState'

export default function CasesPage() {
  return (
    <>
      <PageHeader title="Cases" description="Social case assessments and progress notes." />
      <Card>
        <EmptyState message="This module has not been built yet." />
      </Card>
    </>
  )
}
