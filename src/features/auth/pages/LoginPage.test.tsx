import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { session } from '@/lib/session'
import LoginPage from './LoginPage'

async function fillAndSubmit(user: ReturnType<typeof renderWithProviders>['user'], password: string) {
  await user.type(screen.getByLabelText(/email/i), 'ana@zcmc.gov.ph')
  await user.type(screen.getByLabelText(/password/i), password)
  await user.click(screen.getByRole('button', { name: /sign in/i }))
}

describe('LoginPage', () => {
  it('validates the form before calling the API', async () => {
    const { user } = renderWithProviders(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
    expect(session.getToken()).toBeNull()
  })

  it('stores the Sanctum token returned by the backend', async () => {
    const { user } = renderWithProviders(<LoginPage />)

    await fillAndSubmit(user, 'correct-password')

    await waitFor(() => expect(session.getToken()).toBe('test-token'))
  })

  it('shows the 422 validation message from Laravel on the email field', async () => {
    const { user } = renderWithProviders(<LoginPage />)

    await fillAndSubmit(user, 'wrong-password')

    expect(
      await screen.findByText('These credentials do not match our records.'),
    ).toBeInTheDocument()
    expect(session.getToken()).toBeNull()
  })
})
