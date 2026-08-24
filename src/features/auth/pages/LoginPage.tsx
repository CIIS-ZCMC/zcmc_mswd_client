import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { Hospital } from 'lucide-react'
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
    <main className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden bg-slate-950">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 size-[500px] rounded-full bg-brand-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 size-[500px] rounded-full bg-cyan-600/15 blur-[120px] pointer-events-none" />
      
      <Card className="relative w-full max-w-md border-white/10 bg-slate-900/85 text-slate-100 shadow-2xl backdrop-blur-xl rounded-2xl">
        <CardBody className="p-8">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold shadow-lg shadow-brand-500/25 ring-1 ring-white/20">
              <Hospital className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white font-heading">ZCMC MSWD</h1>
              <p className="text-xs text-slate-400 font-medium">Medical Social Work Department</p>
            </div>
          </div>
          <p className="mt-4 mb-6 text-sm text-slate-300">
            Sign in to the social welfare records system.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <FormField label="Email" required error={errors.email?.message}>
              <Input type="email" autoComplete="username" {...register('email')} className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus-visible:border-brand-500" />
            </FormField>

            <FormField label="Password" required error={errors.password?.message}>
              <Input type="password" autoComplete="current-password" {...register('password')} className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus-visible:border-brand-500" />
            </FormField>

            {formError && (
              <p role="alert" className="rounded-lg bg-red-950/80 border border-red-800/60 px-3.5 py-2.5 text-sm text-red-300">
                {formError}
              </p>
            )}

            <Button type="submit" disabled={isSubmitting} className="mt-2 h-10 w-full text-sm font-semibold">
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </main>
  )
}

