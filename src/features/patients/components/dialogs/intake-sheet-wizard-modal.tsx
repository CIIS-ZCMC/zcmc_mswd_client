import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { Check, ChevronLeft, ChevronRight, ClipboardList, Plus, Trash2 } from "lucide-react"
import {
  useAssistantTypes,
  useCreateIntakeSheet,
  useIntakeSheet,
  useLatestCaseForPatient,
  useUpdateIntakeSheet,
} from "../../hooks/use-intake-sheets"
import {
  ADMISSION_TYPE_OPTIONS,
  ASSESSMENT_CLASSIFICATION_OPTIONS,
  ATTACHABLE_CASE_STATUSES,
  CASE_TYPE_OPTIONS,
  PRIORITY_LEVEL_OPTIONS,
} from "../../types/intake.types"
import type { ApiCase, ApiUnifiedIntakeSheet } from "../../types/api.types"
import type { PatientRecord } from "../../types"

interface IntakeSheetWizardModalProps {
  isOpen: boolean
  onClose: () => void
  patient: PatientRecord
  /** Pass the row's list-resource object to edit it; null/undefined to create a new sheet. */
  initialSheet?: ApiUnifiedIntakeSheet | null
}

export const IntakeSheetWizardModal: React.FC<IntakeSheetWizardModalProps> = ({
  isOpen,
  onClose,
  patient,
  initialSheet,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-5xl text-sm max-h-[90vh] overflow-y-auto p-6">
        {isOpen && (
          <IntakeSheetWizardGate
            key={initialSheet?.id ?? "create"}
            patient={patient}
            initialSheet={initialSheet ?? null}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

/**
 * Loads everything the form needs to initialize itself once, then hands off
 * to a form that mounts exactly once fully-loaded — no effects required to
 * keep local state in sync with async data (see use-patient-detail.ts for
 * the project's stance on that pattern).
 */
const IntakeSheetWizardGate: React.FC<{
  patient: PatientRecord
  initialSheet: ApiUnifiedIntakeSheet | null
  onClose: () => void
}> = ({ patient, initialSheet, onClose }) => {
  const isEditMode = initialSheet !== null
  const detailQuery = useIntakeSheet(isEditMode ? initialSheet.id : null)
  const latestCaseQuery = useLatestCaseForPatient(patient.id)
  const assistantTypesQuery = useAssistantTypes()

  const stillLoading =
    (isEditMode && detailQuery.isPending) ||
    (!isEditMode && (latestCaseQuery.isPending || assistantTypesQuery.isPending))

  if (stillLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner className="size-6" />
      </div>
    )
  }

  return (
    <IntakeSheetWizardForm
      patient={patient}
      initialSheet={initialSheet}
      detail={detailQuery.data ?? null}
      latestCase={latestCaseQuery.data ?? null}
      assistantTypes={assistantTypesQuery.data ?? []}
      onClose={onClose}
    />
  )
}

const IntakeSheetWizardForm: React.FC<{
  patient: PatientRecord
  initialSheet: ApiUnifiedIntakeSheet | null
  detail: ApiUnifiedIntakeSheet | null
  latestCase: ApiCase | null
  assistantTypes: Array<{ id: number; name: string; category: string | null }>
  onClose: () => void
}> = ({ patient, initialSheet, detail, latestCase, assistantTypes, onClose }) => {
  const { user } = useAuth()
  const isEditMode = initialSheet !== null
  const attachableCase =
    !isEditMode && latestCase && (ATTACHABLE_CASE_STATUSES as readonly string[]).includes(latestCase.status)
      ? latestCase
      : null
  const needsNewCase = !isEditMode && !attachableCase

  const [currentStep, setCurrentStep] = useState(1)

  // Header
  const [referralSource, setReferralSource] = useState(detail?.referral_source ?? "")
  const [referralDetails, setReferralDetails] = useState(detail?.referral_details ?? "")
  const [dateOfIntake, setDateOfIntake] = useState(
    detail?.date_of_intake?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)
  )
  const [remarks, setRemarks] = useState(detail?.remarks ?? "")

  // New case (create-only)
  const [caseType, setCaseType] = useState<string>(CASE_TYPE_OPTIONS[0])
  const [priorityLevel, setPriorityLevel] = useState<string>(PRIORITY_LEVEL_OPTIONS[0])
  const [admissionType, setAdmissionType] = useState<string>(ADMISSION_TYPE_OPTIONS[0])

  // Assessment (create + edit)
  const [classification, setClassification] = useState(detail?.assessment?.classification ?? "")
  const [totalFamilyIncome, setTotalFamilyIncome] = useState<string>(
    detail?.assessment?.total_family_income != null ? String(detail.assessment.total_family_income) : ""
  )
  const [presentingProblem, setPresentingProblem] = useState(detail?.assessment?.presenting_problem ?? "")
  const [familyBackground, setFamilyBackground] = useState(detail?.assessment?.family_background ?? "")
  const [interventionPlan, setInterventionPlan] = useState(detail?.assessment?.intervention_plan ?? "")

  // Assistance (create-only — locked after creation)
  const [assistantTypeId, setAssistantTypeId] = useState<string>("")
  const [assistanceAmount, setAssistanceAmount] = useState<string>("")
  const [assistanceNotes, setAssistanceNotes] = useState("")

  // Household expenses (create-only) — only actually saved once classification is set
  const [expenseRows, setExpenseRows] = useState<Array<{ type: string; amount: string }>>([])

  // Diagnosis (create-only — a separate Diagnostic record, posted after the sheet exists)
  const [diagnosisName, setDiagnosisName] = useState("")
  const [diagnosisDescription, setDiagnosisDescription] = useState("")
  const [diagnosisDate, setDiagnosisDate] = useState("")
  const [attendingPhysician, setAttendingPhysician] = useState("")
  const [facilityName, setFacilityName] = useState("")

  const createMutation = useCreateIntakeSheet(patient.id)
  const updateMutation = useUpdateIntakeSheet(patient.id)
  const isSaving = createMutation.isPending || updateMutation.isPending
  const mutationError = createMutation.error ?? updateMutation.error

  const assessmentPayload = () =>
    classification
      ? {
          classification,
          total_family_income: totalFamilyIncome ? Number(totalFamilyIncome) : undefined,
          presenting_problem: presentingProblem || undefined,
          family_background: familyBackground || undefined,
          intervention_plan: interventionPlan || undefined,
        }
      : undefined

  const handleSubmit = () => {
    if (isEditMode && initialSheet) {
      updateMutation.mutate(
        {
          id: initialSheet.id,
          payload: {
            referral_source: referralSource || undefined,
            referral_details: referralDetails || undefined,
            date_of_intake: dateOfIntake || undefined,
            remarks: remarks || undefined,
            assessment: assessmentPayload(),
          },
        },
        { onSuccess: onClose }
      )
      return
    }

    createMutation.mutate(
      {
        sheet: {
          referral_source: referralSource || undefined,
          referral_details: referralDetails || undefined,
          date_of_intake: dateOfIntake || undefined,
          remarks: remarks || undefined,
          patient_id: Number(patient.id),
          ...(attachableCase
            ? { case_id: attachableCase.id }
            : { case: { case_type: caseType, priority_level: priorityLevel, admission_type: admissionType } }),
          assessment: assessmentPayload(),
          ...(assistantTypeId
            ? {
                assistances: [
                  {
                    assistant_type_id: Number(assistantTypeId),
                    amount: assistanceAmount ? Number(assistanceAmount) : undefined,
                    notes: assistanceNotes || undefined,
                  },
                ],
              }
            : {}),
          ...(classification && expenseRows.length > 0
            ? {
                expenses: expenseRows
                  .filter((row) => row.type && row.amount)
                  .map((row) => ({ expense_type: row.type, amount: Number(row.amount) })),
              }
            : {}),
        },
        diagnosis: diagnosisName
          ? {
              diagnosis_name: diagnosisName,
              diagnosis_description: diagnosisDescription || undefined,
              diagnosis_date: diagnosisDate || undefined,
              attending_physician: attendingPhysician || undefined,
              facility_name: facilityName || undefined,
            }
          : undefined,
      },
      { onSuccess: onClose }
    )
  }

  const steps = isEditMode
    ? [{ number: 1, title: "Intake & Assessment" }]
    : [
        { number: 1, title: "Intake & Case" },
        { number: 2, title: "Assessment & Assistance" },
      ]

  return (
    <>
      <DialogHeader className="border-b border-border/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold font-heading">
            <ClipboardList className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold font-heading">
              {isEditMode ? `Edit Intake ${initialSheet?.intake_no}` : "Create New Intake Sheet"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Patient: <strong className="text-foreground">{patient.fullName}</strong> • Hosp ID: {patient.hospitalNo}
            </DialogDescription>
          </div>
        </div>

        {steps.length > 1 && (
          <div className="grid grid-cols-2 gap-2 pt-4">
            {steps.map((step) => {
              const isActive = currentStep === step.number
              const isDone = currentStep > step.number
              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => setCurrentStep(step.number)}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2 text-sm font-semibold border transition-all cursor-pointer ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30"
                      : isDone
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-border bg-muted/30 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {isDone && <Check className="size-4" />}
                    <span>Step {step.number}</span>
                  </div>
                  <span className="text-xs truncate max-w-full">{step.title}</span>
                </button>
              )
            })}
          </div>
        )}
      </DialogHeader>

      <div className="py-4 text-sm space-y-4">
        {mutationError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {mutationError.message}
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Referral Source</Label>
                <Input
                  value={referralSource}
                  onChange={(e) => setReferralSource(e.target.value)}
                  placeholder="e.g. ER walk-in, physician referral"
                  className="h-10 mt-1 text-sm"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold">Date of Intake</Label>
                <Input
                  type="date"
                  value={dateOfIntake}
                  onChange={(e) => setDateOfIntake(e.target.value)}
                  className="h-10 mt-1 text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">Referral Details</Label>
              <Textarea
                value={referralDetails}
                onChange={(e) => setReferralDetails(e.target.value)}
                rows={2}
                className="mt-1 text-sm"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Remarks</Label>
              <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} className="mt-1 text-sm" />
            </div>

            <div className="border-t border-border/50 pt-3">
              <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Case
              </Label>

              {isEditMode && (
                <p className="text-sm text-muted-foreground">
                  Case: <strong className="text-foreground">{detail?.case?.case_code ?? "—"}</strong> (locked once an
                  intake is created)
                </p>
              )}

              {attachableCase && (
                <p className="text-sm text-muted-foreground">
                  This intake will attach to the patient&apos;s open case{" "}
                  <strong className="text-foreground font-mono">{attachableCase.case_code}</strong> (status:{" "}
                  {attachableCase.status}).
                </p>
              )}

              {needsNewCase && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    No open or ongoing case found for this patient — a new case will be opened.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-sm font-semibold">Case Type</Label>
                      <NativeSelect
                        value={caseType}
                        onChange={(e) => setCaseType(e.target.value)}
                        className="h-10 mt-1 text-sm"
                      >
                        {CASE_TYPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </NativeSelect>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Priority Level</Label>
                      <NativeSelect
                        value={priorityLevel}
                        onChange={(e) => setPriorityLevel(e.target.value)}
                        className="h-10 mt-1 text-sm"
                      >
                        {PRIORITY_LEVEL_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </NativeSelect>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Admission Type</Label>
                      <NativeSelect
                        value={admissionType}
                        onChange={(e) => setAdmissionType(e.target.value)}
                        className="h-10 mt-1 text-sm"
                      >
                        {ADMISSION_TYPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </NativeSelect>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border/50 pt-3">
              <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Intake Worker
              </Label>
              <p className="text-sm text-foreground font-semibold">
                {user?.employee_name ?? "—"}{" "}
                <span className="text-muted-foreground font-mono font-normal">
                  ({user?.employee_number ?? "—"})
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Always the logged-in user — assigned automatically by the server.
              </p>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Classification</Label>
                <NativeSelect
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                  className="h-10 mt-1 text-sm font-bold"
                >
                  <option value="">Skip — no assessment yet</option>
                  {ASSESSMENT_CLASSIFICATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.replace(/_/g, " ")}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div>
                <Label className="text-sm font-semibold">Total Family Income (₱/mo)</Label>
                <Input
                  type="number"
                  value={totalFamilyIncome}
                  onChange={(e) => setTotalFamilyIncome(e.target.value)}
                  disabled={!classification}
                  className="h-10 mt-1 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">Presenting Problem</Label>
              <Textarea
                value={presentingProblem}
                onChange={(e) => setPresentingProblem(e.target.value)}
                disabled={!classification}
                rows={2}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Family Background</Label>
              <Textarea
                value={familyBackground}
                onChange={(e) => setFamilyBackground(e.target.value)}
                disabled={!classification}
                rows={2}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Intervention Plan</Label>
              <Textarea
                value={interventionPlan}
                onChange={(e) => setInterventionPlan(e.target.value)}
                disabled={!classification}
                rows={2}
                className="mt-1 text-sm"
              />
            </div>

            {!isEditMode && (
              <>
                <div className="border-t border-border/50 pt-3">
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                    Recommended Assistance (optional)
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-sm font-semibold">Assistance Type</Label>
                      <NativeSelect
                        value={assistantTypeId}
                        onChange={(e) => setAssistantTypeId(e.target.value)}
                        className="h-10 mt-1 text-sm"
                      >
                        <option value="">None</option>
                        {assistantTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </NativeSelect>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Amount (₱)</Label>
                      <Input
                        type="number"
                        value={assistanceAmount}
                        onChange={(e) => setAssistanceAmount(e.target.value)}
                        disabled={!assistantTypeId}
                        className="h-10 mt-1 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Notes</Label>
                      <Input
                        value={assistanceNotes}
                        onChange={(e) => setAssistanceNotes(e.target.value)}
                        disabled={!assistantTypeId}
                        className="h-10 mt-1 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Household Expenses (optional)
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1"
                      disabled={!classification}
                      onClick={() => setExpenseRows((rows) => [...rows, { type: "", amount: "" }])}
                    >
                      <Plus className="size-3.5" /> Add expense
                    </Button>
                  </div>
                  {!classification && (
                    <p className="text-[11px] text-muted-foreground mb-2">
                      Pick a classification above first — expenses are recorded against the assessment.
                    </p>
                  )}
                  {expenseRows.length > 0 && (
                    <div className="space-y-2">
                      {expenseRows.map((row, index) => (
                        <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                          <Input
                            placeholder="e.g. food, rent, utilities"
                            value={row.type}
                            onChange={(e) =>
                              setExpenseRows((rows) =>
                                rows.map((r, i) => (i === index ? { ...r, type: e.target.value } : r))
                              )
                            }
                            className="h-9 text-xs"
                          />
                          <Input
                            type="number"
                            placeholder="Amount (₱)"
                            value={row.amount}
                            onChange={(e) =>
                              setExpenseRows((rows) =>
                                rows.map((r, i) => (i === index ? { ...r, amount: e.target.value } : r))
                              )
                            }
                            className="h-9 text-xs font-mono"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 px-2 text-destructive"
                            onClick={() => setExpenseRows((rows) => rows.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-border/50 pt-3">
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                    Admitting Diagnosis (optional — creates a linked clinical record)
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-semibold">Diagnosis Name</Label>
                      <Input
                        value={diagnosisName}
                        onChange={(e) => setDiagnosisName(e.target.value)}
                        className="h-10 mt-1 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Diagnosis Date</Label>
                      <Input
                        type="date"
                        value={diagnosisDate}
                        onChange={(e) => setDiagnosisDate(e.target.value)}
                        disabled={!diagnosisName}
                        className="h-10 mt-1 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Attending Physician</Label>
                      <Input
                        value={attendingPhysician}
                        onChange={(e) => setAttendingPhysician(e.target.value)}
                        disabled={!diagnosisName}
                        className="h-10 mt-1 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Facility Name</Label>
                      <Input
                        value={facilityName}
                        onChange={(e) => setFacilityName(e.target.value)}
                        disabled={!diagnosisName}
                        className="h-10 mt-1 text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Label className="text-sm font-semibold">Description</Label>
                    <Textarea
                      value={diagnosisDescription}
                      onChange={(e) => setDiagnosisDescription(e.target.value)}
                      disabled={!diagnosisName}
                      rows={2}
                      className="mt-1 text-sm"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <DialogFooter className="flex items-center justify-between border-t border-border/60 pt-4">
        <Button
          type="button"
          variant="outline"
          size="default"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          className="gap-1.5 font-semibold h-10"
        >
          <ChevronLeft className="size-4" /> Back
        </Button>

        {currentStep < steps.length ? (
          <Button
            type="button"
            variant="default"
            size="default"
            onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
            className="gap-1.5 font-bold h-10 px-5"
          >
            Next <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="default"
            size="default"
            disabled={isSaving}
            onClick={handleSubmit}
            className="gap-2 font-bold h-10 px-6"
          >
            {isSaving ? <Spinner className="size-4" /> : <Check className="size-4" />}
            {isEditMode ? "Save Changes" : "Create Draft Intake Sheet"}
          </Button>
        )}
      </DialogFooter>
    </>
  )
}
