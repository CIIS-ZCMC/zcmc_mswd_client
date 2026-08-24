import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { renderWithProviders } from '@/test/utils'
import { server } from '@/test/mocks/server'
import { session } from '@/lib/session'
import PatientsPage from './PatientsPage'

const API = 'http://localhost:8000/api'

describe('PatientsPage', () => {
  it('renders patients from the API envelope', async () => {
    renderWithProviders(<PatientsPage />)

    expect(await screen.findByText('Dela Cruz, Juan Santos')).toBeInTheDocument()

    // Scope to the table: 'Medical' is also a sector option in the filter bar.
    const row = within(screen.getByRole('table')).getByRole('row', {
      name: /Dela Cruz, Juan Santos/,
    })
    expect(within(row).getByText('Medical')).toBeInTheDocument()
    // `cases_count` comes back from the list endpoint's withCount.
    expect(within(row).getByText('2')).toBeInTheDocument()
  })

  it('sends the search term to the API as ?search=', async () => {
    const requested: string[] = []
    server.use(
      http.get(`${API}/patients`, ({ request }) => {
        const search = new URL(request.url).searchParams.get('search')
        if (search) requested.push(search)
        return HttpResponse.json({
          data: [],
          meta: { current_page: 1, per_page: 15, total: 0, last_page: 1 },
        })
      }),
    )

    const { user } = renderWithProviders(<PatientsPage />)

    await user.type(screen.getByRole('searchbox'), 'Santos')

    await waitFor(() => expect(requested).toContain('Santos'))
    expect(await screen.findByText('No patients match these filters.')).toBeInTheDocument()
  })

  it('hides the New patient button without patients.create', async () => {
    // The signed-out user has no permissions at all.
    session.clear()
    renderWithProviders(<PatientsPage />)

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /new patient/i })).not.toBeInTheDocument(),
    )
  })
})
