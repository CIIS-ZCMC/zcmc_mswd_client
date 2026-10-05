import React from "react"
import { Home, Lightbulb, Droplets, Receipt } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  HOUSE_TENURE_OPTIONS,
  LIGHT_SOURCE_OPTIONS,
  WATER_SOURCE_OPTIONS,
  labelFor,
} from "@/lib/socioeconomic-constants"
import {
  EXPENSE_ITEM_KEYS,
  EXPENSE_ITEM_LABELS,
} from "../lib/expense-item-labels"
import type {
  ExpenseItems,
  HouseLiving,
} from "../types/socioeconomic.types"

interface ExpensesCardProps {
  house: HouseLiving
  lightSource: string[]
  waterSource: string[]
  expenses: ExpenseItems
  total: number | null
}

export const ExpensesCard: React.FC<ExpensesCardProps> = ({
  house,
  lightSource,
  waterSource,
  expenses,
  total,
}) => {
  const isRented = house.tenure === "rented"

  return (
    <Card className="shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="size-4 text-violet-600 dark:text-violet-400" />
            <CardTitle className="text-sm font-semibold">List of Expenses</CardTitle>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground mr-1.5 font-normal">Total Expenses:</span>
            <span className="text-sm font-bold text-foreground">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Housing & Utilities Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* House / Lot */}
          <div className="p-3 rounded-lg border bg-card/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Home className="size-3.5" />
              <span>House / Lot</span>
            </div>
            <div className="text-xs font-semibold text-foreground">
              {labelFor(HOUSE_TENURE_OPTIONS, house.tenure) || "Not recorded"}
              {isRented && house.rentAmount !== null && (
                <span className="text-muted-foreground font-normal ml-1">
                  ({formatCurrency(house.rentAmount)}/mo)
                </span>
              )}
            </div>
          </div>

          {/* Light Source */}
          <div className="p-3 rounded-lg border bg-card/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Lightbulb className="size-3.5" />
              <span>Light Source</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {lightSource.length > 0 ? (
                lightSource.map((s) => (
                  <Badge key={s} variant="secondary" className="text-[11px] px-2 py-0">
                    {labelFor(LIGHT_SOURCE_OPTIONS, s) || s}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">None on file</span>
              )}
            </div>
          </div>

          {/* Water Source */}
          <div className="p-3 rounded-lg border bg-card/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Droplets className="size-3.5" />
              <span>Water Source</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {waterSource.length > 0 ? (
                waterSource.map((s) => (
                  <Badge key={s} variant="secondary" className="text-[11px] px-2 py-0">
                    {labelFor(WATER_SOURCE_OPTIONS, s) || s}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">None on file</span>
              )}
            </div>
          </div>
        </div>

        {/* Itemized Expenses Table */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-xs h-8">Expense Item</TableHead>
                <TableHead className="text-xs h-8 text-right">Monthly Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* If Rented, show House Rent row */}
              {isRented && house.rentAmount !== null && house.rentAmount > 0 && (
                <TableRow className="text-xs">
                  <TableCell className="py-2 font-medium">House / Lot Rent</TableCell>
                  <TableCell className="py-2 text-right font-medium">
                    {formatCurrency(house.rentAmount)}
                  </TableCell>
                </TableRow>
              )}

              {/* 8 Fixed Expense Items */}
              {EXPENSE_ITEM_KEYS.map((key) => {
                const amount = expenses[key]
                const label = EXPENSE_ITEM_LABELS[key]
                const isOthers = key === "others"
                const specifyText = isOthers ? expenses.othersSpecify : null

                return (
                  <TableRow key={key} className="text-xs">
                    <TableCell className="py-2 font-medium">
                      <span>{label}</span>
                      {isOthers && specifyText && (
                        <span className="text-muted-foreground font-normal ml-1.5">
                          ({specifyText})
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-2 text-right font-medium">
                      {amount !== null && amount !== undefined && amount > 0
                        ? formatCurrency(amount)
                        : <span className="text-muted-foreground font-normal">—</span>}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
