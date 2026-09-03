import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { listPatients } from "../api/patients-api"
import { toPatientListRecord } from "../api/patients-adapter"
import type { PatientRecord } from "../types"

export const PATIENTS_LIST_QUERY_KEY = ["patients", "list"] as const

/**
 * The sidebar/master list. Demographics only — case-derived fields
 * (classification, ward, admission status, ...) are blank here by design;
 * see patients-adapter.ts for why, and usePatientDetail for the enriched
 * version used once a patient is selected.
 */
export function usePatients() {
  const query = useQuery({
    queryKey: PATIENTS_LIST_QUERY_KEY,
    queryFn: () => listPatients({ perPage: 100 }),
  })

  const patients: PatientRecord[] = (query.data?.data ?? []).map(toPatientListRecord)

  const [selectedPatientId, setSelectedPatientId] = useState<string>("")

  // Derived, not effect-driven: falls back to the first loaded patient
  // whenever nothing has been explicitly selected yet, without an extra
  // render pass.
  const effectiveSelectedId = selectedPatientId || patients[0]?.id || ""

  return {
    patients,
    selectedPatientId: effectiveSelectedId,
    setSelectedPatientId,
    isLoading: query.isLoading,
    error: query.error,
  }
}
