import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import {
  Calendar,
  ClipboardList,
  Download,
  FileText,
  Heart,
  History,
  Printer,
  UserCheck,
} from "lucide-react"
import { downloadIntakeSheetPdf } from "../../api/intake-sheets-api"
import { useIntakeSheet, useIntakeSheetHistory } from "../../hooks/use-intake-sheets"

interface IntakeSheetViewModalProps {
  intakeSheetId: number | null
  isOpen: boolean
  onClose: () => void
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  finalized: "Finalized",
  cancelled: "Cancelled",
}

export const IntakeSheetViewModal: React.FC<IntakeSheetViewModalProps> = ({
  intakeSheetId,
  isOpen,
  onClose,
}) => {
  const { data: sheet, isPending } = useIntakeSheet(intakeSheetId)
  const { data: history = [] } = useIntakeSheetHistory(intakeSheetId)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-6">
        {isPending || !sheet ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="size-6" />
          </div>
        ) : (
          <>
            <DialogHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <ClipboardList className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold font-heading">Unified Intake Sheet</DialogTitle>
                  <DialogDescription className="text-sm">
                    Intake No: <strong className="font-mono text-primary">{sheet.intake_no}</strong>
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 mr-6">
                {sheet.status === "finalized" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 font-bold h-9 px-4"
                    onClick={() => downloadIntakeSheetPdf(sheet.id, `${sheet.intake_no}.pdf`)}
                  >
                    <Download className="size-4" />
                    Download PDF
                  </Button>
                )}
                <Button variant="default" size="sm" className="gap-2 font-bold h-9 px-4" onClick={() => window.print()}>
                  <Printer className="size-4" />
                  Print
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-6 pt-4 text-sm">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                  <Calendar className="size-4 text-primary" /> Intake Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-xl border border-border/60 bg-muted/20 p-4 text-sm">
                  <div>
                    <span className="text-muted-foreground font-medium">Status:</span>
                    <p className="mt-0.5">
                      <Badge variant="outline" className="text-xs font-bold px-2.5 py-0.5">
                        {STATUS_LABEL[sheet.status] ?? sheet.status}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">Date of Intake:</span>
                    <p className="font-bold text-foreground mt-0.5">
                      {sheet.date_of_intake ? sheet.date_of_intake.slice(0, 10) : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">Referral Source:</span>
                    <p className="font-bold text-foreground mt-0.5">{sheet.referral_source || "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">Case:</span>
                    <p className="font-bold text-foreground mt-0.5 font-mono">{sheet.case?.case_code ?? "—"}</p>
                  </div>
                </div>
                {sheet.referral_details && (
                  <p className="text-sm text-muted-foreground mt-2">{sheet.referral_details}</p>
                )}
                {sheet.remarks && (
                  <p className="text-sm text-foreground mt-2 rounded-lg bg-muted/30 p-3">{sheet.remarks}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                  <UserCheck className="size-4 text-primary" /> Patient
                </h3>
                <div className="rounded-xl border border-border/60 p-4 text-sm bg-card">
                  <p className="font-bold text-base text-foreground">
                    {sheet.patient
                      ? [sheet.patient.first_name, sheet.patient.middle_name, sheet.patient.last_name]
                          .filter(Boolean)
                          .join(" ")
                      : "—"}
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    Hospital ID: {sheet.patient?.hospital_id ?? "—"} • MSWD ID: {sheet.patient?.mswd_id ?? "—"}
                  </p>
                </div>
              </div>

              {sheet.assessment && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                    <Heart className="size-4 text-primary" /> Assessment
                  </h3>
                  <div className="rounded-xl border border-border/60 p-4 space-y-2 bg-card text-sm">
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="text-xs font-bold px-2.5 py-0.5">
                        {sheet.assessment.classification.replace(/_/g, " ")}
                      </Badge>
                      {sheet.assessment.total_family_income != null && (
                        <span className="font-mono font-extrabold text-primary">
                          ₱{Number(sheet.assessment.total_family_income).toLocaleString()}/mo
                        </span>
                      )}
                    </div>
                    {sheet.assessment.presenting_problem && (
                      <p>
                        <span className="font-semibold text-muted-foreground">Presenting Problem: </span>
                        {sheet.assessment.presenting_problem}
                      </p>
                    )}
                    {sheet.assessment.family_background && (
                      <p>
                        <span className="font-semibold text-muted-foreground">Family Background: </span>
                        {sheet.assessment.family_background}
                      </p>
                    )}
                    {sheet.assessment.intervention_plan && (
                      <p>
                        <span className="font-semibold text-muted-foreground">Intervention Plan: </span>
                        {sheet.assessment.intervention_plan}
                      </p>
                    )}
                    {sheet.assessment.expenses && sheet.assessment.expenses.length > 0 && (
                      <div className="border-t border-border/40 pt-2 mt-2">
                        <span className="font-semibold text-muted-foreground block mb-1">Household Expenses:</span>
                        <div className="space-y-1">
                          {sheet.assessment.expenses.map((expense) => (
                            <div key={expense.id} className="flex items-center justify-between">
                              <span className="capitalize">{expense.expense_type}</span>
                              <span className="font-mono font-semibold">
                                ₱{Number(expense.amount).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {history.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                    <History className="size-4 text-primary" /> History
                  </h3>
                  <div className="rounded-xl border border-border/60 divide-y divide-border/50">
                    {history.slice(0, 10).map((entry) => (
                      <div key={entry.id} className="p-3 text-sm flex items-start gap-2">
                        <FileText className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-foreground">{entry.description}</p>
                          <p className="text-muted-foreground text-xs mt-0.5">
                            {entry.causer?.name ?? "System"} • {new Date(entry.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
