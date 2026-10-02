import React, { useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { usePermission } from "@/features/auth/hooks/use-permission"
import {
  useHospitalEncounter,
  useHospitalEncounters,
} from "@/features/hospital/hooks/use-hospital-encounters"
import { HospitalEncounterDetail } from "@/features/hospital/components/hospital-encounter-detail"
import { RegistryStatusBadge } from "@/features/hospital/components/registry-status-badge"
import { AssessEncounterDialog } from "@/features/hospital/components/dialogs/assess-encounter-dialog"
import { OpenCaseDialog } from "@/features/cases/components/dialogs/open-case-dialog"
import { EncounterUisPanel } from "@/features/cases/components/encounter-uis-panel"
import { useAssignableCases } from "@/features/hospital/hooks/use-hospital-encounters"
import { formatTransactionType } from "@/features/hospital/lib/transaction-type"
import type { HospitalEncounter } from "@/features/hospital/types"
import { AlertCircle, Building2, Calendar, ClipboardCheck, ExternalLink, FolderPlus, Loader2 } from "lucide-react"
import { useNavigate } from "react-router"
import type { PatientRecord } from "../../types"

interface HospitalEncountersTabProps {
  patient: PatientRecord
}

const EncounterHeader: React.FC<{
  encounter: HospitalEncounter
}> = ({ encounter }) => {
  return (
    <div className="flex flex-1 flex-wrap items-center justify-between gap-3 pr-3">
      <div className="flex items-center gap-2.5 flex-wrap">
        <RegistryStatusBadge status={encounter.registrationStatus} />
        <span className="text-sm sm:text-base font-bold text-foreground">
          Encounter #{encounter.id}
        </span>
        <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">
          {formatTransactionType(encounter.patientTransactionType)}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          {encounter.registrationDate ?? "—"}
        </span>
      </div>
    </div>
  )
}

const EncounterBody: React.FC<{
  encounter: HospitalEncounter
  expanded: boolean
  patient: PatientRecord
  canAssess: boolean
  canCreateCase: boolean
}> = ({ encounter, expanded, patient, canAssess, canCreateCase }) => {
  const navigate = useNavigate()
  const [assessOpen, setAssessOpen] = useState(false)
  const [openCaseOpen, setOpenCaseOpen] = useState(false)
  const [createdCase, setCreatedCase] = useState<{ id: number; caseCode: string } | null>(null)

  const { data: detail, isLoading, error } = useHospitalEncounter(encounter.id, expanded)
  const { data: assignableCases = [] } = useAssignableCases(encounter.id, expanded)

  const activeCase =
    createdCase ??
    (assignableCases.length > 0
      ? { id: assignableCases[0].id, caseCode: assignableCases[0].caseCode }
      : null)

  return (
    <div className="space-y-4 pt-2">
      {isLoading && (
        <div className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground p-3 bg-muted/30 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading full encounter details…
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="border p-4">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle className="text-sm font-bold">Error Loading Detail</AlertTitle>
          <AlertDescription className="text-xs font-medium">Could not load this encounter's detailed information.</AlertDescription>
        </Alert>
      )}

      {detail && <HospitalEncounterDetail encounter={detail} />}

      {/* Per-Encounter Unified Intake Sheet (ANNEX B) Printable Panel */}
      <EncounterUisPanel
        caseId={activeCase?.id}
        caseCode={activeCase?.caseCode}
        patientName={patient.fullName}
        patientAddress={patient.address}
        patientContact={patient.contactNo}
        patientMonthlyIncome={patient.monthlyIncome}
        transactionId={encounter.id}
        transactionType={encounter.patientTransactionType}
        onOpenCaseNeeded={() => setOpenCaseOpen(true)}
      />

      <div className="flex items-center justify-end gap-2.5 pt-2 border-t flex-wrap">
        {activeCase && (
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/patients/${patient.id}?tab=uis&case=${activeCase.id}`)}
            className="font-bold text-sm h-10 px-4 gap-1.5 border shadow-2xs"
          >
            <ExternalLink className="w-4 h-4 text-primary" />
            Open UIS Sheet
          </Button>
        )}

        {patient.latestCaseId && (
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/cases/${patient.latestCaseId}`)}
            className="font-bold text-sm h-10 px-4 gap-1.5 border shadow-2xs"
          >
            <ExternalLink className="w-4 h-4 text-primary" />
            View Active Case
          </Button>
        )}

        {canCreateCase && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpenCaseOpen(true)}
            className="font-bold text-sm h-10 px-4 gap-2 border shadow-2xs"
          >
            <FolderPlus className="w-4 h-4 text-primary" />
            Open Case for Encounter
          </Button>
        )}

        {canAssess && (
          <Button
            type="button"
            variant="default"
            onClick={() => setAssessOpen(true)}
            className="font-bold text-sm h-10 px-4 gap-2 shadow-xs"
          >
            <ClipboardCheck className="w-4 h-4" />
            Assess (Attach to Existing Case)
          </Button>
        )}

        <AssessEncounterDialog
          encounterId={encounter.id}
          hospitalNumber={patient.hospitalId}
          open={assessOpen}
          onOpenChange={setAssessOpen}
        />

        <OpenCaseDialog
          open={openCaseOpen}
          onOpenChange={setOpenCaseOpen}
          patientId={patient.id}
          patientName={patient.fullName}
          hospitalNumber={patient.hospitalNo}
          transactionId={encounter.id}
          transactionType={encounter.patientTransactionType ?? undefined}
          onCaseOpened={(newCase) => {
            setOpenCaseOpen(false)
            if (newCase?.id) {
              setCreatedCase({ id: newCase.id, caseCode: newCase.caseCode || `CASE-${newCase.id}` })
            }
          }}
        />
      </div>
    </div>
  )
}


export const HospitalEncountersTab: React.FC<HospitalEncountersTabProps> = ({ patient }) => {
  const hospitalNumber = patient.hospitalId
  const canAssess = usePermission("cases.update")
  const canCreateCase = usePermission("cases.create")
  const [open, setOpen] = useState<string[]>([])

  const { data: encounters = [], isLoading, error } = useHospitalEncounters(hospitalNumber)

  if (!hospitalNumber) {
    return (
      <Alert className="border p-4">
        <Building2 className="w-5 h-5 text-primary shrink-0" />
        <AlertTitle className="text-base font-bold">Not linked to a hospital record</AlertTitle>
        <AlertDescription className="text-xs sm:text-sm font-medium leading-relaxed mt-1">
          This patient has no hospital number on file, so no HIS encounters can be shown. Link the patient to a hospital record to view their hospital history here.
        </AlertDescription>
      </Alert>
    )
  }

  // Calculate high-level metrics for quick scanning
  const activeCount = encounters.filter((e) => e.registrationStatus?.code === "A").length
  const dischargedCount = encounters.filter((e) => e.registrationStatus?.code === "D" || e.registrationStatus?.code === "M").length

  return (
    <Card className="border shadow-2xs">
      <CardHeader className="p-5 space-y-1.5">
        <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl font-extrabold text-primary">
          <Building2 className="w-5 h-5 text-primary shrink-0" />
          Hospital Encounters (HIS)
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm font-medium">
          Hospital encounters on file for Hospital No. <span className="font-bold text-foreground">{String(hospitalNumber)}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0 space-y-5">
        {/* Quick Metrics Bar */}
        {!isLoading && !error && encounters.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-muted/30 border">
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Encounters</span>
              <span className="text-xl sm:text-2xl font-black text-foreground">{encounters.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Inpatients</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeCount}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Discharged / MGH</span>
              <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">{dischargedCount}</span>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="border p-4">
            <AlertCircle className="w-5 h-5" />
            <AlertTitle className="text-base font-bold">Hospital system unavailable</AlertTitle>
            <AlertDescription className="text-xs sm:text-sm font-medium mt-1">
              The hospital encounters could not be loaded at this time. Please try again later.
            </AlertDescription>
          </Alert>
        ) : encounters.length === 0 ? (
          <div className="text-sm font-medium text-muted-foreground py-8 text-center border border-dashed rounded-lg">
            No hospital encounters found for this patient.
          </div>
        ) : (
          <Accordion multiple value={open} onValueChange={setOpen} className="space-y-2.5">
            {encounters.map((enc) => (
              <AccordionItem key={enc.id} value={String(enc.id)} className="border rounded-lg px-4 shadow-2xs transition-colors">
                <AccordionTrigger className="hover:no-underline py-3.5">
                  <EncounterHeader encounter={enc} />
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <EncounterBody
                    encounter={enc}
                    expanded={open.includes(String(enc.id))}
                    patient={patient}
                    canAssess={canAssess}
                    canCreateCase={canCreateCase}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}

