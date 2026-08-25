import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { History } from "lucide-react"
import type { PatientRecord } from "../../types"

interface HistoryTabProps {
  patient: PatientRecord
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ patient }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-bold">
          Audit History &amp; Activity Log
        </CardTitle>
        <CardDescription className="text-xs">
          Chronological log of intake and assessment actions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {patient.history.map((hist) => (
          <div
            key={hist.id}
            className="flex items-start gap-4 border-b border-border/50 pb-4 last:border-b-0"
          >
            <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
              <History className="size-4" />
            </div>
            <div className="flex-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-foreground">{hist.action}</span>
                <span className="font-mono text-xs text-muted-foreground font-semibold">
                  {hist.timestamp}
                </span>
              </div>
              <p className="text-muted-foreground mt-1 leading-relaxed">{hist.details}</p>
              <span className="text-xs font-semibold text-primary mt-1 inline-block">
                By: {hist.performedBy}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
