import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { RouteErrorBoundary } from '@/components/common/ErrorBoundary'
import { ProtectedRoute } from '@/features/auth'

// Route-level code splitting: each feature ships as its own chunk.
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const PatientsPage = lazy(() => import('@/features/patients/pages/PatientsPage'))
const PatientIntakePage = lazy(() => import('@/features/patients/pages/PatientIntakePage'))
const PatientDetailPage = lazy(() => import('@/features/patients/pages/PatientDetailPage'))
const PatientEditPage = lazy(() => import('@/features/patients/pages/PatientEditPage'))
const NotFoundPage = lazy(() => import('@/components/layout/NotFoundPage'))

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: '/login', element: <LoginPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <PatientsPage /> },
              { path: 'patients', element: <PatientsPage /> },
              { path: 'patients/new', element: <PatientIntakePage /> },
              { path: 'patients/:id', element: <PatientDetailPage /> },
              { path: 'patients/:id/edit', element: <PatientEditPage /> },
              // Tab lives in the URL so a patient's Cases or Assistance view is
              // linkable. Ranked below `edit`, which is a static segment.
              { path: 'patients/:id/:tab', element: <PatientDetailPage /> },
              { path: 'cases', element: <PatientsPage /> },
              { path: 'assistance', element: <PatientsPage /> },
              { path: 'reports', element: <PatientsPage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
])
