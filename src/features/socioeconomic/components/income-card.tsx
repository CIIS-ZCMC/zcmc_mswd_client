import React from "react"
import { AlertCircle, DollarSign, PiggyBank, Users, Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/format-currency"
import type { ProfileIncome } from "../types/socioeconomic.types"

interface IncomeCardProps {
  income: ProfileIncome
  onUpdate?: () => void
}

export const IncomeCard: React.FC<IncomeCardProps> = ({ income, onUpdate }) => {
  const ratio = income.expenseToIncomeRatio
  const ratioPercent = ratio !== null && ratio !== undefined ? Math.round(ratio * 100) : null

  const getRatioBadgeColor = (pct: number) => {
    if (pct <= 50) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
    if (pct <= 80) return "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
    if (pct <= 100) return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
    return "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
  }

  const getRatioBarColor = (pct: number) => {
    if (pct <= 50) return "bg-emerald-500"
    if (pct <= 80) return "bg-blue-500"
    if (pct <= 100) return "bg-amber-500"
    return "bg-rose-500"
  }

  return (
    <Card className="shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiggyBank className="size-4 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-sm font-semibold">Family Income & Balance</CardTitle>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground mr-1.5 font-normal">Total Family Income:</span>
            <span className="text-sm font-bold text-foreground">
              {formatCurrency(income.totalFamilyIncome)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Income Changed Alert Banner */}
        {income.incomeChanged && (
          <div className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                Family member incomes have changed in patient records since this was assessed.
              </span>
            </div>
            {onUpdate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onUpdate}
                className="h-7 text-xs font-semibold bg-background hover:bg-muted border-amber-500/30 shrink-0 cursor-pointer"
              >
                Update Profile
              </Button>
            )}
          </div>
        )}

        {/* Financial Highlights: Balance & Total Income */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl border bg-card/60">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <DollarSign className="size-3.5" />
              <span>Total Monthly Family Income</span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {formatCurrency(income.totalFamilyIncome)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Patient + family members + other sources
            </p>
          </div>

          <div className="p-3.5 rounded-xl border bg-card/60">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Wallet className="size-3.5" />
              <span>Net Monthly Balance</span>
            </div>
            <div className={`text-lg font-bold ${
              income.balance !== null && income.balance < 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"
            }`}>
              {formatCurrency(income.balance)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Income minus total monthly expenses
            </p>
          </div>
        </div>

        {/* Ratio Progress Bar (if available) */}
        {ratioPercent !== null && (
          <div className="p-3 rounded-xl border bg-card/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">Expense-to-Income Ratio</span>
              <Badge variant="outline" className={`text-xs font-bold px-2 py-0.5 ${getRatioBadgeColor(ratioPercent)}`}>
                {ratioPercent}%
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getRatioBarColor(ratioPercent)}`}
                style={{ width: `${Math.min(ratioPercent, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Income Breakdown by Contributor */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Users className="size-3.5" />
            <span>Income Breakdown</span>
          </div>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs h-8">Contributor / Source</TableHead>
                  <TableHead className="text-xs h-8">Relationship</TableHead>
                  <TableHead className="text-xs h-8 text-right">Monthly Income</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Patient row */}
                <TableRow className="text-xs">
                  <TableCell className="py-2 font-semibold">Patient (Self)</TableCell>
                  <TableCell className="py-2 text-muted-foreground">Self</TableCell>
                  <TableCell className="py-2 text-right font-semibold">
                    {formatCurrency(income.patientIncome)}
                  </TableCell>
                </TableRow>

                {/* Family Members */}
                {income.familyMembers.map((fm, idx) => (
                  <TableRow key={idx} className="text-xs">
                    <TableCell className="py-2 font-medium">{fm.name}</TableCell>
                    <TableCell className="py-2 text-muted-foreground">{fm.relationship || "—"}</TableCell>
                    <TableCell className="py-2 text-right font-medium">
                      {formatCurrency(fm.monthlyIncome)}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Other Sources */}
                {income.otherSources.map((os, idx) => (
                  <TableRow key={`other-${idx}`} className="text-xs">
                    <TableCell className="py-2 font-medium">{os.source}</TableCell>
                    <TableCell className="py-2 text-muted-foreground">Other Source</TableCell>
                    <TableCell className="py-2 text-right font-medium">
                      {formatCurrency(os.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
