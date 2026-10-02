import React, { useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePermission } from "@/features/auth/hooks/use-permission"
import { IntakeAssessmentDialog } from "@/features/cases/components/dialogs/intake-assessment-dialog"
import { PrintUisDialog } from "@/features/cases/components/dialogs/print-uis-dialog"
import { useDeleteAssessment } from "@/features/cases/hooks/use-assessment"
import { usePatientUis } from "@/features/cases/hooks/use-uis-prints"
import { getClassificationBadgeText, getBracketColor } from "@/features/cases/lib/classification"
import type { PatientUisRow } from "@/features/cases/types/uis.types"
import { ApiError } from "@/lib/api-client"
import { AlertCircle, ClipboardList, ExternalLink, Eye, FolderPlus, Pencil, Printer, Trash2 } from "lucide-react"
import type { PatientRecord } from "../../types"
import { UisSheetView } from "../uis-sheet-view"

interface UisTabProps {
  patient: PatientRecord
  /** Opens the patient's "open a case" flow when there is no case to assess yet. */
  onOpenCaseNeeded?: () => void
}

const MISSING_LABELS: Record<string, string> = {
  assessment: "Intake assessment",
  informant: "Informant",
  family_composition: "Family composition",
  family_income: "Family income",
  problem_presented: "Problem presented",
  recommendation: "Recommendation",
}

function formatDate(value: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : format(date, "MMM d, yyyy")
}

function UisStatusBadge({ row }: { row: PatientUisRow }) {
  if (row.hasAssessment) {
    return row.ready ? (
      <Badge className="bg-emerald-600 text-white font-bold">Ready to print</Badge>
    ) : (
      <Badge variant="secondary" className="font-bold">
        Assessed
      </Badge>
    )
  }
  if (row.hasSocialCase) {
    return (
      <Badge variant="outline" className="font-bold">
        Promoted to SCSR
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="font-bold text-amber-700 border-amber-400">
      Not assessed
    </Badge>
  )
}

/** Confirms and performs the delete; its own component because the mutation hook is per case. */
function DeleteUisDialog({
  row,
  onClose,
}: {
  row: PatientUisRow | null
  onClose: () => void
}) {
  const deleteMutation = useDeleteAssessment(row?.caseId ?? 0)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!row?.assessment) return
    setError(null)
    try {
      await deleteMutation.mutateAsync(row.assessment.id)
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.firstValidationMessage || err.message
          : "Failed to delete the assessment."
      )
    }
  }

  return (
    <AlertDialog
      open={row !== null}
      onOpenChange={(open) => {
        if (!open) {
          setError(null)
          onClose()
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">Delete UIS assessment</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground mt-1">
            This removes the intake assessment of case <strong>{row?.caseCode}</strong>. Its Unified
            Intake Sheet will stop printing (the server refuses a print without an assessment) until the
            case is assessed again. Past print history is kept.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Could not delete</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="font-semibold">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
            disabled={deleteMutation.isPending}
            onClick={(e) => {
              // Keep the dialog open so a server refusal (finalized SCSR) can be shown.
              e.preventDefault()
              void handleDelete()
            }}
          >
            {deleteMutation.isPending ? "Deleting…" : "Delete assessment"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export const UisTab: React.FC<UisTabProps> = ({ patient, onOpenCaseNeeded }) => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const canView = usePermission("intake.view")
  const canCreate = usePermission("cases.create")
  const canUpdate = usePermission("cases.update")

  const { data: rows = [], isLoading, error } = usePatientUis(canView ? patient.id : null)

  const [viewCaseId, setViewCaseId] = useState<number | null>(null)
  const [assessRow, setAssessRow] = useState<PatientUisRow | null>(null)
  const [printRow, setPrintRow] = useState<PatientUisRow | null>(null)
  const [deleteRow, setDeleteRow] = useState<PatientUisRow | null>(null)

  // Deep link: /patients/:id?tab=uis&case=<caseId> opens that case's sheet. Read
  // straight from the URL (no effect), so the sheet shows as soon as the rows load.
  const requestedCase = searchParams.get("case")
  const activeViewId = viewCaseId ?? (requestedCase ? Number(requestedCase) : null)

  const closeSheet = () => {
    setViewCaseId(null)
    if (searchParams.has("case")) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete("case")
          return next
        },
        { replace: true }
      )
    }
  }

  const viewRow = rows.find((r) => r.caseId === activeViewId) ?? null
  const patientAddress =
    patient.address || [patient.barangay, patient.city].filter(Boolean).join(", ")

  if (!canView) {
    return (
      <Alert>
        <AlertCircle className="size-4" />
        <AlertTitle>No access</AlertTitle>
        <AlertDescription>
          You need the intake.view permission to see this patient&apos;s Unified Intake Sheets.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/40">
        <div>
          <CardTitle className="text-base font-bold">Unified Intake Sheets (ANNEX B)</CardTitle>
          <CardDescription className="text-sm mt-1">
            One sheet per hospital encounter (case) for {patient.fullName}. The sheet is built from the
            case&apos;s intake assessment.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Could not load the UIS list</AlertTitle>
            <AlertDescription>
              {error instanceof ApiError ? error.message : "Please try again."}
            </AlertDescription>
          </Alert>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <ClipboardList className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground max-w-sm">
              This patient has no cases yet. Open a case for a hospital encounter, then assess it to
              create its Unified Intake Sheet.
            </p>
            {onOpenCaseNeeded && canCreate && (
              <Button className="gap-2 font-bold cursor-pointer" onClick={onOpenCaseNeeded}>
                <FolderPlus className="size-4" /> Open a Case
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="font-extrabold text-foreground">Case</TableHead>
                  <TableHead className="font-extrabold text-foreground">Encounter</TableHead>
                  <TableHead className="font-extrabold text-foreground">UIS</TableHead>
                  <TableHead className="font-extrabold text-foreground">Classification</TableHead>
                  <TableHead className="font-extrabold text-foreground">Informant</TableHead>
                  <TableHead className="font-extrabold text-foreground">Still missing</TableHead>
                  <TableHead className="font-extrabold text-foreground">Prints</TableHead>
                  <TableHead className="font-extrabold text-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.caseId} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-bold whitespace-nowrap">
                      <div>{row.caseCode}</div>
                      <div className="text-xs font-medium text-muted-foreground capitalize">
                        {row.caseStatus}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div>{row.transactionType || "—"}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(row.dateOpened)}</div>
                    </TableCell>
                    <TableCell>
                      <UisStatusBadge row={row} />
                    </TableCell>
                    <TableCell>
                      {row.assessment ? (
                        <Badge className={`font-bold ${getBracketColor(row.assessment.classification)}`}>
                          {getClassificationBadgeText(row.assessment.classification)}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{row.assessment?.informantName || "—"}</TableCell>
                    <TableCell>
                      {row.hasAssessment && row.missing.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {row.missing.map((m) => (
                            <Badge key={m} variant="outline" className="text-xs">
                              {MISSING_LABELS[m] ?? m}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div>{row.printCount}</div>
                      {row.lastPrintedAt && (
                        <div className="text-xs text-muted-foreground">{formatDate(row.lastPrintedAt)}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {row.hasAssessment ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1.5 font-bold cursor-pointer"
                              onClick={() => setViewCaseId(row.caseId)}
                            >
                              <Eye className="size-4" /> View
                            </Button>
                            {canUpdate && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 font-bold cursor-pointer"
                                onClick={() => setAssessRow(row)}
                              >
                                <Pencil className="size-4 text-primary" /> Edit
                              </Button>
                            )}
                          </>
                        ) : (
                          canCreate && (
                            <Button
                              size="sm"
                              className="gap-1.5 font-bold cursor-pointer"
                              onClick={() => setAssessRow(row)}
                            >
                              <ClipboardList className="size-4" /> Assess
                            </Button>
                          )
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 font-bold cursor-pointer"
                          onClick={() => setPrintRow(row)}
                        >
                          <Printer className="size-4" /> Print
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 font-bold cursor-pointer"
                          onClick={() => navigate(`/cases/${row.caseId}?tab=intake-sheet`)}
                        >
                          <ExternalLink className="size-4" /> Case
                        </Button>
                        {canUpdate && row.hasAssessment && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 font-bold text-destructive hover:bg-destructive/10 cursor-pointer"
                            onClick={() => setDeleteRow(row)}
                          >
                            <Trash2 className="size-4" /> Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Sheet open={viewRow !== null} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-6">
          <SheetHeader className="p-0 mb-4">
            <SheetTitle className="text-lg font-bold">
              Unified Intake Sheet — {viewRow?.caseCode}
            </SheetTitle>
            <SheetDescription>
              {viewRow?.transactionType || "Encounter"} · {formatDate(viewRow?.dateOpened ?? null)}
            </SheetDescription>
          </SheetHeader>
          {viewRow && <UisSheetView row={viewRow} patient={patient} />}
        </SheetContent>
      </Sheet>

      {assessRow && (
        <IntakeAssessmentDialog
          open
          onOpenChange={(open) => !open && setAssessRow(null)}
          caseId={assessRow.caseId}
          caseCode={assessRow.caseCode}
          patientName={patient.fullName}
          patientAddress={patientAddress}
          patientContact={patient.contactNo}
          existingAssessment={assessRow.assessment}
        />
      )}

      {printRow && (
        <PrintUisDialog
          open
          onOpenChange={(open) => !open && setPrintRow(null)}
          caseId={printRow.caseId}
          caseCode={printRow.caseCode}
          patientName={patient.fullName}
          onAssessNeeded={() => {
            const target = printRow
            setPrintRow(null)
            setAssessRow(target)
          }}
        />
      )}

      <DeleteUisDialog row={deleteRow} onClose={() => setDeleteRow(null)} />
    </Card>
  )
}
