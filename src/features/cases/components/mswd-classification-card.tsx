import React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Assessment, MswdClassificationCode } from "../types/assessment.types"
import { AlertTriangle, Calculator, DollarSign, Info, ShieldAlert, Users } from "lucide-react"


interface MswdClassificationCardProps {
  assessment: Assessment
  className?: string
}

export const getBracketColor = (code: MswdClassificationCode | string) => {
  switch (code) {
    case "A":
      return "bg-slate-700 hover:bg-slate-800 text-white border-slate-600"
    case "B":
      return "bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
    case "C1":
      return "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500"
    case "C2":
      return "bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
    case "C3":
      return "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500"
    case "D":
      return "bg-teal-600 hover:bg-teal-700 text-white border-teal-500"
    default:
      return "bg-slate-600 text-white"
  }
}

export const getBracketLabel = (code: MswdClassificationCode | string) => {
  switch (code) {
    case "A":
      return "Class A — Full Pay"
    case "B":
      return "Class B — Partial Pay (25% Discount)"
    case "C1":
      return "Class C1 — Partial Pay (50% Discount)"
    case "C2":
      return "Class C2 — Partial Pay (75% Discount)"
    case "C3":
      return "Class C3 — Financially Indigent (100% Discount)"
    case "D":
      return "Class D — Financially Indigent / Support (100% Discount)"
    default:
      return `Class ${code}`
  }
}

export const formatCurrency = (val: number | null | undefined) => {
  if (val === null || val === undefined) return "₱0.00"
  return `₱${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const MswdClassificationCard: React.FC<MswdClassificationCardProps> = ({
  assessment,
  className = "",
}) => {
  const {
    classification,
    calculatedClassification,
    hasOverride,
    classificationOverrideReason,
    netPerCapitaIncome,
    totalFamilyIncome,
    expensesTotal,
    householdSize,
    calculatedDiscountRate,
    reassessmentReason,
  } = assessment

  return (
    <Card className={`border border-border/80 shadow-xs overflow-hidden ${className}`}>
      <CardHeader className="bg-muted/40 border-b border-border/60 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Badge
              className={`text-base font-black px-3.5 py-1 tracking-wider uppercase shadow-xs ${getBracketColor(
                classification
              )}`}
            >
              Class {classification}
            </Badge>
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                {getBracketLabel(classification)}
              </CardTitle>
              {reassessmentReason && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reason: <span className="font-semibold text-foreground">{reassessmentReason}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {calculatedDiscountRate !== null && calculatedDiscountRate !== undefined && (
              <Badge variant="outline" className="text-xs font-extrabold border-primary/40 bg-primary/10 text-primary">
                {calculatedDiscountRate}% Discount Rate
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Manual Override Warning Banner */}
        {hasOverride && (
          <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="font-extrabold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Manual Classification Override Active
            </AlertTitle>
            <AlertDescription className="text-xs mt-1 leading-relaxed">
              Calculated bracket by net per capita income was{" "}
              <strong className="font-bold underline">Class {calculatedClassification || "N/A"}</strong>, but social worker manually overrode classification to{" "}
              <strong className="font-bold underline">Class {classification}</strong>.
              {classificationOverrideReason && (
                <div className="mt-1 pt-1 border-t border-amber-500/20 text-xs italic">
                  Justification: "{classificationOverrideReason}"
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Income & Per Capita Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-card border border-border/70 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-primary" />
              Net Per Capita Income
            </span>
            <p className="text-base font-extrabold font-mono text-primary">
              {netPerCapitaIncome !== null ? `${formatCurrency(netPerCapitaIncome)}` : "N/A"}
              <span className="text-[10px] text-muted-foreground font-sans font-normal ml-1">/mo</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/70 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Total Monthly Income
            </span>
            <p className="text-base font-extrabold font-mono text-foreground">
              {formatCurrency(totalFamilyIncome)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/70 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Total Monthly Expenses
            </span>
            <p className="text-base font-extrabold font-mono text-foreground">
              {formatCurrency(expensesTotal)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/70 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              Household Size
            </span>
            <p className="text-base font-extrabold font-mono text-foreground">
              {householdSize} <span className="text-[10px] text-muted-foreground font-sans font-normal">member(s)</span>
            </p>
          </div>
        </div>

        {/* Calculation Formula Footer */}
        <div className="text-[11px] text-muted-foreground bg-muted/30 rounded-lg p-2.5 flex items-center gap-2 border border-border/40 font-mono">
          <Info className="w-4 h-4 shrink-0 text-muted-foreground" />
          <span>
            Net Per Capita = (Total Household Income ({formatCurrency(totalFamilyIncome)}) - Total Expenses ({formatCurrency(expensesTotal)})) / Household Size ({householdSize})
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
