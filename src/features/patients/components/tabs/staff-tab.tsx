import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Edit, UserCheck } from "lucide-react"
import type { PatientRecord } from "../../types"

interface StaffTabProps {
  patient: PatientRecord
}

export const StaffTab: React.FC<StaffTabProps> = ({ patient }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold">
            Assigned Medical Social Workers &amp; Clinical Staff
          </CardTitle>
          <CardDescription className="text-xs">
            Personnel handling case evaluation and management.
          </CardDescription>
        </div>
        <Button size="default" variant="outline" className="gap-2 font-semibold h-10">
          <Edit className="size-4" /> Reassign Staff
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
        <div className="rounded-2xl border border-border p-5 space-y-3 bg-card shadow-2xs">
          <div className="flex items-center gap-2">
            <UserCheck className="size-5 text-primary" />
            <span className="font-bold text-base text-foreground">Lead Social Worker</span>
          </div>
          <p className="text-base font-bold text-foreground">
            {patient.assignedStaff.socialWorker}
          </p>
          <p className="font-mono text-muted-foreground text-xs font-semibold">
            License: {patient.assignedStaff.socialWorkerId}
          </p>
        </div>

        <div className="rounded-2xl border border-border p-5 space-y-3 bg-card shadow-2xs">
          <div className="flex items-center gap-2">
            <Briefcase className="size-5 text-primary" />
            <span className="font-bold text-base text-foreground">
              Attending Physician
            </span>
          </div>
          <p className="text-base font-bold text-foreground">
            {patient.assignedStaff.attendingPhysician}
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            Case Officer: {patient.assignedStaff.caseOfficer}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
