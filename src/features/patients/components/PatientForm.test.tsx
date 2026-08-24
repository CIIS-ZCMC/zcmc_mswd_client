import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { PatientForm } from './PatientForm'

describe('PatientForm', () => {
  it('blocks submission until the required fields are filled', async () => {
    const onSubmit = vi.fn()
    const { user } = renderWithProviders(<PatientForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /save patient/i }))

    expect(await screen.findByText('First name is required')).toBeInTheDocument()
    expect(screen.getByText('Last name is required')).toBeInTheDocument()
    expect(screen.getByText('Sector is required')).toBeInTheDocument()
    expect(screen.getByText('Sex is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects a birthdate in the future', async () => {
    const onSubmit = vi.fn()
    const { user } = renderWithProviders(<PatientForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/date of birth/i), '2099-01-01')
    await user.click(screen.getByRole('button', { name: /save patient/i }))

    expect(await screen.findByText('Date of birth cannot be in the future')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the API field names and drops untouched optional fields', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const { user } = renderWithProviders(<PatientForm onSubmit={onSubmit} />)

    // Sector options come from the lookup endpoint.
    await waitFor(() => expect(screen.getByRole('option', { name: 'Medical' })).toBeInTheDocument())

    await user.selectOptions(screen.getByLabelText(/sector/i), '1')
    await user.type(screen.getByLabelText(/first name/i), 'Juan')
    await user.type(screen.getByLabelText(/last name/i), 'Dela Cruz')
    await user.selectOptions(screen.getByLabelText(/^sex/i), 'male')
    await user.click(screen.getByRole('button', { name: /save patient/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))

    const payload = onSubmit.mock.calls[0][0]
    expect(payload).toMatchObject({
      sector_id: '1',
      first_name: 'Juan',
      last_name: 'Dela Cruz',
      sex: 'male',
    })
    // Empty optional inputs become undefined so they are stripped before POST.
    expect(payload.middle_name).toBeUndefined()
    expect(payload.barangay).toBeUndefined()
  })
})
