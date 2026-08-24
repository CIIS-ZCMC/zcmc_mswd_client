import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable, type Column } from './DataTable'

interface Row {
  id: string
  name: string
}

const columns: Column<Row>[] = [
  { key: 'name', header: 'Name', render: (row) => row.name, sortable: true },
]

describe('DataTable', () => {
  it('shows a loading indicator instead of rows while fetching', () => {
    render(<DataTable columns={columns} rows={[]} getRowId={(r) => r.id} isLoading />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows the empty message when there are no rows', () => {
    render(
      <DataTable
        columns={columns}
        rows={[]}
        getRowId={(r) => r.id}
        emptyMessage="No patients found."
      />,
    )
    expect(screen.getByText('No patients found.')).toBeInTheDocument()
  })

  it('renders rows and toggles sort direction on repeated header clicks', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        rows={[{ id: '1', name: 'Dela Cruz' }]}
        getRowId={(r) => r.id}
        sort={{ sortBy: 'name', sortDir: 'asc' }}
        onSortChange={onSortChange}
      />,
    )

    expect(screen.getByText('Dela Cruz')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /name/i }))
    expect(onSortChange).toHaveBeenCalledWith({ sortBy: 'name', sortDir: 'desc' })
  })
})
