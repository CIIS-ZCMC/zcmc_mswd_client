import { useMemo } from "react"
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
  const patientsState = usePatients()
  const { patient: selectedPatient, setLocalPatient } = usePatientDetail(patientsState.selectedPatientId)

  const filterDateValue = useMemo(() => {
    return patientsState.intakeDate ? new Date(patientsState.intakeDate) : undefined
  }, [patientsState.intakeDate])

  const handleDateChange = (date?: Date) => {
    if (!date) {
      patientsState.setIntakeDate(undefined)
    } else {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      patientsState.setIntakeDate(`${year}-${month}-${day}`)
    }
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="zcmc-mswd-theme">
      <TooltipProvider>
        {isAuthLoading ? (
          <div className="flex h-screen items-center justify-center bg-background">
            <Spinner className="size-6" />
          </div>
        ) : isAuthenticated ? (
          <MainLayout
            patients={patientsState.patients}
            selectedPatient={selectedPatient}
            selectedPatientId={patientsState.selectedPatientId}
            onSelectPatient={patientsState.setSelectedPatientId}
            onUpdatePatient={setLocalPatient}
            page={patientsState.page}
            totalPages={patientsState.totalPages}
            total={patientsState.total}
            onPageChange={patientsState.setPage}
            searchQuery={patientsState.search}
            onSearchChange={patientsState.setSearch}
            selectedCategory={patientsState.classification}
            onCategoryChange={patientsState.setClassification}
            filterDate={filterDateValue}
            onDateChange={handleDateChange}
            onClearFilters={patientsState.clearFilters}
          />
        ) : (
          <LoginForm />
        )}
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
