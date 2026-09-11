import { useCallback } from "react"
import type { AuditHistory, PatientRecord } from "../types"

export function usePatientMutations(
  patient: PatientRecord,
  onUpdatePatient: (updated: PatientRecord) => void
) {
  const mutateWithAudit = useCallback(
    (
      action: string,
      details: string,
      updater: (prev: PatientRecord) => PatientRecord,
      performedBy: string = "Maria Santos, RSW"
    ) => {
      const now = new Date()
      const timestamp = now.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })

      // A local, not-yet-persisted entry for the Intake Sheet overlay — the
      // server's own trail carries the real one once that flow is wired to
      // an endpoint. No field-level diff is computed here: `updater` is an
      // opaque whole-record transform, so `changes` stays empty rather than
      // guessing at what moved.
      const newAudit: AuditHistory = {
        id: `hist-${Date.now()}`,
        timestamp,
        event: "updated",
        action,
        performedBy,
        subjectType: "Patient",
        subjectId: patient.id,
        subjectLabel: action,
        patientId: patient.id,
        details,
        changes: [],
      }

      const updated = updater(patient)
      const finalPatient: PatientRecord = {
        ...updated,
        history: [newAudit, ...(updated.history || [])],
      }

      onUpdatePatient(finalPatient)
    },
    [patient, onUpdatePatient]
  )

  return { mutateWithAudit }
}
