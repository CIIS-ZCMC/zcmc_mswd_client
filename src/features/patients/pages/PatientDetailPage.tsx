import { useParams, useNavigate } from 'react-router'
import {
  User,
  FolderOpen,
  HandCoins,
  Printer,
  Calendar,
  Phone,
  MapPin,
  Building2,
  FileSpreadsheet,
  CreditCard,
  Users,
  Eye,
  UserCog,
  FileText,
  History,
  Pencil,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/common/EmptyState'
import { DataTable, type Column } from '@/components/common/DataTable'
import { formatDate, formatPeso } from '@/lib/utils'
import { useAuth } from '@/features/auth'
import {
  useAssessmentsForCases,
  useCasesForPatient,
  priorityTone,
  statusTone,
  type Assessment,
  type CaseRecord,
} from '@/features/cases'
import { useAssistanceForCases, assistanceTone, type Assistance } from '@/features/assistance'
import {
  usePatient,
  usePatientCaretakers,
  usePatientDocuments,
  usePatientFamily,
  usePatientHistory,
  usePatientIds,
  usePatientWatchers,
} from '../queries'
import { patientFullName, patientAge, type Patient } from '../schemas'
import { AddRecordMenu } from '../components/AddRecordMenu'
import { PatientActions } from '../components/PatientActions'

/** One tab per relation the API exposes for a patient. */
const TABS = [
  { key: 'overview', label: 'Overview & Profile', icon: User },
  { key: 'ids', label: 'Identification', icon: CreditCard },
  { key: 'family', label: 'Family', icon: Users },
  { key: 'watchers', label: 'Watchers', icon: Eye },
  { key: 'caretakers', label: 'Assigned Staff', icon: UserCog },
  { key: 'cases', label: 'Social Cases', icon: FolderOpen },
  { key: 'assistance', label: 'Assistance Requests', icon: HandCoins },
  { key: 'assessments', label: 'Assessments', icon: FileSpreadsheet },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'history', label: 'History', icon: History },
] as const

type TabKey = (typeof TABS)[number]['key']

const TAB_KEYS: readonly string[] = TABS.map((t) => t.key)

const dash = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === '' ? '—' : value

/** Shared shell so every tab gets the same tabulated card treatment. */
function TabCard({
  title,
  description,
  badge,
  isLoading,
  children,
}: {
  title: string
  description?: string
  badge?: React.ReactNode
  isLoading?: boolean
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/20">
        <div>
          <CardTitle className="text-base font-bold text-foreground">{title}</CardTitle>
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </div>
        {badge}
      </CardHeader>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6 text-primary" />
        </div>
      ) : (
        children
      )}
    </Card>
  )
}

/** Two-column property table, the layout the profile cards share. */
function PropertyTable({
  headers,
  rows,
}: {
  headers: [string, string]
  rows: { field: string; value: React.ReactNode }[]
}) {
  return (
    <CardBody className="overflow-x-auto p-0">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-border bg-muted/40 font-semibold uppercase text-muted-foreground">
          <tr>
            <th className="w-1/3 px-4 py-3">{headers[0]}</th>
            <th className="w-2/3 px-4 py-3">{headers[1]}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.field} className="transition-colors hover:bg-muted/30">
              <td className="bg-muted/10 px-4 py-3 font-semibold text-muted-foreground">{row.field}</td>
              <td className="px-4 py-3 font-semibold text-foreground">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CardBody>
  )
}

export default function PatientDetailPage() {
  const { id = '', tab = 'overview' } = useParams<{ id: string; tab?: string }>()
  const navigate = useNavigate()
  const { can } = useAuth()
  const activeTab: TabKey = (TAB_KEYS.includes(tab) ? tab : 'overview') as TabKey

  const { data: patient, isLoading } = usePatient(id)

  // Each relation loads only once its tab is open.
  const ids = usePatientIds(id, activeTab === 'ids')
  const family = usePatientFamily(id, activeTab === 'family')
  const watchers = usePatientWatchers(id, activeTab === 'watchers')
  const caretakers = usePatientCaretakers(id, activeTab === 'caretakers')
  const documents = usePatientDocuments(id, activeTab === 'documents')
  const history = usePatientHistory(id, activeTab === 'history')

  // Assistance and assessments hang off cases, so those tabs need the case list.
  const needsCases = ['cases', 'assistance', 'assessments'].includes(activeTab)
  const cases = useCasesForPatient(id, needsCases)
  const caseIds = (cases.data?.items ?? []).map((record) => record.id)

  const assistance = useAssistanceForCases(caseIds, activeTab === 'assistance')
  const assessments = useAssessmentsForCases(caseIds, activeTab === 'assessments')

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  if (!patient) {
    return (
      <Card className="p-8 text-center">
        <EmptyState message="That patient record could not be found. Please select a patient from the registry sidebar." />
      </Card>
    )
  }

  const age = patientAge(patient)
  const fullName = patientFullName(patient)
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')

  const recordNo = patient.mswdId ?? patient.hospitalId ?? patient.id

  /** Counts come from the API's `whenCounted` fields; null means not loaded. */
  const badgeFor: Partial<Record<TabKey, number | null>> = {
    ids: patient.counts.ids,
    family: patient.counts.familyMembers,
    watchers: patient.counts.watchers,
    cases: patient.counts.cases,
    documents: patient.counts.documents,
  }

  return (
    <div className="space-y-6">
      {/* Patient banner */}
      <Card className="border-border bg-gradient-to-r from-card via-card to-muted/20 p-6 shadow-xs">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="size-16 border-2 border-primary/20 shadow-xs">
              <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{fullName}</h1>
                <Badge tone="info" className="font-mono text-xs shadow-2xs">
                  {recordNo}
                </Badge>
                {patient.sectorName && (
                  <Badge tone="neutral" className="text-xs">
                    {patient.sectorName}
                  </Badge>
                )}
                {patient.isArchived && (
                  <Badge tone="danger" className="text-xs">
                    Archived
                  </Badge>
                )}
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" />
                  DOB: {formatDate(patient.birthdate)}
                  {age !== null && ` (${age} yrs old)`}
                </span>
                <span className="flex items-center gap-1.5 capitalize">
                  <User className="size-3.5 text-primary" />
                  Sex: {patient.sex}
                  {patient.civilStatus && ` · ${patient.civilStatus}`}
                </span>
                {patient.contactNumber && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5 text-primary" />
                    {patient.contactNumber}
                  </span>
                )}
                {patient.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-primary" />
                    {patient.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <Button size="sm" variant="outline" onClick={() => window.print()} className="gap-1.5 text-xs">
              <Printer className="size-3.5" />
              <span>Print Profile</span>
            </Button>
            {can('patients.update') && !patient.isArchived && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/patients/${id}/edit`)}
                className="gap-1.5 text-xs"
              >
                <Pencil className="size-3.5" />
                <span>Edit</span>
              </Button>
            )}
            {!patient.isArchived && <AddRecordMenu patient={patient} />}
            <PatientActions patient={patient} onArchived={() => navigate('/patients')} />
          </div>
        </div>
      </Card>

      {patient.isArchived && (
        <p
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          This patient was archived on {formatDate(patient.archivedAt)}. Restore the record to edit it
          or add new records.
        </p>
      )}

      {/* Tab bar */}
      <div className="rounded-xl border border-border bg-card p-1.5 shadow-2xs">
        <nav className="flex space-x-1.5 overflow-x-auto" aria-label="Patient Modules">
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key
            const count = badgeFor[key]
            return (
              <button
                key={key}
                type="button"
                onClick={() => navigate(`/patients/${patient.id}/${key}`)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="size-3.5" />
                <span>{label}</span>
                {count !== null && count !== undefined && count > 0 && (
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-muted-foreground/15 text-muted-foreground'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      <div>
        {activeTab === 'overview' && <OverviewTab patient={patient} age={age} />}
        {activeTab === 'ids' && <IdsTab data={ids.data} isLoading={ids.isLoading} />}
        {activeTab === 'family' && <FamilyTab data={family.data} isLoading={family.isLoading} />}
        {activeTab === 'watchers' && (
          <WatchersTab data={watchers.data} isLoading={watchers.isLoading} />
        )}
        {activeTab === 'caretakers' && (
          <CaretakersTab data={caretakers.data} isLoading={caretakers.isLoading} />
        )}
        {activeTab === 'cases' && (
          <CasesTab patient={patient} data={cases.data?.items} isLoading={cases.isLoading} />
        )}
        {activeTab === 'assistance' && (
          <AssistanceTab
            patient={patient}
            data={assistance.data}
            isLoading={cases.isLoading || assistance.isLoading}
          />
        )}
        {activeTab === 'assessments' && (
          <AssessmentsTab
            cases={cases.data?.items ?? []}
            data={assessments.data}
            isLoading={cases.isLoading || assessments.isLoading}
          />
        )}
        {activeTab === 'documents' && (
          <DocumentsTab data={documents.data} isLoading={documents.isLoading} />
        )}
        {activeTab === 'history' && <HistoryTab data={history.data} isLoading={history.isLoading} />}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Overview */

function OverviewTab({ patient, age }: { patient: Patient; age: number | null }) {
  const personalInfo = [
    { field: 'Full Legal Name', value: patientFullName(patient) },
    { field: 'MSWD Record No.', value: dash(patient.mswdId) },
    { field: 'Hospital Record No.', value: dash(patient.hospitalId) },
    { field: 'Date of Birth', value: formatDate(patient.birthdate) },
    { field: 'Age', value: age === null ? '—' : `${age} years old` },
    { field: 'Biological Sex', value: patient.sex.toUpperCase() },
    { field: 'Civil Status', value: patient.civilStatus ? patient.civilStatus.toUpperCase() : '—' },
    { field: 'Mobile / Contact Number', value: dash(patient.contactNumber) },
  ]

  const addressInfo = [
    { field: 'Street / Purok', value: dash(patient.address) },
    { field: 'Barangay', value: dash(patient.barangay) },
    { field: 'Municipality / City', value: dash(patient.municipality) },
    { field: 'Province', value: dash(patient.province) },
  ]

  const registryInfo = [
    { field: 'Registry System ID', value: patient.id },
    { field: 'Sector', value: dash(patient.sectorName) },
    { field: 'Registration Date', value: formatDate(patient.createdAt) },
    {
      field: 'Record Status',
      value: patient.isArchived ? (
        <Badge tone="danger">Archived</Badge>
      ) : (
        <Badge tone="success">Active</Badge>
      ),
    },
    { field: 'Cases on File', value: dash(patient.counts.cases) },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border bg-muted/20 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
              <User className="size-4 text-primary" />
              Demographics &amp; Personal Details
            </CardTitle>
            <Badge tone="neutral" className="text-[11px]">
              Demographic Record
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Recorded at intake and maintained by the social welfare unit.
          </CardDescription>
        </CardHeader>
        <PropertyTable headers={['System Property', 'Patient Record Value']} rows={personalInfo} />
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-border bg-muted/20 pb-4">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Building2 className="size-4 text-primary" />
              Address &amp; Residence
            </CardTitle>
          </CardHeader>
          <PropertyTable headers={['Attribute', 'Details']} rows={addressInfo} />
        </Card>

        <Card>
          <CardHeader className="border-b border-border bg-muted/20 pb-4">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
              <ShieldCheck className="size-4 text-primary" />
              MSWD Registry Info
            </CardTitle>
          </CardHeader>
          <PropertyTable headers={['Metadata Field', 'Value']} rows={registryInfo} />
        </Card>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ Relation tabs */

type IdRow = {
  id: string
  idType: string
  idNumber: string
  dateExpiry: string | null
  isVerified: boolean
}

function IdsTab({ data, isLoading }: { data?: IdRow[]; isLoading: boolean }) {
  const columns: Column<IdRow>[] = [
    { key: 'idType', header: 'ID Type', render: (r) => <span className="capitalize">{r.idType}</span> },
    {
      key: 'idNumber',
      header: 'ID Number',
      render: (r) => <span className="font-mono font-semibold text-primary">{r.idNumber}</span>,
    },
    { key: 'dateExpiry', header: 'Expires', render: (r) => formatDate(r.dateExpiry) },
    {
      key: 'isVerified',
      header: 'Verified',
      render: (r) =>
        r.isVerified ? (
          <Badge tone="success">Verified</Badge>
        ) : (
          <Badge tone="neutral">Unverified</Badge>
        ),
    },
  ]

  return (
    <TabCard
      title="Identification"
      description="Government and institutional IDs on file."
      isLoading={isLoading}
    >
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(r) => r.id}
        emptyMessage="No identification recorded for this patient."
      />
    </TabCard>
  )
}

type FamilyRow = {
  id: string
  name: string
  relationship: string | null
  age: number | null
  occupation: string | null
  monthlyIncome: number | null
  isLivingWithPatient: boolean
}

function FamilyTab({ data, isLoading }: { data?: FamilyRow[]; isLoading: boolean }) {
  const total = (data ?? []).reduce((sum, row) => sum + (row.monthlyIncome ?? 0), 0)

  const columns: Column<FamilyRow>[] = [
    { key: 'name', header: 'Name', render: (r) => <span className="font-semibold">{r.name}</span> },
    { key: 'relationship', header: 'Relationship', render: (r) => dash(r.relationship) },
    { key: 'age', header: 'Age', render: (r) => dash(r.age) },
    { key: 'occupation', header: 'Occupation', render: (r) => dash(r.occupation) },
    {
      key: 'monthlyIncome',
      header: 'Monthly Income',
      render: (r) => (r.monthlyIncome === null ? '—' : formatPeso(r.monthlyIncome)),
    },
    {
      key: 'isLivingWithPatient',
      header: 'Living With',
      render: (r) =>
        r.isLivingWithPatient ? <Badge tone="success">Yes</Badge> : <Badge tone="neutral">No</Badge>,
    },
  ]

  return (
    <TabCard
      title="Family &amp; Socio-Economic"
      description="Household composition and declared income."
      badge={
        total > 0 ? (
          <Badge tone="info" className="text-[11px]">
            Household income {formatPeso(total)}
          </Badge>
        ) : undefined
      }
      isLoading={isLoading}
    >
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(r) => r.id}
        emptyMessage="No family members recorded for this patient."
      />
    </TabCard>
  )
}

type WatcherRow = {
  id: string
  name: string
  relationship: string | null
  contactNumber: string | null
  address: string | null
  isPrimary: boolean
}

function WatchersTab({ data, isLoading }: { data?: WatcherRow[]; isLoading: boolean }) {
  const columns: Column<WatcherRow>[] = [
    { key: 'name', header: 'Name', render: (r) => <span className="font-semibold">{r.name}</span> },
    { key: 'relationship', header: 'Relationship', render: (r) => dash(r.relationship) },
    { key: 'contactNumber', header: 'Contact', render: (r) => dash(r.contactNumber) },
    { key: 'address', header: 'Address', render: (r) => dash(r.address) },
    {
      key: 'isPrimary',
      header: 'Primary',
      render: (r) =>
        r.isPrimary ? <Badge tone="info">Primary</Badge> : <span className="text-muted-foreground">—</span>,
    },
  ]

  return (
    <TabCard
      title="Watchers"
      description="Companions accountable for the patient."
      isLoading={isLoading}
    >
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(r) => r.id}
        emptyMessage="No watchers recorded for this patient."
      />
    </TabCard>
  )
}

type CaretakerRow = {
  id: string
  userName: string | null
  role: string | null
  assignedDate: string | null
  isActive: boolean
}

function CaretakersTab({ data, isLoading }: { data?: CaretakerRow[]; isLoading: boolean }) {
  const columns: Column<CaretakerRow>[] = [
    { key: 'userName', header: 'Staff', render: (r) => dash(r.userName) },
    { key: 'role', header: 'Role', render: (r) => <span className="capitalize">{dash(r.role)}</span> },
    { key: 'assignedDate', header: 'Assigned', render: (r) => formatDate(r.assignedDate) },
    {
      key: 'isActive',
      header: 'Status',
      render: (r) =>
        r.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Inactive</Badge>,
    },
  ]

  return (
    <TabCard
      title="Assigned Staff"
      description="Social workers currently accountable for this patient."
      isLoading={isLoading}
    >
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(r) => r.id}
        emptyMessage="No staff assigned to this patient."
      />
    </TabCard>
  )
}

/* -------------------------------------------------------------- Case-scoped */

function CasesTab({
  patient,
  data,
  isLoading,
}: {
  patient: Patient
  data?: CaseRecord[]
  isLoading: boolean
}) {
  const columns: Column<CaseRecord>[] = [
    {
      key: 'caseCode',
      header: 'Case No.',
      render: (r) => <span className="font-mono font-bold text-primary">{r.caseCode}</span>,
    },
    { key: 'dateOpened', header: 'Date Opened', render: (r) => formatDate(r.dateOpened) },
    { key: 'assignedUserName', header: 'Social Worker', render: (r) => dash(r.assignedUserName) },
    {
      key: 'caseType',
      header: 'Category',
      render: (r) => <span className="capitalize">{dash(r.caseType)}</span>,
    },
    { key: 'admissionType', header: 'Admission', render: (r) => dash(r.admissionType) },
    {
      key: 'priorityLevel',
      header: 'Priority',
      render: (r) => (
        <Badge tone={priorityTone(r.priorityLevel)} className="capitalize">
          {dash(r.priorityLevel)}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge tone={statusTone(r.status)} className="capitalize">
          {dash(r.status)}
        </Badge>
      ),
    },
  ]

  return (
    <TabCard
      title="Social Cases &amp; Case Notes"
      description={`Cases opened for ${patientFullName(patient)}.`}
      isLoading={isLoading}
    >
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(r) => r.id}
        emptyMessage="No social case records found for this patient."
      />
    </TabCard>
  )
}

function AssistanceTab({
  patient,
  data,
  isLoading,
}: {
  patient: Patient
  data: Assistance[]
  isLoading: boolean
}) {
  const totalReleased = data
    .filter((row) => row.status === 'released')
    .reduce((sum, row) => sum + (row.amount ?? 0), 0)
  const totalRequested = data.reduce((sum, row) => sum + (row.amount ?? 0), 0)
  const pending = data.filter((row) => row.status === 'pending').length

  const columns: Column<Assistance>[] = [
    {
      key: 'id',
      header: 'Control No.',
      render: (r) => (
        <span className="font-mono font-bold text-primary">AST-{r.id.padStart(6, '0')}</span>
      ),
    },
    { key: 'dateGiven', header: 'Date', render: (r) => formatDate(r.dateGiven) },
    { key: 'assistantType', header: 'Assistance Type', render: (r) => dash(r.assistantType) },
    {
      key: 'amount',
      header: 'Amount',
      render: (r) =>
        r.amount === null ? '—' : <span className="font-semibold">{formatPeso(r.amount)}</span>,
    },
    { key: 'guarantor', header: 'Fund Source', render: (r) => dash(r.guarantor) },
    { key: 'notes', header: 'Notes', render: (r) => dash(r.notes) },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge tone={assistanceTone(r.status)} className="capitalize">
          {dash(r.status)}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-emerald-200/70 bg-emerald-50/40 p-4 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            Total Aid Released
          </p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-950">{formatPeso(totalReleased)}</p>
        </Card>
        <Card className="border-border bg-muted/30 p-4 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Requested
          </p>
          <p className="mt-1 text-2xl font-extrabold text-foreground">{formatPeso(totalRequested)}</p>
        </Card>
        <Card className="border-amber-200/70 bg-amber-50/40 p-4 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            Awaiting Approval
          </p>
          <p className="mt-1 text-2xl font-extrabold text-amber-950">{pending}</p>
        </Card>
      </div>

      <TabCard
        title="Assistance Requests Log"
        description={`Aid requested across every case for ${patientFullName(patient)}.`}
        isLoading={isLoading}
      >
        <DataTable
          columns={columns}
          rows={data}
          getRowId={(r) => r.id}
          emptyMessage="No assistance requests found for this patient."
        />
      </TabCard>
    </div>
  )
}

function AssessmentsTab({
  cases,
  data,
  isLoading,
}: {
  cases: CaseRecord[]
  data: Assessment[]
  isLoading: boolean
}) {
  const caseCode = (caseId: string | null) =>
    cases.find((record) => record.id === caseId)?.caseCode ?? '—'

  const columns: Column<Assessment>[] = [
    {
      key: 'caseId',
      header: 'Case No.',
      render: (r) => <span className="font-mono font-bold text-primary">{caseCode(r.caseId)}</span>,
    },
    { key: 'createdAt', header: 'Assessed', render: (r) => formatDate(r.createdAt) },
    {
      key: 'classification',
      header: 'Classification',
      render: (r) => (
        <Badge tone="info" className="capitalize">
          {dash(r.classification?.replace('_', ' '))}
        </Badge>
      ),
    },
    {
      key: 'totalFamilyIncome',
      header: 'Family Income',
      render: (r) => (r.totalFamilyIncome === null ? '—' : formatPeso(r.totalFamilyIncome)),
    },
    {
      key: 'presentingProblem',
      header: 'Presenting Problem',
      render: (r) => dash(r.presentingProblem),
    },
    { key: 'interventionPlan', header: 'Intervention Plan', render: (r) => dash(r.interventionPlan) },
  ]

  return (
    <TabCard
      title="MSWD Assessments"
      description="Socio-economic assessments recorded against this patient's cases."
      isLoading={isLoading}
    >
      <DataTable
        columns={columns}
        rows={data}
        getRowId={(r) => r.id}
        emptyMessage="No assessments recorded for this patient."
      />
    </TabCard>
  )
}

/* --------------------------------------------------------- Documents & log */

type DocumentRow = {
  id: string
  documentType: string | null
  fileName: string | null
  fileType: string | null
  createdAt: string | null
}

function DocumentsTab({ data, isLoading }: { data?: DocumentRow[]; isLoading: boolean }) {
  const columns: Column<DocumentRow>[] = [
    {
      key: 'documentType',
      header: 'Type',
      render: (r) => (
        <Badge tone="neutral" className="capitalize">
          {dash(r.documentType)}
        </Badge>
      ),
    },
    { key: 'fileName', header: 'File', render: (r) => dash(r.fileName) },
    { key: 'fileType', header: 'Format', render: (r) => dash(r.fileType) },
    { key: 'createdAt', header: 'Uploaded', render: (r) => formatDate(r.createdAt) },
  ]

  return (
    <TabCard
      title="Documents"
      description="Files attached to this patient's record."
      isLoading={isLoading}
    >
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(r) => r.id}
        emptyMessage="No documents uploaded for this patient."
      />
    </TabCard>
  )
}

type HistoryRow = {
  id: string
  event: string | null
  description: string | null
  causerName: string | null
  createdAt: string | null
}

function HistoryTab({ data, isLoading }: { data?: HistoryRow[]; isLoading: boolean }) {
  const columns: Column<HistoryRow>[] = [
    { key: 'createdAt', header: 'When', render: (r) => formatDate(r.createdAt) },
    {
      key: 'event',
      header: 'Event',
      render: (r) => (
        <Badge tone="info" className="capitalize">
          {dash(r.event)}
        </Badge>
      ),
    },
    { key: 'description', header: 'Change', render: (r) => dash(r.description) },
    {
      key: 'causerName',
      header: 'By',
      render: (r) => r.causerName ?? <span className="text-muted-foreground">system</span>,
    },
  ]

  return (
    <TabCard
      title="Audit History"
      description="Every change recorded against this patient."
      isLoading={isLoading}
    >
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(r) => r.id}
        emptyMessage="Nothing recorded yet."
      />
    </TabCard>
  )
}
