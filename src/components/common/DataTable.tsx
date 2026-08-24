import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/common/EmptyState'

export interface Column<T> {
  /** Stable key; also the sort field sent to the API when `sortable`. */
  key: string
  header: string
  render: (row: T) => ReactNode
  sortable?: boolean
  className?: string
}

export interface SortState {
  sortBy: string
  sortDir: 'asc' | 'desc'
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  getRowId: (row: T) => string
  isLoading?: boolean
  emptyMessage?: string
  sort?: SortState
  onSortChange?: (sort: SortState) => void
  onRowClick?: (row: T) => void
}

/**
 * The registry workhorse: styled according to shadcn UI table design standards.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  isLoading,
  emptyMessage = 'Nothing to show yet.',
  sort,
  onSortChange,
  onRowClick,
}: DataTableProps<T>) {
  function toggleSort(key: string) {
    if (!onSortChange) return
    const dir = sort?.sortBy === key && sort.sortDir === 'asc' ? 'desc' : 'asc'
    onSortChange({ sortBy: key, sortDir: dir })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-muted-foreground">
        <Spinner className="size-5 text-primary" />
        <span>Loading records…</span>
      </div>
    )
  }

  if (rows.length === 0) return <EmptyState message={emptyMessage} />

  return (
    <div className="relative w-full overflow-auto rounded-xl border border-border/80 bg-card shadow-xs">
      <table className="w-full caption-bottom text-sm">
        <thead className="border-b border-border/80 bg-muted/30">
          <tr className="border-b border-border/80 transition-colors hover:bg-muted/40 text-left">
            {columns.map((column) => {
              const active = sort?.sortBy === column.key
              return (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'h-11 px-4 text-left align-middle text-xs font-bold text-muted-foreground uppercase tracking-wider font-heading',
                    column.className,
                  )}
                >
                  {column.sortable && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors group font-semibold"
                      aria-sort={active ? (sort.sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      <span>{column.header}</span>
                      {active ? (
                        sort.sortDir === 'asc' ? (
                          <ChevronUp className="size-3.5 text-primary font-bold" aria-hidden />
                        ) : (
                          <ChevronDown className="size-3.5 text-primary font-bold" aria-hidden />
                        )
                      ) : (
                        <ArrowUpDown className="size-3 opacity-0 group-hover:opacity-60 transition-opacity" aria-hidden />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {rows.map((row) => (
            <tr
              key={getRowId(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'transition-colors duration-150 hover:bg-accent/40 data-[state=selected]:bg-muted',
                onRowClick && 'cursor-pointer',
              )}
            >
              {columns.map((column) => (
                <td key={column.key} className={cn('p-4 align-middle text-foreground font-normal', column.className)}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

