import { MainLayout } from "@/components/layout/main-layout"
import { TooltipProvider } from "@/components/ui/tooltip"
import { usePatients } from "@/features/patients/hooks/use-patients"
import { ThemeProvider } from "@/providers/theme-provider"

export function App() {
  const {
    patients,
    selectedPatient,
    selectedPatientId,
    setSelectedPatientId,
    handleUpdatePatient,
  } = usePatients()

  return (
    <ThemeProvider defaultTheme="system" storageKey="zcmc-mswd-theme">
      <TooltipProvider>
        <MainLayout
          patients={patients}
          selectedPatient={selectedPatient}
          selectedPatientId={selectedPatientId}
          onSelectPatient={setSelectedPatientId}
          onUpdatePatient={handleUpdatePatient}
        />
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
