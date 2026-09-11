import React, { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/features/auth/hooks/use-auth"
import {
  CheckCircle2,
  ClipboardList,
  Download,
  Edit,
  FileCheck2,
  FilterX,
  Plus,
  Search,
  Send,
  UserCheck,
  X,
} from "lucide-react"
import {
  useCancelIntakeSheet,
  useFinalizeIntakeSheet,
  useIntakeSheetsForPatient,
  useSubmitIntakeSheet,
} from "../../hooks/use-intake-sheets"
import { downloadIntakeSheetPdf } from "../../api/intake-sheets-api"
import type { ApiUnifiedIntakeSheet } from "../../types/api.types"
import type { IntakeSheetStatus } from "../../types/intake.types"
import type { PatientRecord } from "../../types"
import { IntakeSheetViewModal } from "../dialogs/intake-sheet-view-modal"
import { IntakeSheetWizardModal } from "../dialogs/intake-sheet-wizard-modal"

interface IntakeSheetTabProps {
  patient: PatientRecord
}

const STATUS_FILTERS: Array<"ALL" | IntakeSheetStatus> = ["ALL", "draft", "submitted", "finalized", "cancelled"]

const STATUS_LABEL: Record<IntakeSheetStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  finalized: "Finalized",
  cancelled: "Cancelled",
}

function statusBadgeVariant(status: IntakeSheetStatus): "outline" | "secondary" | "default" | "destructive" {
  switch (status) {
    case "finalized":
      return "default"
    case "submitted":
      return "secondary"
    case "cancelled":
      return "destructive"
    default:
      return "outline"
  }
}

export const IntakeSheetTab: React.FC<IntakeSheetTabProps> = ({ patient }) => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | IntakeSheetStatus>("ALL")
  const [viewingId, setViewingId] = useState<number | null>(null)
  const [editingSheet, setEditingSheet] = useState<ApiUnifiedIntakeSheet | null>(null)
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  const { data: sheets = [], isLoading } = useIntakeSheetsForPatient(patient.id)
  const submitMutation = useSubmitIntakeSheet(patient.id)
  const finalizeMutation = useFinalizeIntakeSheet(patient.id)
  const cancelMutation = useCancelIntakeSheet(patient.id)

  const filteredSheets = useMemo(() => {
    return sheets.filter((sheet) => {
      const matchesSearch =
        searchQuery === "" ||
        sheet.intake_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sheet.referral_source ?? "").toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "ALL" || sheet.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [sheets, searchQuery, statusFilter])

  const workerLabel = (sheet: ApiUnifiedIntakeSheet): string => {
    if (sheet.intake_worker_id === user?.id) {
      return user?.employee_name ?? `Worker #${sheet.intake_worker_id}`
    }
    // The intake-sheets list resource only exposes intake_worker_id, not a
    // nested worker resource — no name is available for a sheet created by
    // someone other than the currently logged-in user.
    return sheet.intake_worker_id != null ? `Worker #${sheet.intake_worker_id}` : "—"
  }

  return (
    <div className="space-y-6">
      {/* Management Summary Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold font-heading text-xl shadow-xs">
            <ClipboardList className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
                Social Intake Assessment Sheets
              </h2>
              <Badge variant="secondary" className="font-mono text-xs px-2.5 py-0.5 font-bold">
                {sheets.length} Record{sheets.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Unified intake records for {patient.fullName}.
            </p>
          </div>
        </div>

        <Button
          variant="default"
          size="default"
          className="h-10 px-4 text-sm font-bold gap-2"
          onClick={() => {
            setEditingSheet(null)
            setIsWizardOpen(true)
          }}
        >
          <Plus className="size-4.5" /> Create New Intake Sheet
        </Button>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <UserCheck className="size-5 text-primary" /> Intake Records Registry
            </CardTitle>
            <CardDescription className="text-xs">
              Draft, submitted, finalized and cancelled intakes, newest first.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search intake #, referral source..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border">
              {STATUS_FILTERS.map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st === "ALL" ? "All" : STATUS_LABEL[st]}
                </button>
              ))}
            </div>

            {(searchQuery || statusFilter !== "ALL") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-2 text-xs"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("ALL")
                }}
              >
                <FilterX className="size-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table className="text-sm">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold">Intake No.</TableHead>
                <TableHead className="font-bold">Date of Intake</TableHead>
                <TableHead className="font-bold">Referral Source</TableHead>
                <TableHead className="font-bold">Intake Worker</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Loading intake records…
                  </TableCell>
                </TableRow>
              ) : filteredSheets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <ClipboardList className="size-8 stroke-1 opacity-50" />
                      <p className="font-semibold text-sm">No intake sheet records found</p>
                      <p className="text-xs">Click &quot;Create New Intake Sheet&quot; to add a new record.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSheets.map((sheet) => (
                  <TableRow key={sheet.id} className="hover:bg-muted/20">
                    <TableCell className="font-mono font-bold text-primary">{sheet.intake_no}</TableCell>
                    <TableCell className="font-medium text-foreground">
                      {sheet.date_of_intake ? sheet.date_of_intake.slice(0, 10) : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {sheet.referral_source || "—"}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{workerLabel(sheet)}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(sheet.status)} className="text-xs px-2.5 py-0.5 gap-1">
                        <CheckCircle2 className="size-3" /> {STATUS_LABEL[sheet.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs gap-1 font-semibold"
                          onClick={() => setViewingId(sheet.id)}
                        >
                          View
                        </Button>

                        {(sheet.status === "draft" || sheet.status === "submitted") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-xs gap-1 font-semibold"
                            onClick={() => {
                              setEditingSheet(sheet)
                              setIsWizardOpen(true)
                            }}
                          >
                            <Edit className="size-3.5" /> Edit
                          </Button>
                        )}

                        {sheet.status === "draft" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-xs gap-1 font-semibold text-primary"
                            disabled={submitMutation.isPending}
                            onClick={() => submitMutation.mutate(sheet.id)}
                          >
                            <Send className="size-3.5" /> Submit
                          </Button>
                        )}

                        {sheet.status === "submitted" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-xs gap-1 font-semibold text-emerald-600"
                            disabled={finalizeMutation.isPending}
                            onClick={() => {
                              if (window.confirm(`Finalize intake ${sheet.intake_no}? This cannot be undone.`)) {
                                finalizeMutation.mutate(sheet.id)
                              }
                            }}
                          >
                            <FileCheck2 className="size-3.5" /> Finalize
                          </Button>
                        )}

                        {sheet.status === "finalized" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-xs gap-1 font-semibold"
                            onClick={() => downloadIntakeSheetPdf(sheet.id, `${sheet.intake_no}.pdf`)}
                          >
                            <Download className="size-3.5" /> PDF
                          </Button>
                        )}

                        {(sheet.status === "draft" || sheet.status === "submitted") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-xs gap-1 font-semibold text-destructive"
                            disabled={cancelMutation.isPending}
                            onClick={() => {
                              if (window.confirm(`Cancel intake ${sheet.intake_no}?`)) {
                                cancelMutation.mutate(sheet.id)
                              }
                            }}
                          >
                            <X className="size-3.5" /> Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <IntakeSheetViewModal
        intakeSheetId={viewingId}
        isOpen={viewingId !== null}
        onClose={() => setViewingId(null)}
      />

      <IntakeSheetWizardModal
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false)
          setEditingSheet(null)
        }}
        patient={patient}
        initialSheet={editingSheet}
      />
    </div>
  )
}
