import { useMemo, useState } from "react"
import type { PatientRecord } from "../types"

export function usePatientFilters(patients: PatientRecord[]) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch =
        p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.mswdNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.hospitalNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barangay.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [patients, searchQuery, selectedCategory])

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredPatients,
  }
}
