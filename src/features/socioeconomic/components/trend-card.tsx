import React, { useState } from "react"
import { format, parseISO } from "date-fns"
import { ArrowDownRight, ArrowUpRight, Minus, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/format-currency"
import { HOUSE_TENURE_OPTIONS, labelFor } from "@/lib/socioeconomic-constants"
import { HistoryDetailSheet } from "./history-detail-sheet"
import type { SocioeconomicHistoryItem } from "../types/socioeconomic.types"

interface TrendCardProps {
  history: SocioeconomicHistoryItem[]
}

export const TrendCard: React.FC<TrendCardProps> = ({ history }) => {
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null)

  if (!history || history.length === 0) {
    return null
  }

  // Calculate change in total expenses vs previous record (index + 1)
  const getExpensesChangeIndicator = (index: number) => {
    if (index >= history.length - 1) return null
    const current = history[index].total
    const previous = history[index + 1].total
    if (current === null || previous === null || current === undefined || previous === undefined) return null

    const diff = current - previous
    if (diff > 0) {
      return (
        <span className="inline-flex items-center text-[10px] text-rose-600 font-semibold ml-1">
          <ArrowUpRight className="size-3" />
          +{formatCurrency(diff)}
        </span>
      )
    }
    if (diff < 0) {
      return (
        <span className="inline-flex items-center text-[10px] text-emerald-600 font-semibold ml-1">
          <ArrowDownRight className="size-3" />
          {formatCurrency(diff)}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center text-[10px] text-muted-foreground ml-1">
        <Minus className="size-3" />
        0
      </span>
    )
  }

  return (
    <>
      <Card className="shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-indigo-600 dark:text-indigo-400" />
              <CardTitle className="text-sm font-semibold">Expense & Income History</CardTitle>
            </div>
            <span className="text-xs text-muted-foreground font-normal">
              {history.length} {history.length === 1 ? "record" : "records"} on file
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs h-9">Date Recorded</TableHead>
                  <TableHead className="text-xs h-9">House / Lot</TableHead>
                  <TableHead className="text-xs h-9 text-right">Family Income</TableHead>
                  <TableHead className="text-xs h-9 text-right">Total Expenses</TableHead>
                  <TableHead className="text-xs h-9 text-right">Net Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item, index) => {
                  const formattedDate = item.recordedOn
                    ? (() => {
                        try {
                          return format(parseISO(item.recordedOn), "MMM d, yyyy")
                        } catch {
                          return item.recordedOn
                        }
                      })()
                    : "—"

                  return (
                    <TableRow
                      key={item.id}
                      onClick={() => setSelectedProfileId(item.id)}
                      className="text-xs cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="py-2.5 font-semibold text-primary underline-offset-4 hover:underline">
                        {formattedDate}
                        {index === 0 && (
                          <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                            Current
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-2.5 text-muted-foreground">
                        {labelFor(HOUSE_TENURE_OPTIONS, item.houseTenure) || "—"}
                      </TableCell>
                      <TableCell className="py-2.5 text-right font-medium">
                        {formatCurrency(item.totalFamilyIncome)}
                      </TableCell>
                      <TableCell className="py-2.5 text-right font-medium">
                        <div>
                          <span>{formatCurrency(item.total)}</span>
                          {getExpensesChangeIndicator(index)}
                        </div>
                      </TableCell>
                      <TableCell className={`py-2.5 text-right font-semibold ${
                        item.balance !== null && item.balance < 0 ? "text-rose-600" : "text-foreground"
                      }`}>
                        {formatCurrency(item.balance)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <HistoryDetailSheet
        profileId={selectedProfileId}
        isOpen={selectedProfileId !== null}
        onClose={() => setSelectedProfileId(null)}
      />
    </>
  )
}
