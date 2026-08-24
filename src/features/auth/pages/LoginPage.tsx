import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { FormField } from '@/components/common/FormField'
import { ApiError } from '@/types'
import { useAuth } from '../auth-context'
import { loginSchema, type LoginInput } from '../schemas'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  if (isAuthenticated) return <Navigate to={from} replace />

  async function onSubmit(values: LoginInput) {
    setFormError(null)
    try {
      await login(values)
      navigate(from, { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        // Map server-side validation back onto the matching fields.
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof LoginInput, { message })
        }
        setFormError(Object.keys(error.fieldErrors).length ? null : error.message)
      } else {
        setFormError('Unable to sign in. Please try again.')
      }
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardBody className="p-6">
          <h1 className="text-lg font-semibold text-ink">ZCMC MSWD</h1>
          <p className="mt-1 mb-6 text-sm text-ink-muted">
            Sign in to the social welfare records system.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <FormField label="Email" required error={errors.email?.message}>
              <Input type="email" autoComplete="username" {...register('email')} />
            </FormField>

            <FormField label="Password" required error={errors.password?.message}>
              <Input type="password" autoComplete="current-password" {...register('password')} />
            </FormField>

            {formError && (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </p>
            )}

            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </main>
  )
}
