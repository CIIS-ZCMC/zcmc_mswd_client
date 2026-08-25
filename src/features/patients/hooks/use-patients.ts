import { useState } from "react"
import { MOCK_PATIENTS } from "../data/mock-patients"
import type { PatientRecord } from "../types"

export function usePatients(initialPatients: PatientRecord[] = MOCK_PATIENTS) {
  const [patients, setPatients] = useState<PatientRecord[]>(initialPatients)
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatients[0]?.id || ""
  )

  const selectedPatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0]

  const handleUpdatePatient = (updatedPatient: PatientRecord) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    )
  }

  return {
    patients,
    selectedPatient,
    selectedPatientId,
    setSelectedPatientId,
    handleUpdatePatient,
  }
}
