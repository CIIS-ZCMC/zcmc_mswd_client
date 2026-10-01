import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  downloadCaseUisPdf,
  downloadEncounterUisPdf,
  listCaseUisPrints,
  listEncounterUisPrints,
} from "../api/uis-print-api"
import type { ApiUisPrintLog } from "../types/api.types"

export const uisPrintKeys = {
  all: ["uis-prints"] as const,
  case: (caseId: number | string) => ["uis-prints", "case", String(caseId)] as const,
  encounter: (encounterId: number | string) => ["uis-prints", "encounter", String(encounterId)] as const,
}

/**
 * Hook to fetch the history of UIS prints for a given case.
 */
export function useCaseUisPrintHistory(caseId?: number | string | null) {
  const isEnabled = caseId != null && caseId !== "" && caseId !== 0 && !Number.isNaN(Number(caseId))

  return useQuery<ApiUisPrintLog[]>({
    queryKey: uisPrintKeys.case(caseId ?? ""),
    queryFn: () => listCaseUisPrints(caseId!),
    enabled: isEnabled,
  })
}

/**
 * Hook to fetch the history of UIS prints for a given encounter (HIS transaction).
 */
export function useEncounterUisPrintHistory(encounterId?: number | string | null) {
  const isEnabled =
    encounterId != null && encounterId !== "" && encounterId !== 0 && !Number.isNaN(Number(encounterId))

  return useQuery<ApiUisPrintLog[]>({
    queryKey: uisPrintKeys.encounter(encounterId ?? ""),
    queryFn: () => listEncounterUisPrints(encounterId!),
    enabled: isEnabled,
  })
}

/**
 * Mutation hook to download the case UIS PDF (ANNEX B) and refresh print history.
 */
export function usePrintCaseUis(caseId?: number | string | null, caseCode?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (customFilename?: string) => {
      if (!caseId) throw new Error("No case ID provided for UIS printing")
      const filename =
        customFilename || (caseCode ? `UIS-${caseCode}.pdf` : `UIS-CASE-${caseId}.pdf`)
      return downloadCaseUisPdf(caseId, filename)
    },
    onSuccess: () => {
      if (caseId) {
        queryClient.invalidateQueries({ queryKey: uisPrintKeys.case(caseId) })
      }
    },
  })
}

/**
 * Mutation hook to download the encounter UIS PDF (ANNEX B) directly from HIS encounter.
 */
export function usePrintEncounterUis(encounterId?: number | string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (customFilename?: string) => {
      if (!encounterId) throw new Error("No encounter ID provided for UIS printing")
      const filename = customFilename || `UIS-ENCOUNTER-${encounterId}.pdf`
      return downloadEncounterUisPdf(encounterId, filename)
    },
    onSuccess: () => {
      if (encounterId) {
        queryClient.invalidateQueries({ queryKey: uisPrintKeys.encounter(encounterId) })
      }
    },
  })
}

