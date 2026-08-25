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

      const newAudit: AuditHistory = {
        id: `hist-${Date.now()}`,
        timestamp,
        action,
        performedBy,
        details,
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
