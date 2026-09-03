import { MainLayout } from "@/components/layout/main-layout"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Spinner } from "@/components/ui/spinner"
import { LoginForm } from "@/features/auth/components/login-form"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { usePatientDetail } from "@/features/patients/hooks/use-patient-detail"
import { usePatients } from "@/features/patients/hooks/use-patients"
import { ThemeProvider } from "@/providers/theme-provider"

export function App() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { patients, selectedPatientId, setSelectedPatientId } = usePatients()
  const { patient: selectedPatient, setLocalPatient } = usePatientDetail(selectedPatientId)

  return (
    <ThemeProvider defaultTheme="system" storageKey="zcmc-mswd-theme">
      <TooltipProvider>
        {isAuthLoading ? (
          <div className="flex h-screen items-center justify-center bg-background">
            <Spinner className="size-6" />
          </div>
        ) : isAuthenticated ? (
          <MainLayout
            patients={patients}
            selectedPatient={selectedPatient}
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
            onUpdatePatient={setLocalPatient}
          />
        ) : (
          <LoginForm />
        )}
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
