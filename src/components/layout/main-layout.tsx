import React, { useState } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { ShieldCheck } from "lucide-react"
import { PatientDetailView } from "@/features/patients/components/patient-detail-view"
import { AuditLogPage } from "@/features/audit/components/audit-log-page"
import type { PatientRecord } from "@/features/patients/types"

interface MainLayoutProps {
  patients: PatientRecord[]
  selectedPatient: PatientRecord | undefined
  selectedPatientId: string
  onSelectPatient: (id: string) => void
  onUpdatePatient: (updated: PatientRecord) => void
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
  searchQuery: string
  onSearchChange: (search: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  filterDate?: Date
  onDateChange: (date?: Date) => void
  onClearFilters: () => void
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  patients,
  selectedPatient,
  selectedPatientId,
  onSelectPatient,
  onUpdatePatient,
  page,
  totalPages,
  total,
  onPageChange,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  filterDate,
  onDateChange,
  onClearFilters,
}) => {
  const [currentView, setCurrentView] = useState<"patients" | "audit-log">("patients")

  return (
    <div className="flex h-screen flex-col bg-background text-foreground transition-colors duration-200 overflow-hidden font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          patients={patients}
          selectedPatientId={selectedPatientId}
          onSelectPatient={(id) => {
            onSelectPatient(id)
            setCurrentView("patients")
          }}
          currentView={currentView}
          onViewChange={setCurrentView}
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={onPageChange}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          filterDate={filterDate}
          onDateChange={onDateChange}
          onClearFilters={onClearFilters}
        />
        <main className="flex-1 overflow-hidden">
          {currentView === "audit-log" ? (
            <AuditLogPage
              onSelectPatient={(id) => {
                onSelectPatient(id)
                setCurrentView("patients")
              }}
            />
          ) : selectedPatient ? (
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
