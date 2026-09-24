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
import type { HospitalEncounter } from "@/features/hospital/types"
import { AlertCircle, Building2, ClipboardCheck, Loader2 } from "lucide-react"
import type { PatientRecord } from "../../types"

interface HospitalEncountersTabProps {
  patient: PatientRecord
}

const EncounterBody: React.FC<{
  encounter: HospitalEncounter
  expanded: boolean
  hospitalNumber: string | number | undefined
  canAssess: boolean
}> = ({ encounter, expanded, hospitalNumber, canAssess }) => {
  const [assessOpen, setAssessOpen] = useState(false)
  const { data: detail, isLoading, error } = useHospitalEncounter(encounter.id, expanded)

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading encounter detail…
        </div>
      )}

      {error && (
        <div className="text-sm text-destructive">Could not load this encounter's detail.</div>
      )}

      {detail && <HospitalEncounterDetail encounter={detail} />}

      {canAssess && (
        <div className="flex justify-end pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAssessOpen(true)}
            className="font-bold gap-2"
          >
            <ClipboardCheck className="w-4 h-4" />
            Assess (attach to case)
          </Button>
          <AssessEncounterDialog
            encounterId={encounter.id}
            hospitalNumber={hospitalNumber}
            open={assessOpen}
            onOpenChange={setAssessOpen}
          />
        </div>
      )}
    </div>
  )
}

export const HospitalEncountersTab: React.FC<HospitalEncountersTabProps> = ({ patient }) => {
  const hospitalNumber = patient.hospitalId
  const canAssess = usePermission("cases.update")
  const [open, setOpen] = useState<string[]>([])

  const { data: encounters = [], isLoading, error } = useHospitalEncounters(hospitalNumber)

  if (!hospitalNumber) {
    return (
      <Alert>
        <Building2 className="w-4 h-4" />
        <AlertTitle>Not linked to a hospital record</AlertTitle>
        <AlertDescription>
          This patient has no hospital number on file, so no HIS encounters can be shown. Link the patient to a hospital record to see their encounters here.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="w-5 h-5" />
          Hospital Encounters (HIS)
        </CardTitle>
        <CardDescription>
          Read-only encounters from the hospital system for hospital number {String(hospitalNumber)}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Hospital system unavailable</AlertTitle>
            <AlertDescription>The hospital encounters could not be loaded right now.</AlertDescription>
          </Alert>
        ) : encounters.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            No hospital encounters found for this patient.
          </div>
        ) : (
          <Accordion type="multiple" value={open} onValueChange={setOpen} className="space-y-2">
            {encounters.map((enc) => (
              <AccordionItem key={enc.id} value={String(enc.id)} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex flex-1 items-center justify-between gap-3 pr-3">
                    <div className="flex items-center gap-3">
                      <RegistryStatusBadge status={enc.registrationStatus} />
                      <span className="text-sm font-semibold">Encounter #{enc.id}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {enc.patientTransactionType && <span>{enc.patientTransactionType}</span>}
                      <span>{enc.registrationDate ?? "—"}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <EncounterBody
                    encounter={enc}
                    expanded={open.includes(String(enc.id))}
                    hospitalNumber={hospitalNumber}
                    canAssess={canAssess}
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
