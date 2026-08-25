import React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { PatientRecord } from "../../types"

interface SocialCaseTabProps {
  patient: PatientRecord
}

export const SocialCaseTab: React.FC<SocialCaseTabProps> = ({ patient }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">
            Social Safety Net Case Study Report
          </CardTitle>
          <Badge variant="default" className="text-sm px-3 py-1 font-bold">
            {patient.caseStudy.category}
          </Badge>
        </div>
        <CardDescription className="text-xs font-mono font-semibold">
          Case Study No: {patient.caseStudy.caseNumber}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        <div>
          <span className="font-bold text-base text-foreground">
            Classification Details:
          </span>
          <p className="mt-1.5 text-muted-foreground leading-relaxed">
            {patient.caseStudy.classificationDetails}
          </p>
        </div>
        <div>
          <span className="font-bold text-base text-foreground">Presenting Problem:</span>
          <p className="mt-1.5 text-muted-foreground leading-relaxed">
            {patient.caseStudy.presentingProblem}
          </p>
        </div>
        <div>
          <span className="font-bold text-base text-foreground">
            Social Worker Evaluation Notes:
          </span>
          <p className="mt-2 rounded-xl bg-muted/40 p-4 text-foreground leading-relaxed border border-border/60">
            {patient.caseStudy.socialWorkerNotes}
          </p>
        </div>
        <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 flex items-center justify-between">
          <div>
            <span className="font-bold text-sm text-foreground">
              Recommended Financial Assistance:
            </span>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {patient.caseStudy.recommendedAssistance}
            </p>
          </div>
          <span className="font-mono text-xl font-extrabold text-primary">
            ₱{patient.caseStudy.approvedAmount?.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
