import React from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { ShieldCheck } from "lucide-react"
import { PatientDetailView } from "@/features/patients/components/patient-detail-view"
import type { PatientRecord } from "@/features/patients/types"

interface MainLayoutProps {
  patients: PatientRecord[]
  selectedPatient: PatientRecord | undefined
  selectedPatientId: string
  onSelectPatient: (id: string) => void
  onUpdatePatient: (updated: PatientRecord) => void
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  patients,
  selectedPatient,
  selectedPatientId,
  onSelectPatient,
  onUpdatePatient,
}) => {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground transition-colors duration-200 overflow-hidden font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          patients={patients}
          selectedPatientId={selectedPatientId}
          onSelectPatient={onSelectPatient}
        />
        <main className="flex-1 overflow-hidden">
          {selectedPatient ? (
            <PatientDetailView
              patient={selectedPatient}
              onUpdatePatient={onUpdatePatient}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
              <ShieldCheck className="size-12 stroke-1 opacity-50 mb-3" />
              <p className="text-base font-bold">No Patient Selected</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
