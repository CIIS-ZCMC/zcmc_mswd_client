import { useState } from 'react'
import { Archive, ArchiveRestore, ArrowLeftRight, Undo2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/common/FormField'
import { RecordAction } from '@/components/common/RecordAction'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuth } from '@/features/auth'
import {
  useArchivePatient,
  useMergePatient,
  usePatients,
  useRestorePatient,
  useUnmergePatient,
} from '../queries'
import { patientFullName, type Patient } from '../schemas'

/** Search-and-pick control for choosing the patient to merge into. */
function MergeTargetPicker({
  excludeId,
  value,
  onChange,
}: {
  excludeId: string
  value: string
  onChange: (value: string) => void
}) {
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search)
  const { data, isFetching } = usePatients({ page: 1, per_page: 10, search: debounced || undefined })

  const candidates = (data?.items ?? []).filter((patient) => patient.id !== excludeId)

  return (
    <div className="flex flex-col gap-3">
      <FormField label="Search for the patient to keep">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name or MSWD ID…"
        />
      </FormField>

      <div className="max-h-56 overflow-y-auto rounded-md border border-border-subtle">
        {isFetching && candidates.length === 0 && (
          <p className="px-3 py-2 text-sm text-ink-muted">Searching…</p>
        )}
        {!isFetching && candidates.length === 0 && (
          <p className="px-3 py-2 text-sm text-ink-muted">No other patients match.</p>
        )}
        {candidates.map((candidate) => (
          <button
            key={candidate.id}
            type="button"
            onClick={() => onChange(candidate.id)}
            className={`block w-full px-3 py-2 text-left text-sm hover:bg-surface-muted ${
              value === candidate.id ? 'bg-brand-50 text-brand-700' : 'text-ink'
            }`}
          >
            {patientFullName(candidate)}
            <span className="ml-2 text-xs text-ink-muted">
              MSWD {candidate.mswdId ?? '—'}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * The record actions from Filament's `PatientResource` table, with the same
 * visibility rules: merge and archive only on a live record, restore only on an
 * archived one, each behind its permission.
 */
export function PatientActions({ patient, onArchived }: { patient: Patient; onArchived?: () => void }) {
  const { can } = useAuth()
  const archive = useArchivePatient(patient.id)
  const restore = useRestorePatient(patient.id)
  const merge = useMergePatient(patient.id)
  const unmerge = useUnmergePatient(patient.id)

  const canMerge = can('patients.merge')
  const canDelete = can('patients.delete')

  return (
    <div className="flex flex-wrap items-center gap-2">
      <RecordAction<string>
        label="Merge"
        icon={<ArrowLeftRight className="size-4" aria-hidden />}
        visible={canMerge && !patient.isArchived}
        initialValue=""
        isValid={(value) => value !== ''}
        confirm={{
          title: 'Merge patient',
          description:
            'Every record owned by this patient moves to the patient you choose. This can be reversed afterwards.',
          confirmLabel: 'Merge',
        }}
        form={({ value, onChange }) => (
          <MergeTargetPicker excludeId={patient.id} value={value} onChange={onChange} />
        )}
        onRun={(targetId) => merge.mutateAsync(targetId)}
        successMessage="Patient merged"
        errorMessage="Could not merge the patient"
      />

      <RecordAction
        label="Reverse merge"
        icon={<Undo2 className="size-4" aria-hidden />}
        visible={canMerge}
        confirm={{
          title: 'Reverse the last merge',
          description: 'Restores the records moved by the most recent merge into this patient.',
          confirmLabel: 'Reverse',
        }}
        onRun={() => unmerge.mutateAsync()}
        successMessage="Merge reversed"
        errorMessage="Could not reverse the merge"
      />

      <RecordAction
        label="Archive"
        icon={<Archive className="size-4" aria-hidden />}
        variant="danger"
        visible={canDelete && !patient.isArchived}
        confirm={{
          title: 'Archive patient',
          description:
            'The record is hidden from the registry but not deleted. Patients with an open or ongoing case cannot be archived.',
          confirmLabel: 'Archive',
        }}
        onRun={async () => {
          await archive.mutateAsync()
          onArchived?.()
        }}
        successMessage="Patient archived"
        errorMessage="Cannot archive"
      />

      <RecordAction
        label="Restore"
        icon={<ArchiveRestore className="size-4" aria-hidden />}
        visible={canDelete && patient.isArchived}
        onRun={() => restore.mutateAsync()}
        successMessage="Patient restored"
        errorMessage="Could not restore the patient"
      />
    </div>
  )
}
