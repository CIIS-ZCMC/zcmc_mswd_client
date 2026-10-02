import React, { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApiError } from "@/lib/api-client"
import {
  useAssessmentExpenses,
  useCreateAssessment,
  useCreateAssessmentExpense,
  useDeleteAssessmentExpense,
  useUpdateAssessment,
} from "../../hooks/use-assessment"
import type {
  Assessment,
  CreateAssessmentPayload,
  UpdateAssessmentPayload,
} from "../../types/assessment.types"
import {
  EXPENSE_CATEGORY_OPTIONS,
  FUND_SOURCE_OPTIONS,
  HOUSE_TENURE_OPTIONS,
  INFORMANT_RELATIONSHIP_OPTIONS,
  LEGACY_CLASSIFICATION_OPTIONS,
  LIGHT_SOURCE_OPTIONS,
  MSWD_CLASSIFICATION_OPTIONS,
  PROBLEM_CATEGORY_OPTIONS,
  RECOMMENDATION_MODE_OPTIONS,
  WATER_SOURCE_OPTIONS,
} from "../../lib/assessment-constants"
import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  Coins,
  FileCheck,
  FileEdit,
  HeartHandshake,
  Home,
  Lightbulb,
  Loader2,
  Plus,
  Receipt,
  Stethoscope,
  Trash2,
  User,
  UserCheck,
  Zap,
} from "lucide-react"

interface IntakeAssessmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  caseId: number
  caseCode?: string
  patientName?: string
  patientFirstName?: string
  patientMiddleName?: string
  patientLastName?: string
  patientAddress?: string
  patientContact?: string
  existingAssessment?: Assessment | null
  onSuccess?: () => void
}

interface StagedExpense {
  expense_type: string
  specify?: string
  amount: number
}

interface StagedIncome {
  source: string
  amount: number | null
}

function parseFullName(raw: string): { last: string; first: string; middle: string } {
  if (!raw) return { last: "", first: "", middle: "" }
  const trimmed = raw.trim()
  if (trimmed.includes(",")) {
    const [lastPart, restPart] = trimmed.split(",")
    const rest = (restPart || "").trim().split(/\s+/)
    return {
      last: lastPart.trim(),
      first: rest[0] || "",
      middle: rest.slice(1).join(" "),
    }
  }
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) {
    return { last: "", first: parts[0], middle: "" }
  }
  if (parts.length === 2) {
    return { first: parts[0], middle: "", last: parts[1] }
  }
  return {
    first: parts[0],
    middle: parts.slice(1, -1).join(" "),
    last: parts[parts.length - 1],
  }
}

function combineInformantName(last: string, first: string, middle: string): string | null {
  const l = last.trim()
  const f = first.trim()
  const m = middle.trim()
  if (!l && !f && !m) return null
  if (l && f) {
    return `${l}, ${f}${m ? ` ${m}` : ""}`.trim()
  }
  return [f, m, l].filter(Boolean).join(" ").trim() || null
}

export const IntakeAssessmentDialog: React.FC<IntakeAssessmentDialogProps> = ({
  open,
  onOpenChange,
  caseId,
  caseCode,
  patientName,
  patientFirstName,
  patientMiddleName,
  patientLastName,
  patientAddress,
  patientContact,
  existingAssessment,
  onSuccess,
}) => {
  const isEditMode = Boolean(existingAssessment?.id)
  const assessmentId = existingAssessment?.id ?? 0

  const createMutation = useCreateAssessment(caseId)
  const updateMutation = useUpdateAssessment(caseId, assessmentId)
  const { data: serverExpenses = [] } = useAssessmentExpenses(
    isEditMode ? assessmentId : undefined
  )
  const createExpenseMutation = useCreateAssessmentExpense(caseId, assessmentId)
  const deleteExpenseMutation = useDeleteAssessmentExpense(caseId, assessmentId)

  // Form State: Informant (Three Name Inputs: Last Name, First Name, Middle Name)
  const [isInformantPatient, setIsInformantPatient] = useState(false)
  const [informantLastName, setInformantLastName] = useState("")
  const [informantFirstName, setInformantFirstName] = useState("")
  const [informantMiddleName, setInformantMiddleName] = useState("")
  const [informantRelationship, setInformantRelationship] = useState("")
  const [customRelationship, setCustomRelationship] = useState("")
  const [informantAddress, setInformantAddress] = useState("")
  const [informantContact, setInformantContact] = useState("")

  // Problem & Medical
  const [presentingProblem, setPresentingProblem] = useState("")
  const [problemCategories, setProblemCategories] = useState<string[]>([])
  const [problemSpecify, setProblemSpecify] = useState("")
  const [medicalHistory, setMedicalHistory] = useState("")

  // Income Breakdown & Auto Computation
  const [primaryIncome, setPrimaryIncome] = useState<string>("0")
  const [otherIncomeSources, setOtherIncomeSources] = useState<StagedIncome[]>([])

  // Socio-Economic Housing & Utilities
  const [houseTenure, setHouseTenure] = useState<string>("")
  const [houseTenureAmount, setHouseTenureAmount] = useState<string>("0")
  const [lightSource, setLightSource] = useState<string>("")
  const [lightSourceAmount, setLightSourceAmount] = useState<string>("0")
  const [waterSource, setWaterSource] = useState<string>("")
  const [waterSourceAmount, setWaterSourceAmount] = useState<string>("0")
  const [housingType, setHousingType] = useState("")
  const [utilitiesAccess, setUtilitiesAccess] = useState("")

  // Staged Expenses for Create mode
  const [stagedExpenses, setStagedExpenses] = useState<StagedExpense[]>([
    { expense_type: "Food", amount: 0 },
    { expense_type: "Medical", amount: 0 },
  ])

  // Inline new expense state for Edit mode
  const [newExpenseCategory, setNewExpenseCategory] = useState<string>("")
  const [newExpenseSpecify, setNewExpenseSpecify] = useState<string>("")
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>("")

  // Recommendations & Classification
  const [recommendation, setRecommendation] = useState("")
  const [recommendationMode, setRecommendationMode] = useState("")
  const [fundSource, setFundSource] = useState("")
  const [hasOverride, setHasOverride] = useState(false)
  const [classificationOverride, setClassificationOverride] = useState<string>("")
  const [overrideReason, setOverrideReason] = useState("")

  const [familyBackground, setFamilyBackground] = useState("")
  const [socialFunctioning, setSocialFunctioning] = useState("")
  const [assessmentNotes, setAssessmentNotes] = useState("")
  const [interventionPlan, setInterventionPlan] = useState("")

  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Auto-calculated Total Monthly Family Income
  const calculatedTotalFamilyIncome = useMemo(() => {
    const primary = Math.max(0, Number(primaryIncome) || 0)
    const otherSum = otherIncomeSources.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
    return primary + otherSum
  }, [primaryIncome, otherIncomeSources])

  // Auto-calculated Housing & Utilities Cost
  const housingAndUtilitiesTotal = useMemo(() => {
    const house = Math.max(0, Number(houseTenureAmount) || 0)
    const light = Math.max(0, Number(lightSourceAmount) || 0)
    const water = Math.max(0, Number(waterSourceAmount) || 0)
    return house + light + water
  }, [houseTenureAmount, lightSourceAmount, waterSourceAmount])

  // Total Expenses (Housing/Utilities + other items)
  const calculatedTotalExpenses = useMemo(() => {
    if (isEditMode) {
      const serverTotal = serverExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
      return housingAndUtilitiesTotal + serverTotal
    } else {
      const stagedTotal = stagedExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
      return housingAndUtilitiesTotal + stagedTotal
    }
  }, [isEditMode, serverExpenses, stagedExpenses, housingAndUtilitiesTotal])

  // Initialize form from existing assessment on open
  useEffect(() => {
    if (open) {
      setErrorMsg(null)
      if (existingAssessment) {
        if (
          existingAssessment.informantLastName ||
          existingAssessment.informantFirstName ||
          existingAssessment.informantMiddleName
        ) {
          setInformantLastName(existingAssessment.informantLastName ?? "")
          setInformantFirstName(existingAssessment.informantFirstName ?? "")
          setInformantMiddleName(existingAssessment.informantMiddleName ?? "")
        } else if (existingAssessment.informantName) {
          const parsed = parseFullName(existingAssessment.informantName)
          setInformantLastName(parsed.last)
          setInformantFirstName(parsed.first)
          setInformantMiddleName(parsed.middle)
        } else {
          setInformantLastName("")
          setInformantFirstName("")
          setInformantMiddleName("")
        }

        const rawRel = existingAssessment.informantRelationship?.trim() || ""
        const standardMatch = INFORMANT_RELATIONSHIP_OPTIONS.find(
          (opt) =>
            opt.value.toLowerCase() === rawRel.toLowerCase() ||
            (opt.value === "Patient" && rawRel.toLowerCase() === "self")
        )
        if (standardMatch) {
          setInformantRelationship(standardMatch.value)
          setCustomRelationship("")
        } else if (rawRel) {
          setInformantRelationship("Other")
          setCustomRelationship(rawRel)
        } else {
          setInformantRelationship("")
          setCustomRelationship("")
        }

        setInformantAddress(existingAssessment.informantAddress ?? "")
        setInformantContact(existingAssessment.informantContact ?? "")
        setIsInformantPatient(
          (existingAssessment.informantRelationship?.toLowerCase() === "patient" ||
            existingAssessment.informantRelationship?.toLowerCase() === "self") &&
            Boolean(patientName && existingAssessment.informantName === patientName)
        )
        setPresentingProblem(existingAssessment.presentingProblem ?? "")
        setProblemCategories(existingAssessment.problemCategories ?? [])
        setProblemSpecify(existingAssessment.problemSpecify ?? "")
        setMedicalHistory(existingAssessment.medicalHistory ?? "")

        const existingOtherIncome = (existingAssessment.otherIncomeSources ?? []).map((s) => ({
          source: s.source,
          amount: s.amount,
        }))
        setOtherIncomeSources(existingOtherIncome)

        const totalInc =
          existingAssessment.totalFamilyIncome !== null && existingAssessment.totalFamilyIncome !== undefined
            ? Number(existingAssessment.totalFamilyIncome)
            : 0
        const otherSum = existingOtherIncome.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
        const primaryCalculated = Math.max(0, totalInc - otherSum)
        setPrimaryIncome(String(primaryCalculated))

        setHouseTenure(existingAssessment.houseTenure ?? "")
        setLightSource(
          Array.isArray(existingAssessment.lightSource)
            ? existingAssessment.lightSource[0] ?? ""
            : (existingAssessment.lightSource as unknown as string) || ""
        )
        setWaterSource(
          Array.isArray(existingAssessment.waterSource)
            ? existingAssessment.waterSource[0] ?? ""
            : (existingAssessment.waterSource as unknown as string) || ""
        )

        // Try extracting housing / utilities amounts from existing expenses if available
        const houseExp = existingAssessment.expenses?.find((e) =>
          e.expenseType.toLowerCase().includes("rent") || e.expenseType.toLowerCase().includes("house")
        )
        const lightExp = existingAssessment.expenses?.find((e) =>
          e.expenseType.toLowerCase().includes("light") || e.expenseType.toLowerCase().includes("electric")
        )
        const waterExp = existingAssessment.expenses?.find((e) =>
          e.expenseType.toLowerCase().includes("water")
        )
        setHouseTenureAmount(houseExp ? String(houseExp.amount) : "0")
        setLightSourceAmount(lightExp ? String(lightExp.amount) : "0")
        setWaterSourceAmount(waterExp ? String(waterExp.amount) : "0")

        setHousingType(existingAssessment.housingType ?? "")
        setUtilitiesAccess(existingAssessment.utilitiesAccess ?? "")
        setRecommendation(existingAssessment.recommendation ?? "")
        setRecommendationMode(existingAssessment.recommendationMode ?? "")
        setFundSource(existingAssessment.fundSource ?? "")
        setHasOverride(existingAssessment.hasOverride ?? false)
        setClassificationOverride(
          (existingAssessment.classification as string) ||
            (existingAssessment.calculatedClassification as string) ||
            ""
        )
        setOverrideReason(existingAssessment.classificationOverrideReason ?? "")
        setFamilyBackground(existingAssessment.familyBackground ?? "")
        setSocialFunctioning(existingAssessment.socialFunctioning ?? "")
        setAssessmentNotes(existingAssessment.assessmentNotes ?? "")
        setInterventionPlan(existingAssessment.interventionPlan ?? "")
      } else {
        setIsInformantPatient(false)
        setInformantLastName("")
        setInformantFirstName("")
        setInformantMiddleName("")
        setInformantRelationship("")
        setCustomRelationship("")
        setInformantAddress("")
        setInformantContact("")
        setPresentingProblem("")
        setProblemCategories([])
        setProblemSpecify("")
        setMedicalHistory("")
        setPrimaryIncome("0")
        setOtherIncomeSources([])
        setHouseTenure("")
        setHouseTenureAmount("0")
        setLightSource("")
        setLightSourceAmount("0")
        setWaterSource("")
        setWaterSourceAmount("0")
        setHousingType("")
        setUtilitiesAccess("")
        setRecommendation("")
        setRecommendationMode("")
        setFundSource("")
        setHasOverride(false)
        setClassificationOverride("")
        setOverrideReason("")
        setFamilyBackground("")
        setSocialFunctioning("")
        setAssessmentNotes("")
        setInterventionPlan("")
        setStagedExpenses([
          { expense_type: "Food", amount: 0 },
          { expense_type: "Medical", amount: 0 },
        ])
      }
    }
  }, [open, existingAssessment, patientName, patientAddress, patientContact])

  // Handle "Informant is Patient" toggle
  const handleToggleInformantIsPatient = (checked: boolean) => {
    setIsInformantPatient(checked)
    if (checked) {
      if (patientLastName || patientFirstName || patientMiddleName) {
        setInformantLastName(patientLastName || "")
        setInformantFirstName(patientFirstName || "")
        setInformantMiddleName(patientMiddleName || "")
      } else if (patientName) {
        const parsed = parseFullName(patientName)
        setInformantLastName(parsed.last)
        setInformantFirstName(parsed.first)
        setInformantMiddleName(parsed.middle)
      }
      setInformantRelationship("Patient")
      setCustomRelationship("")
      if (patientAddress) setInformantAddress(patientAddress)
      if (patientContact) setInformantContact(patientContact)
    } else {
      setInformantLastName("")
      setInformantFirstName("")
      setInformantMiddleName("")
      setInformantRelationship("")
      setCustomRelationship("")
      setInformantAddress("")
      setInformantContact("")
    }
  }

  const toggleCategory = (cat: string) => {
    setProblemCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const handleAddOtherIncome = () => {
    setOtherIncomeSources((prev) => [...prev, { source: "", amount: null }])
  }

  const handleRemoveOtherIncome = (index: number) => {
    setOtherIncomeSources((prev) => prev.filter((_, i) => i !== index))
  }

  const handleOtherIncomeChange = (
    index: number,
    field: "source" | "amount",
    val: string
  ) => {
    setOtherIncomeSources((prev) => {
      const next = [...prev]
      if (field === "source") {
        next[index] = { ...next[index], source: val }
      } else {
        next[index] = { ...next[index], amount: val ? Number(val) : null }
      }
      return next
    })
  }

  // Staged Expenses for Create mode
  const handleAddStagedExpense = () => {
    setStagedExpenses((prev) => [...prev, { expense_type: "Food", amount: 0 }])
  }

  const handleRemoveStagedExpense = (index: number) => {
    setStagedExpenses((prev) => prev.filter((_, i) => i !== index))
  }

  const handleStagedExpenseChange = (
    index: number,
    field: "expense_type" | "specify" | "amount",
    val: string
  ) => {
    setStagedExpenses((prev) => {
      const next = [...prev]
      if (field === "expense_type") {
        next[index] = { ...next[index], expense_type: val }
      } else if (field === "specify") {
        next[index] = { ...next[index], specify: val }
      } else {
        next[index] = { ...next[index], amount: Number(val) || 0 }
      }
      return next
    })
  }

  // Edit Mode Live Expense CRUD
  const handleCreateLiveExpense = async () => {
    if (!newExpenseCategory) return
    const finalName =
      newExpenseCategory === "Others" && newExpenseSpecify.trim()
        ? `Others: ${newExpenseSpecify.trim()}`
        : newExpenseCategory

    try {
      await createExpenseMutation.mutateAsync({
        expense_type: finalName,
        amount: Number(newExpenseAmount) || 0,
      })
      setNewExpenseCategory("")
      setNewExpenseSpecify("")
      setNewExpenseAmount("")
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.firstValidationMessage || err.message)
      }
    }
  }

  const handleDeleteLiveExpense = async (id: number) => {
    try {
      await deleteExpenseMutation.mutateAsync(id)
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.firstValidationMessage || err.message)
      }
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (hasOverride && !overrideReason.trim()) {
      setErrorMsg("Written justification is required when overriding MSWD classification.")
      return
    }

    const filteredOtherIncome = otherIncomeSources
      .filter((i) => i.source.trim())
      .map((i) => ({ source: i.source.trim(), amount: i.amount }))

    const lightSourceArray = lightSource ? [lightSource] : null
    const waterSourceArray = waterSource ? [waterSource] : null

    const combinedName = combineInformantName(informantLastName, informantFirstName, informantMiddleName)

    const effectiveRelationship =
      informantRelationship === "Other"
        ? customRelationship.trim() || "Other"
        : informantRelationship.trim() || null

    if (isEditMode) {
      const payload: UpdateAssessmentPayload = {
        informant_name: combinedName,
        informant_last_name: informantLastName.trim() || null,
        informant_first_name: informantFirstName.trim() || null,
        informant_middle_name: informantMiddleName.trim() || null,
        informant_relationship: effectiveRelationship,
        informant_address: informantAddress.trim() || null,
        informant_contact_number: informantContact.trim() || null,
        informant_contact: informantContact.trim() || null,
        presenting_problem: presentingProblem.trim() || null,
        problem_categories: problemCategories.length > 0 ? problemCategories : null,
        problem_specify: problemSpecify.trim() || null,
        medical_history: medicalHistory.trim() || null,
        total_family_income: calculatedTotalFamilyIncome,
        other_income_sources: filteredOtherIncome.length > 0 ? filteredOtherIncome : undefined,
        house_tenure: houseTenure || null,
        light_source: lightSourceArray,
        water_source: waterSourceArray,
        housing_type: housingType.trim() || null,
        utilities_access: utilitiesAccess.trim() || null,
        recommendation: recommendation.trim() || null,
        recommendation_mode: recommendationMode || null,
        fund_source: fundSource || null,
        classification: hasOverride && classificationOverride ? classificationOverride : null,
        classification_override_reason: hasOverride ? overrideReason.trim() : null,
        family_background: familyBackground.trim() || null,
        social_functioning: socialFunctioning.trim() || null,
        assessment_notes: assessmentNotes.trim() || null,
        intervention_plan: interventionPlan.trim() || null,
      }

      try {
        await updateMutation.mutateAsync(payload)
        onOpenChange(false)
        onSuccess?.()
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setErrorMsg(err.firstValidationMessage || err.message)
        } else {
          setErrorMsg(err instanceof Error ? err.message : "Failed to update assessment.")
        }
      }
    } else {
      // Build comprehensive initial expenses including housing & utilities if set
      const combinedExpenses: Array<{ expense_type: string; amount: number }> = []

      if (Number(houseTenureAmount) > 0) {
        const tenureLabel = HOUSE_TENURE_OPTIONS.find((t) => t.value === houseTenure)?.label || "Housing"
        combinedExpenses.push({
          expense_type: houseTenure === "rented" ? "House Rent" : `House Tenure (${tenureLabel})`,
          amount: Number(houseTenureAmount),
        })
      }

      if (Number(lightSourceAmount) > 0) {
        const lightLabel = LIGHT_SOURCE_OPTIONS.find((l) => l.value === lightSource)?.label || "Electricity"
        combinedExpenses.push({
          expense_type: `Light / Power (${lightLabel})`,
          amount: Number(lightSourceAmount),
        })
      }

      if (Number(waterSourceAmount) > 0) {
        const waterLabel = WATER_SOURCE_OPTIONS.find((w) => w.value === waterSource)?.label || "Water"
        combinedExpenses.push({
          expense_type: `Water Source (${waterLabel})`,
          amount: Number(waterSourceAmount),
        })
      }

      stagedExpenses.forEach((e) => {
        const finalName =
          e.expense_type === "Others" && e.specify?.trim()
            ? `Others: ${e.specify.trim()}`
            : e.expense_type.trim()
        if (finalName && e.amount >= 0) {
          combinedExpenses.push({ expense_type: finalName, amount: e.amount })
        }
      })

      const payload: CreateAssessmentPayload = {
        informant_name: combinedName,
        informant_last_name: informantLastName.trim() || null,
        informant_first_name: informantFirstName.trim() || null,
        informant_middle_name: informantMiddleName.trim() || null,
        informant_relationship: effectiveRelationship,
        informant_address: informantAddress.trim() || null,
        informant_contact_number: informantContact.trim() || null,
        informant_contact: informantContact.trim() || null,
        presenting_problem: presentingProblem.trim() || null,
        problem_categories: problemCategories.length > 0 ? problemCategories : null,
        problem_specify: problemSpecify.trim() || null,
        medical_history: medicalHistory.trim() || null,
        total_family_income: calculatedTotalFamilyIncome,
        other_income_sources: filteredOtherIncome.length > 0 ? filteredOtherIncome : undefined,
        house_tenure: houseTenure || null,
        light_source: lightSourceArray,
        water_source: waterSourceArray,
        housing_type: housingType.trim() || null,
        utilities_access: utilitiesAccess.trim() || null,
        recommendation: recommendation.trim() || null,
        recommendation_mode: recommendationMode || null,
        fund_source: fundSource || null,
        classification: hasOverride && classificationOverride ? classificationOverride : null,
        classification_override_reason: hasOverride ? overrideReason.trim() : null,
        family_background: familyBackground.trim() || null,
        social_functioning: socialFunctioning.trim() || null,
        assessment_notes: assessmentNotes.trim() || null,
        intervention_plan: interventionPlan.trim() || null,
        expenses: combinedExpenses.length > 0 ? combinedExpenses : undefined,
      }

      try {
        const created = await createMutation.mutateAsync(payload)
        // If expenses were not written directly via create payload, create them
        if (created?.id && combinedExpenses.length > 0 && (!created.expenses || created.expenses.length === 0)) {
          for (const exp of combinedExpenses) {
            await createExpenseMutation.mutateAsync(exp)
          }
        }
        onOpenChange(false)
        onSuccess?.()
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setErrorMsg(err.firstValidationMessage || err.message)
        } else {
          setErrorMsg(err instanceof Error ? err.message : "Failed to create assessment.")
        }
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6 sm:p-8">
        <DialogHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl sm:text-2xl font-extrabold flex items-center gap-2.5 text-foreground">
                {isEditMode ? (
                  <FileEdit className="size-6 text-primary" />
                ) : (
                  <FileCheck className="size-6 text-primary" />
                )}
                {isEditMode ? "Edit Intake Assessment (ANNEX B)" : "New Intake Assessment (ANNEX B)"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground font-medium">
                Unified Intake Assessment and MSWD Classification Form for Case #{caseCode ?? caseId}
                {patientName ? ` (${patientName})` : ""}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {errorMsg && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 flex gap-3 items-start text-xs sm:text-sm font-semibold text-destructive">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold">Validation / Server Error</div>
                <div>{errorMsg}</div>
              </div>
            </div>
          )}

          {/* Section 1: Informant Details */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <User className="size-5 text-primary" />
                <h4 className="text-base sm:text-lg font-bold text-foreground">
                  1. Informant Details
                </h4>
              </div>

              {/* Informant is the Patient toggle */}
              <label className="inline-flex items-center gap-2.5 bg-primary/10 hover:bg-primary/15 border border-primary/30 px-3.5 py-1.5 rounded-xl cursor-pointer select-none transition-all">
                <Checkbox
                  checked={isInformantPatient}
                  onCheckedChange={(checked) => handleToggleInformantIsPatient(Boolean(checked))}
                />
                <span className="text-xs font-extrabold text-primary flex items-center gap-1.5">
                  <UserCheck className="size-3.5" />
                  Informant is the Patient
                </span>
              </label>
            </div>

            {/* Three Name Inputs: Last Name, First Name, Middle Name */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">Informant Last Name</Label>
                <Input
                  placeholder="e.g. Santos"
                  value={informantLastName}
                  onChange={(e) => setInformantLastName(e.target.value)}
                  disabled={isInformantPatient}
                  className="h-11 text-sm font-medium disabled:opacity-75 disabled:bg-muted/40 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">Informant First Name</Label>
                <Input
                  placeholder="e.g. Maria"
                  value={informantFirstName}
                  onChange={(e) => setInformantFirstName(e.target.value)}
                  disabled={isInformantPatient}
                  className="h-11 text-sm font-medium disabled:opacity-75 disabled:bg-muted/40 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">Informant Middle Name</Label>
                <Input
                  placeholder="e.g. Dela Cruz"
                  value={informantMiddleName}
                  onChange={(e) => setInformantMiddleName(e.target.value)}
                  disabled={isInformantPatient}
                  className="h-11 text-sm font-medium disabled:opacity-75 disabled:bg-muted/40 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Relationship to Patient & Contact Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">Relationship to Patient</Label>
                <Select
                  value={informantRelationship}
                  onValueChange={(val) => {
                    setInformantRelationship(val ?? "")
                    if (val !== "Other") {
                      setCustomRelationship("")
                    }
                  }}
                  disabled={isInformantPatient}
                >
                  <SelectTrigger className="h-11 text-sm font-medium disabled:opacity-75 disabled:bg-muted/40 disabled:cursor-not-allowed">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {INFORMANT_RELATIONSHIP_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">Informant Contact Number</Label>
                <Input
                  placeholder="e.g. 0917-123-4567"
                  value={informantContact}
                  onChange={(e) => setInformantContact(e.target.value)}
                  disabled={isInformantPatient}
                  className="h-11 text-sm font-medium disabled:opacity-75 disabled:bg-muted/40 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Specify Relationship if "Other" is selected */}
            {informantRelationship === "Other" && (
              <div className="space-y-1.5 animate-in fade-in-50 duration-200">
                <Label className="text-xs font-bold uppercase tracking-wider text-primary">
                  Specify Relationship <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g. Landlord, Neighbor, Social Worker, Co-worker"
                  value={customRelationship}
                  onChange={(e) => setCustomRelationship(e.target.value)}
                  disabled={isInformantPatient}
                  className="h-11 text-sm font-medium"
                  autoFocus
                />
              </div>
            )}

            {/* Informant Address */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider">Informant Address</Label>
              <Input
                placeholder="e.g. House No., Street, Barangay, City/Municipality"
                value={informantAddress}
                onChange={(e) => setInformantAddress(e.target.value)}
                disabled={isInformantPatient}
                className="h-11 text-sm font-medium disabled:opacity-75 disabled:bg-muted/40 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Section 2: Socio-Economic Profile & Living Conditions */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div className="flex items-center gap-2">
                <Home className="size-5 text-primary" />
                <h4 className="text-base sm:text-lg font-bold text-foreground">
                  2. Socio-Economic Profile &amp; Living Conditions
                </h4>
              </div>

              {/* Auto-Compute Total Monthly Income Badge */}
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-xl">
                <Calculator className="size-4 text-primary" />
                <div className="text-xs font-semibold text-muted-foreground">Total Income:</div>
                <div className="text-sm font-extrabold font-mono text-primary">
                  ₱{calculatedTotalFamilyIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Income Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Primary / Patient Monthly Income (₱)</span>
                  <Coins className="size-3.5 text-muted-foreground" />
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={primaryIncome}
                  onChange={(e) => setPrimaryIncome(e.target.value)}
                  className="h-11 text-base font-bold font-mono"
                />
              </div>

              {/* Readonly Summary for Total Family Income */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Auto-Computed Total Monthly Income (₱)</span>
                  <CheckCircle2 className="size-3.5 text-primary" />
                </Label>
                <div className="h-11 rounded-lg border border-primary/30 bg-primary/5 px-3.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-semibold">Base + Other Sources</span>
                  <span className="text-base font-extrabold font-mono text-primary">
                    ₱{calculatedTotalFamilyIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Other Income Sources Repeater */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Other Sources of Family Income (UIS §II: Remittances, 4Ps, Pension, Side Business)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOtherIncome}
                  className="h-8 text-xs font-bold gap-1 cursor-pointer"
                >
                  <Plus className="size-3.5" /> Add Income Source
                </Button>
              </div>

              {otherIncomeSources.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-1">
                  No other income sources added. Click &quot;Add Income Source&quot; to include 4Ps grants, remittances, or pensions.
                </p>
              ) : (
                <div className="space-y-2">
                  {otherIncomeSources.map((income, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        placeholder="Income Source (e.g. 4Ps Cash Grant / SSS Pension / Remittance)"
                        value={income.source}
                        onChange={(e) => handleOtherIncomeChange(idx, "source", e.target.value)}
                        className="h-10 text-xs font-medium flex-1"
                      />
                      <Input
                        type="number"
                        min="0"
                        placeholder="Amount (₱)"
                        value={income.amount !== null && income.amount !== undefined ? income.amount : ""}
                        onChange={(e) => handleOtherIncomeChange(idx, "amount", e.target.value)}
                        className="h-10 text-xs font-mono font-bold w-36 text-right"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOtherIncome(idx)}
                        className="h-10 px-2.5 text-destructive hover:bg-destructive/10 cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Living Conditions: House Tenure, Light Source, Water Source with Amounts */}
            <div className="space-y-4 pt-3 border-t border-border/40">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Living Conditions &amp; Utility Expenses
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* House Tenure */}
                <div className="space-y-1.5 p-3 rounded-xl border bg-muted/10">
                  <Label className="text-xs font-bold uppercase tracking-wider">House Tenure</Label>
                  <Select value={houseTenure} onValueChange={(val) => setHouseTenure(val ?? "")}>
                    <SelectTrigger className="h-10 text-xs font-semibold">
                      <SelectValue placeholder="Select Tenure" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOUSE_TENURE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs py-2">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="pt-1.5 space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      {houseTenure === "rented" ? "Monthly Rent Amount (₱)" : "Housing / Mortgage (₱)"}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={houseTenureAmount}
                      onChange={(e) => setHouseTenureAmount(e.target.value)}
                      className="h-9 text-xs font-mono font-bold text-right"
                    />
                  </div>
                </div>

                {/* Light Source */}
                <div className="space-y-1.5 p-3 rounded-xl border bg-muted/10">
                  <Label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <Lightbulb className="size-3.5 text-amber-500" />
                    Light / Power Source
                  </Label>
                  <Select value={lightSource} onValueChange={(val) => setLightSource(val ?? "")}>
                    <SelectTrigger className="h-10 text-xs font-semibold">
                      <SelectValue placeholder="Select Light Source" />
                    </SelectTrigger>
                    <SelectContent>
                      {LIGHT_SOURCE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs py-2">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="pt-1.5 space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Monthly Light Bill / Amount (₱)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={lightSourceAmount}
                      onChange={(e) => setLightSourceAmount(e.target.value)}
                      className="h-9 text-xs font-mono font-bold text-right"
                    />
                  </div>
                </div>

                {/* Water Source */}
                <div className="space-y-1.5 p-3 rounded-xl border bg-muted/10">
                  <Label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <Zap className="size-3.5 text-blue-500" />
                    Water Source
                  </Label>
                  <Select value={waterSource} onValueChange={(val) => setWaterSource(val ?? "")}>
                    <SelectTrigger className="h-10 text-xs font-semibold">
                      <SelectValue placeholder="Select Water Source" />
                    </SelectTrigger>
                    <SelectContent>
                      {WATER_SOURCE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs py-2">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="pt-1.5 space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Monthly Water Bill / Amount (₱)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={waterSourceAmount}
                      onChange={(e) => setWaterSourceAmount(e.target.value)}
                      className="h-9 text-xs font-mono font-bold text-right"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Monthly Household Expenses Editor */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2">
              <div className="flex items-center gap-2">
                <Receipt className="size-5 text-primary" />
                <h4 className="text-base sm:text-lg font-bold text-foreground">
                  3. Monthly Household Expenses
                </h4>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs font-bold text-muted-foreground">
                  Total Monthly Expenses:{" "}
                  <span className="font-mono text-sm font-extrabold text-primary">
                    ₱{calculatedTotalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {!isEditMode && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddStagedExpense}
                    className="h-8 text-xs font-bold gap-1 cursor-pointer"
                  >
                    <Plus className="size-3.5" /> Add Expense
                  </Button>
                )}
              </div>
            </div>

            {/* Auto-synced housing and utilities summary indicator */}
            {housingAndUtilitiesTotal > 0 && (
              <div className="p-3 rounded-xl bg-muted/20 border text-xs flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-muted-foreground">
                  Auto-synced Housing &amp; Utilities from Section 2:
                </span>
                <div className="flex items-center gap-3 font-mono font-bold text-foreground">
                  {Number(houseTenureAmount) > 0 && (
                    <span>House: ₱{Number(houseTenureAmount).toLocaleString()}</span>
                  )}
                  {Number(lightSourceAmount) > 0 && (
                    <span>Light: ₱{Number(lightSourceAmount).toLocaleString()}</span>
                  )}
                  {Number(waterSourceAmount) > 0 && (
                    <span>Water: ₱{Number(waterSourceAmount).toLocaleString()}</span>
                  )}
                  <span className="text-primary">
                    Subtotal: ₱{housingAndUtilitiesTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {isEditMode ? (
              <div className="space-y-3">
                {/* Live Expense Table */}
                <div className="overflow-x-auto border rounded-xl">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 text-xs">
                        <TableHead className="font-bold">Expense Item</TableHead>
                        <TableHead className="font-bold text-right">Monthly Amount (₱)</TableHead>
                        <TableHead className="w-16 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serverExpenses.map((exp) => (
                        <TableRow key={exp.id} className="text-xs">
                          <TableCell className="font-medium text-foreground">{exp.expenseType}</TableCell>
                          <TableCell className="font-mono font-bold text-right text-primary">
                            ₱{Number(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLiveExpense(exp.id)}
                              className="size-8 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {serverExpenses.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-xs text-muted-foreground">
                            No additional expense items recorded for this assessment.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Inline Add Live Expense with Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1 items-center">
                  <div className={newExpenseCategory === "Others" ? "sm:col-span-4" : "sm:col-span-6"}>
                    <Select value={newExpenseCategory} onValueChange={(val) => setNewExpenseCategory(val ?? "")}>
                      <SelectTrigger className="h-10 text-xs font-semibold">
                        <SelectValue placeholder="Select Expense Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs py-2">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {newExpenseCategory === "Others" && (
                    <div className="sm:col-span-3">
                      <Input
                        placeholder="Please specify..."
                        value={newExpenseSpecify}
                        onChange={(e) => setNewExpenseSpecify(e.target.value)}
                        className="h-10 text-xs font-medium"
                      />
                    </div>
                  )}

                  <div className={newExpenseCategory === "Others" ? "sm:col-span-3" : "sm:col-span-4"}>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Amount (₱)"
                      value={newExpenseAmount}
                      onChange={(e) => setNewExpenseAmount(e.target.value)}
                      className="h-10 text-xs font-mono font-bold text-right"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateLiveExpense}
                      disabled={!newExpenseCategory || !newExpenseAmount}
                      className="h-10 w-full text-xs font-bold gap-1 cursor-pointer"
                    >
                      <Plus className="size-4" /> Save
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {stagedExpenses.map((exp, idx) => (
                  <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                    <div className="w-full sm:w-48">
                      <Select
                        value={exp.expense_type}
                        onValueChange={(val) => handleStagedExpenseChange(idx, "expense_type", val ?? "")}
                      >
                        <SelectTrigger className="h-10 text-xs font-semibold">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPENSE_CATEGORY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs py-2">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {exp.expense_type === "Others" && (
                      <Input
                        placeholder="Specify details..."
                        value={exp.specify || ""}
                        onChange={(e) => handleStagedExpenseChange(idx, "specify", e.target.value)}
                        className="h-10 text-xs font-medium flex-1 min-w-[140px]"
                      />
                    )}

                    <Input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={exp.amount || ""}
                      onChange={(e) => handleStagedExpenseChange(idx, "amount", e.target.value)}
                      className="h-10 text-xs font-mono font-bold w-36 text-right"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStagedExpense(idx)}
                      className="h-10 px-2.5 text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Presenting Problem & Medical Needs */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
              <Stethoscope className="size-5 text-primary" />
              <h4 className="text-base sm:text-lg font-bold text-foreground">
                4. Presenting Problem &amp; Medical History
              </h4>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider">Presenting Problem</Label>
              <Textarea
                placeholder="State the primary medical, financial, or psychosocial difficulties presented by the client..."
                value={presentingProblem}
                onChange={(e) => setPresentingProblem(e.target.value)}
                rows={2}
                className="text-sm font-medium resize-y"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Problem Categories</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PROBLEM_CATEGORY_OPTIONS.map((cat) => {
                  const checked = problemCategories.includes(cat.value)
                  return (
                    <label
                      key={cat.value}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs sm:text-sm font-semibold cursor-pointer select-none transition-all ${
                        checked
                          ? "bg-primary/10 border-primary text-primary shadow-2xs"
                          : "bg-muted/20 border-border/60 text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <Checkbox checked={checked} onCheckedChange={() => toggleCategory(cat.value)} />
                      <span>{cat.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">Specify Problem Details</Label>
                <Input
                  placeholder="e.g. Inability to purchase required orthopedic implants"
                  value={problemSpecify}
                  onChange={(e) => setProblemSpecify(e.target.value)}
                  className="h-11 text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">Medical History / Diagnosis Summary</Label>
                <Input
                  placeholder="e.g. Hypertension, CKD Stage 5 on HD"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  className="h-11 text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Recommendations & Classification */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
              <HeartHandshake className="size-5 text-primary" />
              <h4 className="text-base sm:text-lg font-bold text-foreground">
                5. Recommendation &amp; MSWD Classification
              </h4>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider">Social Worker Recommendation</Label>
              <Textarea
                placeholder="Specific recommendations, assistance modes, or counseling plan..."
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                rows={2}
                className="text-sm font-medium resize-y"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">Mode of Assistance</Label>
                <Select value={recommendationMode} onValueChange={(val) => setRecommendationMode(val ?? "")}>
                  <SelectTrigger className="h-11 text-sm font-medium">
                    <SelectValue placeholder="Select Recommendation Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECOMMENDATION_MODE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-sm py-2">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">Fund Source</Label>
                <Select value={fundSource} onValueChange={(val) => setFundSource(val ?? "")}>
                  <SelectTrigger className="h-11 text-sm font-medium">
                    <SelectValue placeholder="Select Fund Source" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUND_SOURCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-sm py-2">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Classification Override Toggle */}
            <div className="rounded-xl border border-border/60 p-4 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-foreground">Manual Classification Override</Label>
                  <p className="text-xs text-muted-foreground">
                    By default, the server calculates classification from per-capita net income. Enable this to manually set a specific tier.
                  </p>
                </div>
                <Switch checked={hasOverride} onCheckedChange={setHasOverride} />
              </div>

              {hasOverride && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider">Selected Tier</Label>
                    <Select value={classificationOverride} onValueChange={(val) => setClassificationOverride(val ?? "")}>
                      <SelectTrigger className="h-11 text-sm font-bold">
                        <SelectValue placeholder="Select MSWD Tier" />
                      </SelectTrigger>
                      <SelectContent>
                        {MSWD_CLASSIFICATION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-sm font-bold py-2">
                            {opt.label}
                          </SelectItem>
                        ))}
                        {LEGACY_CLASSIFICATION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-sm font-semibold py-2">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider">Override Justification *</Label>
                    <Input
                      placeholder="Mandatory justification for manual classification override"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="h-11 text-sm font-medium"
                      required={hasOverride}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 pt-4 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="font-bold text-sm h-11 px-5 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="font-extrabold text-sm h-11 px-8 gap-2 shadow-sm cursor-pointer"
            >
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              {isEditMode ? "Update Assessment" : "Save Assessment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
