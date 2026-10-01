import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePermission } from "@/features/auth/hooks/use-permission"
import {
  useCaseUisPrintHistory,
  useEncounterUisPrintHistory,
  usePrintCaseUis,
  usePrintEncounterUis,
} from "../hooks/use-uis-prints"
import { formatTransactionType } from "@/features/hospital/lib/transaction-type"
import {
  AlertCircle,
  Clock,
  FolderPlus,
  History,
  Loader2,
  Printer,
  User,
} from "lucide-react"

export interface EncounterUisPanelProps {
  caseId?: number | null
  caseCode?: string | null
  transactionId?: number | null
  transactionType?: string | null
  onOpenCaseNeeded?: () => void
  className?: string
}

export const EncounterUisPanel: React.FC<EncounterUisPanelProps> = ({
  caseId,
  caseCode,
  transactionId,
  transactionType,
  onOpenCaseNeeded,
  className = "",
}) => {
  const canView = usePermission("intake.view")
  
  const caseHistory = useCaseUisPrintHistory(caseId)
  const encounterHistory = useEncounterUisPrintHistory(caseId ? undefined : transactionId)
  const prints = caseId ? (caseHistory.data ?? []) : (encounterHistory.data ?? [])
  const isLoading = caseId ? caseHistory.isLoading : encounterHistory.isLoading
  const error = caseId ? caseHistory.error : encounterHistory.error

  const printCaseMutation = usePrintCaseUis(caseId, caseCode ?? undefined)
  const printEncounterMutation = usePrintEncounterUis(transactionId)
  const isPrinting = caseId ? printCaseMutation.isPending : printEncounterMutation.isPending

  const handlePrint = async () => {
    if (isPrinting) return
    try {
      if (caseId) {
        await printCaseMutation.mutateAsync(undefined)
      } else if (transactionId) {
        await printEncounterMutation.mutateAsync(undefined)
      }
    } catch (err) {
      console.error("Failed to print UIS", err)
    }
  }

  // If neither case nor transaction exists
  if (!caseId && !transactionId) {
    return null
  }

  return (
    <Card className={`border shadow-2xs bg-card/70 ${className}`}>
      <CardHeader className="p-4 border-b border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-primary">
            <Printer className="size-4.5 text-primary shrink-0" />
            Unified Intake Sheet (ANNEX B) Printable
            <Badge variant="secondary" className="font-mono text-xs px-2 py-0.2 font-semibold">
              {prints.length} Print{prints.length !== 1 ? "s" : ""}
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            {caseId
              ? `Official MSWD intake printable for Case #${caseCode ?? caseId} (HIS Encounter #${transactionId ?? "—"}${transactionType ? ` · ${formatTransactionType(transactionType)}` : ""}).`
              : `Official MSWD intake printable rendered on demand from HIS Encounter #${transactionId ?? "—"}${transactionType ? ` · ${formatTransactionType(transactionType)}` : ""}.`}
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          {!caseId && onOpenCaseNeeded && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenCaseNeeded}
              className="h-9 px-3 text-xs font-bold gap-1.5 border shadow-2xs"
            >
              <FolderPlus className="size-3.5 text-primary" />
              Open Case
            </Button>
          )}

          {canView && (
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={isPrinting}
              onClick={handlePrint}
              className="h-9 px-3.5 text-xs font-bold gap-1.5 shadow-2xs shrink-0"
              title="Download rendered ANNEX B PDF and log print"
            >
              {isPrinting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Printer className="size-4" />
              )}
              {isPrinting ? "Generating PDF…" : "Print UIS"}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-xs text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            Loading print history…
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 p-4 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            Could not load print history for this case.
          </div>
        ) : prints.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-2.5 bg-muted/10">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <History className="size-5 opacity-70" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs sm:text-sm font-semibold text-foreground">
                No Prints Recorded Yet
              </div>
              <p className="text-xs text-muted-foreground max-w-sm">
                Click <strong>Print UIS (ANNEX B)</strong> to generate the official intake assessment PDF.
                Each print event is logged with the user and timestamp.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/30 text-xs">
                  <TableHead className="font-bold">Printed By</TableHead>
                  <TableHead className="font-bold">Date & Time</TableHead>
                  <TableHead className="font-bold">Copies</TableHead>
                  <TableHead className="font-bold">Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prints.map((log) => {
                  const printDate = log.printed_at || log.created_at
                  const formattedDate = printDate
                    ? new Date(printDate).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"

                  return (
                    <TableRow key={log.id} className="text-xs">
                      <TableCell className="font-medium text-foreground">
                        <span className="flex items-center gap-1.5">
                          <User className="size-3.5 text-muted-foreground" />
                          {log.printed_by?.name ?? `Worker #${log.printed_by_id ?? "—"}`}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono">
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-muted-foreground" />
                          {formattedDate}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[11px] font-semibold px-2 py-0.2">
                          {log.copies ?? 1} cop{log.copies === 1 ? "y" : "ies"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {log.remarks ? log.remarks : <span className="text-muted-foreground/60">—</span>}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
