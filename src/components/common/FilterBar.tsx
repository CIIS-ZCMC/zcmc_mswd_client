import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { TrashedScope } from '@/hooks/useListQuery'

export interface SelectFilter {
  name: string
  label: string
  options: { value: string; label: string }[]
}

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: SelectFilter[]
  values?: Record<string, string>
  onFilterChange?: (name: string, value: string | undefined) => void
  /** Omit to hide the archived control on resources that are not soft-deletable. */
  trashed?: TrashedScope
  onTrashedChange?: (value: TrashedScope) => void
  isFiltered?: boolean
  onReset?: () => void
}

/**
 * Search + select filters + archived scope, the client's equivalent of a
 * Filament table's filter row. State lives in `useListQuery`, not here.
 */
export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  filters = [],
  values = {},
  onFilterChange,
  trashed,
  onTrashedChange,
  isFiltered,
  onReset,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-border-subtle px-4 py-3">
      <div className="relative min-w-56 flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
          aria-hidden
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="pl-9"
        />
      </div>

      {filters.map((filter) => (
        <label key={filter.name} className="flex flex-col gap-1 text-xs text-ink-muted">
          {filter.label}
          <Select
            className="h-9 min-w-40"
            value={values[filter.name] ?? ''}
            onChange={(event) => onFilterChange?.(filter.name, event.target.value || undefined)}
          >
            <option value="">All</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>
      ))}

      {trashed !== undefined && onTrashedChange && (
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          Archived
          <Select
            className="h-9 min-w-40"
            value={trashed}
            onChange={(event) => onTrashedChange(event.target.value as TrashedScope)}
          >
            <option value="without">Hide archived</option>
            <option value="with">Include archived</option>
            <option value="only">Archived only</option>
          </Select>
        </label>
      )}

      {isFiltered && onReset && (
        <Button variant="ghost" size="sm" onClick={onReset} className="h-9">
          <X className="size-4" aria-hidden />
          Clear
        </Button>
      )}
    </div>
  )
}
