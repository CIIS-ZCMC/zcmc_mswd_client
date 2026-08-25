import React, { useEffect, useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Check, ChevronLeft, ChevronRight, ClipboardList, Heart, UserCheck, Users } from "lucide-react"
import type {
  HousingStatus,
  IntakeSheetRecord,
  IntakeStatus,
  IntakeType,
  MedicalCategory,
  PatientRecord,
} from "../../types"

interface IntakeSheetWizardModalProps {
  isOpen: boolean
  onClose: () => void
  patient: PatientRecord
  initialRecord?: IntakeSheetRecord | null
  onSave: (record: Omit<IntakeSheetRecord, "id"> & { id?: string }) => void
}

export const IntakeSheetWizardModal: React.FC<IntakeSheetWizardModalProps> = ({
  isOpen,
  onClose,
  patient,
  initialRecord,
  onSave,
}) => {
  const [currentStep, setCurrentStep] = useState(1)

  const [formData, setFormData] = useState<Partial<IntakeSheetRecord>>({
    controlNo: `IS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    intakeDate: new Date().toISOString().split("T")[0],
    intakeTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    intakeType: "Initial Admission Intake",
    ward: patient.ward || "Internal Medicine Ward 2",
    bedNo: patient.bedNo || "Bed 01",
    informantName: patient.watchers[0]?.fullName || patient.familyMembers[0]?.fullName || patient.fullName,
    informantRelationship: patient.watchers[0]?.relationship || "Self",
    informantContact: patient.contactNo,
    householdSize: patient.familyMembers.length + 1,
    monthlyIncome: patient.familyMembers.reduce((acc, m) => acc + (m.monthlyIncome || 0), 0),
    perCapitaIncome: Math.round(
      patient.familyMembers.reduce((acc, m) => acc + (m.monthlyIncome || 0), 0) /
        (patient.familyMembers.length + 1)
    ),
    housingStatus: "Informal Settler",
    diagnosis: patient.diagnosis || "",
    presentingProblem: patient.caseStudy?.presentingProblem || "",
    socialWorkerNotes: patient.caseStudy?.socialWorkerNotes || "",
    category: patient.category || "Category C3",
    recommendedAssistance: patient.caseStudy?.recommendedAssistance || "MAIFIP Grant",
    approvedAmount: patient.caseStudy?.approvedAmount || 10000,
    socialWorker: patient.assignedStaff?.socialWorker || "Maria Santos, RSW",
    socialWorkerId: patient.assignedStaff?.socialWorkerId || "RSW-9412",
    status: "Verified",
  })

  useEffect(() => {
    if (initialRecord) {
      setFormData(initialRecord)
    } else {
      const calcIncome = patient.familyMembers.reduce((acc, m) => acc + (m.monthlyIncome || 0), 0)
      const calcMembers = patient.familyMembers.length + 1
      setFormData({
        controlNo: `IS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        intakeDate: new Date().toISOString().split("T")[0],
        intakeTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        intakeType: "Initial Admission Intake",
        ward: patient.ward || "Internal Medicine Ward 2",
        bedNo: patient.bedNo || "Bed 01",
        informantName: patient.watchers[0]?.fullName || patient.familyMembers[0]?.fullName || patient.fullName,
        informantRelationship: patient.watchers[0]?.relationship || "Self",
        informantContact: patient.contactNo,
        householdSize: calcMembers,
        monthlyIncome: calcIncome,
        perCapitaIncome: Math.round(calcIncome / calcMembers),
        housingStatus: "Informal Settler",
        diagnosis: patient.diagnosis || "",
        presentingProblem: patient.caseStudy?.presentingProblem || "",
        socialWorkerNotes: patient.caseStudy?.socialWorkerNotes || "",
        category: patient.category || "Category C3",
        recommendedAssistance: patient.caseStudy?.recommendedAssistance || "MAIFIP Grant",
        approvedAmount: patient.caseStudy?.approvedAmount || 10000,
        socialWorker: patient.assignedStaff?.socialWorker || "Maria Santos, RSW",
        socialWorkerId: patient.assignedStaff?.socialWorkerId || "RSW-9412",
        status: "Verified",
      })
    }
    setCurrentStep(1)
  }, [initialRecord, patient, isOpen])

  const handleIncomeOrSizeChange = (monthlyIncome: number, householdSize: number) => {
    const safeSize = householdSize > 0 ? householdSize : 1
    const perCapita = Math.round(monthlyIncome / safeSize)
    setFormData((prev) => ({
      ...prev,
      monthlyIncome,
      householdSize: safeSize,
      perCapitaIncome: perCapita,
    }))
  }

  const handleComplete = () => {
    onSave(formData as Omit<IntakeSheetRecord, "id">)
    onClose()
  }

  const steps = [
    { number: 1, title: "Metadata & Informant", icon: Calendar },
    { number: 2, title: "Household & Income", icon: Users },
    { number: 3, title: "Clinical Assessment", icon: Heart },
    { number: 4, title: "Category & Grant", icon: UserCheck },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold font-heading">
              <ClipboardList className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-heading">
                {initialRecord ? "Edit Social Intake Sheet" : "Create New Social Intake Sheet"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Patient: <strong className="text-foreground">{patient.fullName}</strong> • Hosp ID: {patient.hospitalNo}
              </DialogDescription>
            </div>
          </div>

          {/* Stepper Header Chips */}
          <div className="grid grid-cols-4 gap-2 pt-4">
            {steps.map((step) => {
              const StepIcon = step.icon
              const isActive = currentStep === step.number
              const isDone = currentStep > step.number
              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => setCurrentStep(step.number)}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2 text-xs font-semibold border transition-all cursor-pointer ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30"
                      : isDone
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-border bg-muted/30 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {isDone ? <Check className="size-3.5" /> : <StepIcon className="size-3.5" />}
                    <span>Step {step.number}</span>
                  </div>
                  <span className="text-[11px] truncate max-w-full">{step.title}</span>
                </button>
              )
            })}
          </div>
        </DialogHeader>

        {/* Wizard Step Body */}
        <div className="py-4 text-sm space-y-4">
          {/* Step 1: Metadata & Informant */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Intake Control Number</Label>
                  <Input
                    value={formData.controlNo || ""}
                    onChange={(e) => setFormData({ ...formData, controlNo: e.target.value })}
                    className="h-10 mt-1 font-mono font-bold"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Intake Type</Label>
                  <NativeSelect
                    value={formData.intakeType || "Initial Admission Intake"}
                    onChange={(e) => setFormData({ ...formData, intakeType: e.target.value as IntakeType })}
                    className="h-10 mt-1 text-sm"
                  >
                    <option value="Initial Admission Intake">Initial Admission Intake</option>
                    <option value="Readmission Evaluation">Readmission Evaluation</option>
                    <option value="Re-assessment / Upgrade">Re-assessment / Upgrade</option>
                    <option value="ER Fast-Track Intake">ER Fast-Track Intake</option>
                  </NativeSelect>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Intake Date</Label>
                  <Input
                    type="date"
                    value={formData.intakeDate || ""}
                    onChange={(e) => setFormData({ ...formData, intakeDate: e.target.value })}
                    className="h-10 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Intake Time</Label>
                  <Input
                    value={formData.intakeTime || ""}
                    onChange={(e) => setFormData({ ...formData, intakeTime: e.target.value })}
                    className="h-10 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Ward Assignment</Label>
                  <Input
                    value={formData.ward || ""}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    className="h-10 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Bed Number</Label>
                  <Input
                    value={formData.bedNo || ""}
                    onChange={(e) => setFormData({ ...formData, bedNo: e.target.value })}
                    className="h-10 mt-1"
                  />
                </div>
              </div>

              <div className="border-t border-border/50 pt-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Informant / Respondent Information
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Informant Name</Label>
                    <Input
                      value={formData.informantName || ""}
                      onChange={(e) => setFormData({ ...formData, informantName: e.target.value })}
                      className="h-10 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Relationship</Label>
                    <Input
                      value={formData.informantRelationship || ""}
                      onChange={(e) => setFormData({ ...formData, informantRelationship: e.target.value })}
                      className="h-10 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Contact No.</Label>
                    <Input
                      value={formData.informantContact || ""}
                      onChange={(e) => setFormData({ ...formData, informantContact: e.target.value })}
                      className="h-10 mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Socio-Economic Profile */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Household Members Count</Label>
                  <Input
                    type="number"
                    value={formData.householdSize || 1}
                    onChange={(e) =>
                      handleIncomeOrSizeChange(
                        formData.monthlyIncome || 0,
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="h-10 mt-1 font-mono font-bold"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Total Monthly Income (₱)</Label>
                  <Input
                    type="number"
                    value={formData.monthlyIncome || 0}
                    onChange={(e) =>
                      handleIncomeOrSizeChange(
                        parseInt(e.target.value) || 0,
                        formData.householdSize || 1
                      )
                    }
                    className="h-10 mt-1 font-mono font-bold"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Per Capita Income (Auto)</Label>
                  <Input
                    readOnly
                    value={`₱${(formData.perCapitaIncome || 0).toLocaleString()}`}
                    className="h-10 mt-1 font-mono font-extrabold text-primary bg-muted/40"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Housing Condition &amp; Ownership</Label>
                <NativeSelect
                  value={formData.housingStatus || "Informal Settler"}
                  onChange={(e) => setFormData({ ...formData, housingStatus: e.target.value as HousingStatus })}
                  className="h-10 mt-1 text-sm"
                >
                  <option value="Informal Settler">Informal Settler</option>
                  <option value="Rented">Rented</option>
                  <option value="Living with Relatives">Living with Relatives</option>
                  <option value="Owned">Owned</option>
                </NativeSelect>
              </div>
            </div>
          )}

          {/* Step 3: Clinical Need & Assessment */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold">Admitting Diagnosis</Label>
                <Input
                  value={formData.diagnosis || ""}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="h-10 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Presenting Need / Problem Statement</Label>
                <Textarea
                  value={formData.presentingProblem || ""}
                  onChange={(e) => setFormData({ ...formData, presentingProblem: e.target.value })}
                  rows={2}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Social Worker Evaluation &amp; Intake Notes</Label>
                <Textarea
                  value={formData.socialWorkerNotes || ""}
                  onChange={(e) => setFormData({ ...formData, socialWorkerNotes: e.target.value })}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Step 4: Category & Assistance Approval */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Assigned Medical Safety Net Category</Label>
                  <NativeSelect
                    value={formData.category || "Category C3"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as MedicalCategory })}
                    className="h-10 mt-1 text-sm font-bold"
                  >
                    <option value="Category C1">Category C1 (Partial Safety Net)</option>
                    <option value="Category C2">Category C2 (Partial Subsidy)</option>
                    <option value="Category C3">Category C3 (High Indigency Subsidy)</option>
                    <option value="Category D">Category D (100% Full Subsidy / NBB)</option>
                  </NativeSelect>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Verification Status</Label>
                  <NativeSelect
                    value={formData.status || "Verified"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as IntakeStatus })}
                    className="h-10 mt-1 text-sm font-bold"
                  >
                    <option value="Verified">Verified</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Archived">Archived</option>
                  </NativeSelect>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Recommended Assistance Program</Label>
                  <Input
                    value={formData.recommendedAssistance || ""}
                    onChange={(e) => setFormData({ ...formData, recommendedAssistance: e.target.value })}
                    className="h-10 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Approved Grant Amount (₱)</Label>
                  <Input
                    type="number"
                    value={formData.approvedAmount || 0}
                    onChange={(e) => setFormData({ ...formData, approvedAmount: parseInt(e.target.value) || 0 })}
                    className="h-10 mt-1 font-mono font-extrabold text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-border/50 pt-3">
                <div>
                  <Label className="text-xs font-semibold">Evaluating Social Worker</Label>
                  <Input
                    value={formData.socialWorker || ""}
                    onChange={(e) => setFormData({ ...formData, socialWorker: e.target.value })}
                    className="h-10 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">RSW License Number</Label>
                  <Input
                    value={formData.socialWorkerId || ""}
                    onChange={(e) => setFormData({ ...formData, socialWorkerId: e.target.value })}
                    className="h-10 mt-1 font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
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

          {currentStep < 4 ? (
            <Button
              type="button"
              variant="default"
              size="default"
              onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
              className="gap-1.5 font-bold h-10 px-5"
            >
              Next <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              size="default"
              onClick={handleComplete}
              className="gap-2 font-bold h-10 px-6"
            >
              <Check className="size-4" /> {initialRecord ? "Update Intake Sheet" : "Save Intake Sheet"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
