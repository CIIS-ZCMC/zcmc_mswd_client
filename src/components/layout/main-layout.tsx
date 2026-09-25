import React from "react"
import { Routes, Route, useParams, useNavigate } from "react-router"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { ShieldCheck } from "lucide-react"
import { PatientDetailView } from "@/features/patients/components/patient-detail-view"
import { AuditLogPage } from "@/features/audit/components/audit-log-page"
import { CaseloadPage } from "@/features/cases/components/caseload-page"
import { CaseDetailPage } from "@/features/cases/components/case-detail-page"
import { SocialCaseReportsPage } from "@/features/reports/components/social-case-reports-page"
import { usePatientDetail } from "@/features/patients/hooks/use-patient-detail"
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

const PatientDetailRouteWrapper: React.FC<{
  fallbackPatient?: PatientRecord
  onUpdatePatient: (updated: PatientRecord) => void
}> = ({ fallbackPatient, onUpdatePatient }) => {
  const { patientId } = useParams<{ patientId: string }>()
  const { patient, setLocalPatient } = usePatientDetail(patientId || fallbackPatient?.id || "")

  const activePatient = patient ?? fallbackPatient

  if (!activePatient) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-muted-foreground p-6 text-center">
        <ShieldCheck className="size-12 stroke-1 opacity-50 mb-3" />
        <p className="text-base font-bold">No Patient Selected</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Select a patient from the registry sidebar to view their complete clinical & social work profile.
        </p>
      </div>
    )
  }

  return (
    <PatientDetailView
      patient={activePatient}
      onUpdatePatient={(updated) => {
        setLocalPatient(updated)
        onUpdatePatient(updated)
      }}
    />
  )
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
  const navigate = useNavigate()

  return (
    <div className="flex h-screen flex-col bg-background text-foreground transition-colors duration-200 overflow-hidden font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          patients={patients}
          selectedPatientId={selectedPatientId}
          onSelectPatient={(id) => {
            onSelectPatient(id)
            navigate(`/patients/${id}`)
          }}
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
          <Routes>
            <Route
              path="/"
              element={
                <PatientDetailRouteWrapper
                  fallbackPatient={selectedPatient}
                  onUpdatePatient={onUpdatePatient}
                />
              }
            />
            <Route
              path="/patients/:patientId"
              element={<PatientDetailRouteWrapper onUpdatePatient={onUpdatePatient} />}
            />
            <Route path="/caseload" element={<CaseloadPage />} />
            <Route path="/cases/:caseId" element={<CaseDetailPage />} />
            <Route path="/reports" element={<SocialCaseReportsPage />} />
            <Route path="/reports/social-cases" element={<SocialCaseReportsPage />} />
            <Route
              path="/audit"
              element={
                <AuditLogPage
                  onSelectPatient={(id) => {
                    onSelectPatient(id)
                    navigate(`/patients/${id}`)
                  }}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  )
}

