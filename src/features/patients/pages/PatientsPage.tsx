import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/common/DataTable'
import { FilterBar } from '@/components/common/FilterBar'
import { Pagination } from '@/components/common/Pagination'
import { useListQuery } from '@/hooks/useListQuery'
import { useSectors } from '@/features/lookups'
import { useAuth } from '@/features/auth'
import { formatDate } from '@/lib/utils'
import { usePatients } from '../queries'
import { patientAge, patientFullName, type Patient } from '../schemas'
import { SEXES } from '../schemas'

const FILTER_KEYS = ['sector_id', 'sex']

/** The patient registry table — the client's counterpart to Filament's ListPatients. */
export default function PatientsPage() {
  const navigate = useNavigate()
  const { can } = useAuth()
  const { data: sectors } = useSectors()

  const query = useListQuery({ filterKeys: FILTER_KEYS })
  const { data, isLoading, isFetching } = usePatients(query.params)

  const filters = useMemo(
    () => [
      { name: 'sector_id', label: 'Sector', options: sectors ?? [] },
      { name: 'sex', label: 'Sex', options: SEXES.map((s) => ({ value: s.value, label: s.label })) },
    ],
    [sectors],
  )

  const columns: Column<Patient>[] = [
    {
      key: 'mswd_id',
      header: 'MSWD ID',
      sortable: true,
      render: (patient) => patient.mswdId ?? '—',
    },
    {
      key: 'last_name',
      header: 'Name',
      sortable: true,
      render: (patient) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{patientFullName(patient)}</span>
          {patient.isArchived && <Badge tone="danger">Archived</Badge>}
        </div>
      ),
    },
    {
      key: 'hospital_id',
      header: 'Hospital ID',
      render: (patient) => patient.hospitalId ?? '—',
    },
    { key: 'sector', header: 'Sector', render: (patient) => patient.sectorName ?? '—' },
    {
      key: 'age',
      header: 'Age',
      render: (patient) => patientAge(patient) ?? '—',
    },
    {
      key: 'cases_count',
      header: 'Cases',
      render: (patient) =>
        patient.counts.cases === null ? '—' : <Badge tone="info">{patient.counts.cases}</Badge>,
    },
    {
      key: 'created_at',
      header: 'Registered',
      sortable: true,
      render: (patient) => formatDate(patient.createdAt),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="Every patient registered with the social welfare unit."
        actions={
          can('patients.create') && (
            <Button onClick={() => navigate('/patients/new')}>
              <UserPlus className="size-4" aria-hidden />
              New patient
            </Button>
          )
        }
      />

      <Card className="overflow-hidden">
        <FilterBar
          search={query.state.search}
          onSearchChange={query.setSearch}
          searchPlaceholder="Search by name, MSWD ID or hospital ID…"
          filters={filters}
          values={query.state.filters}
          onFilterChange={query.setFilter}
          trashed={can('patients.delete') ? query.state.trashed : undefined}
          onTrashedChange={query.setTrashed}
          isFiltered={query.isFiltered}
          onReset={query.reset}
        />

        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          getRowId={(patient) => patient.id}
          isLoading={isLoading}
          emptyMessage={
            query.isFiltered
              ? 'No patients match these filters.'
              : 'No patients have been registered yet.'
          }
          sort={
            query.state.sort
              ? { sortBy: query.state.sort, sortDir: query.state.direction }
              : undefined
          }
          onSortChange={query.setSort}
          onRowClick={(patient) => navigate(`/patients/${patient.id}`)}
        />

        {data && data.total > 0 && (
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            onPageChange={query.setPage}
          />
        )}
      </Card>

      {/* Subtle cue that a filter change is in flight without blanking the table. */}
      {isFetching && !isLoading && (
        <p className="text-xs text-ink-muted" role="status">
          Updating…
        </p>
      )}
    </div>
  )
}
