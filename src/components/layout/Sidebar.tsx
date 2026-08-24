import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ChevronRight, Hospital, Search, UserPlus } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Spinner } from '@/components/ui/Spinner'
import { useDebounce } from '@/hooks/useDebounce'
import { usePatients, patientFullName } from '@/features/patients'
import { useAuth } from '@/features/auth'
import { cn } from '@/lib/utils'

/**
 * The patient registry: styled to shadcn UI sidebar specifications.
 */
export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const navigate = useNavigate()
  const params = useParams()
  const { can } = useAuth()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  const { data, isLoading } = usePatients({
    page: 1,
    per_page: 50,
    search: debouncedSearch || undefined,
  })

  const currentPatientId = params.id ?? ''

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onNavigate}
          aria-hidden
        />
      )}
      <aside
        aria-label="Patient registry"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-80 flex-col border-r border-border/80 bg-card/95 backdrop-blur-md transition-transform lg:static lg:translate-x-0 shadow-lg lg:shadow-none',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/80 px-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white font-bold shadow-sm ring-1 ring-brand-500/30">
              <Hospital className="size-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight tracking-tight text-foreground font-heading">ZCMC MSWD</h1>
              <p className="text-[11px] text-muted-foreground font-medium">Patient Registry</p>
            </div>
          </div>
          {can('patients.create') && (
            <Button
              size="sm"
              onClick={() => {
                navigate('/patients/new')
                onNavigate()
              }}
              className="gap-1.5 text-xs shadow-xs"
            >
              <UserPlus className="size-3.5" />
              <span>Intake</span>
            </Button>
          )}
        </div>

        <div className="border-b border-border/80 bg-muted/20 p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search name or hospital no…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 bg-background/80 pl-8 text-xs shadow-2xs focus-visible:border-brand-500"
              aria-label="Search patient registry"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-4 py-2 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
          <span>PATIENT LIST</span>
          <Badge tone="neutral" className="px-2 py-0 text-[10px] font-mono shadow-2xs">
            {data?.total ?? 0}
          </Badge>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-5 text-primary" />
            </div>
          ) : !data?.items.length ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              {search ? `No patients match "${search}"` : 'No patients registered yet.'}
            </div>
          ) : (
            data.items.map((patient) => {
              const isSelected = currentPatientId === patient.id
              const fullName = patientFullName(patient)
              const initials = fullName
                .split(' ')
                .map((n) => n[0])
                .filter(Boolean)
                .slice(0, 2)
                .join('')

              return (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => {
                    navigate(`/patients/${patient.id}`)
                    onNavigate()
                  }}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all duration-150',
                    isSelected
                      ? 'border-l-4 border-primary bg-accent/90 text-accent-foreground shadow-xs font-medium'
                      : 'text-foreground hover:bg-accent/50 hover:translate-x-0.5',
                  )}
                >
                  <Avatar className="size-8 text-[11px] ring-1 ring-border/50">
                    <AvatarFallback className={isSelected ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white font-bold' : 'bg-muted text-muted-foreground font-semibold'}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 pr-1">
                    <p
                      className={cn(
                        'truncate text-sm font-semibold leading-tight',
                        isSelected ? 'text-primary font-bold' : 'text-foreground group-hover:text-primary transition-colors',
                      )}
                    >
                      {fullName}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-md border border-border/80 bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
                        {patient.mswdId ?? patient.hospitalId ?? '—'}
                      </span>
                      <span className="capitalize text-[11px] font-medium">{patient.sex}</span>
                    </div>
                  </div>
                  <ChevronRight
                    className={cn(
                      'size-4 transition-transform group-hover:translate-x-0.5',
                      isSelected ? 'text-primary' : 'text-muted-foreground/40',
                    )}
                  />
                </button>
              )
            })
          )}
        </div>
      </aside>
    </>
  )
}

