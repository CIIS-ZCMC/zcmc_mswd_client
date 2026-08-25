import React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import type { PatientRecord } from "../../types"

interface IdTabProps {
  patient: PatientRecord
}

export const IdTab: React.FC<IdTabProps> = ({ patient }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-bold">
          Government &amp; Health Identification Credentials
        </CardTitle>
        <CardDescription className="text-xs">
          Verified IDs and indigency documents on file.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-card shadow-2xs">
          <div className="space-y-1">
            <p className="font-bold text-foreground">PhilHealth Membership</p>
            <p className="font-mono text-xs text-muted-foreground font-semibold">
              {patient.philHealthNo}
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-emerald-600 border-emerald-500 gap-1.5 px-3 py-1 text-xs"
          >
            <CheckCircle2 className="size-4" /> Verified
          </Badge>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-card shadow-2xs">
          <div className="space-y-1">
            <p className="font-bold text-foreground">Barangay Indigency Certificate</p>
            <p className="text-xs text-muted-foreground">
              Issued by Barangay {patient.barangay}
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-emerald-600 border-emerald-500 gap-1.5 px-3 py-1 text-xs"
          >
            <CheckCircle2 className="size-4" /> Valid
          </Badge>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-card shadow-2xs">
          <div className="space-y-1">
            <p className="font-bold text-foreground">Senior Citizen ID</p>
            <p className="font-mono text-xs text-muted-foreground font-semibold">
              {patient.seniorCitizenId || "Not Applicable"}
            </p>
          </div>
          <Badge
            variant={patient.seniorCitizenId ? "default" : "secondary"}
            className="px-3 py-1 text-xs"
          >
            {patient.seniorCitizenId ? "Active" : "N/A"}
          </Badge>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-card shadow-2xs">
          <div className="space-y-1">
            <p className="font-bold text-foreground">PWD Identification Card</p>
            <p className="font-mono text-xs text-muted-foreground font-semibold">
              {patient.pwdId || "Not Applicable"}
            </p>
          </div>
          <Badge
            variant={patient.pwdId ? "default" : "secondary"}
            className="px-3 py-1 text-xs"
          >
            {patient.pwdId ? "Active" : "N/A"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
