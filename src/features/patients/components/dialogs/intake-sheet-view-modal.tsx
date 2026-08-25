import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Heart,
  MapPin,
  Phone,
  Printer,
  UserCheck,
  Users,
} from "lucide-react"
import type { IntakeSheetRecord, PatientRecord } from "../../types"

interface IntakeSheetViewModalProps {
  intakeSheet: IntakeSheetRecord | null
  patient: PatientRecord
  isOpen: boolean
  onClose: () => void
}

export const IntakeSheetViewModal: React.FC<IntakeSheetViewModalProps> = ({
  intakeSheet,
  patient,
  isOpen,
  onClose,
}) => {
  if (!intakeSheet) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <ClipboardList className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-heading">
                Social Intake Assessment Sheet (Form MSWD-01)
              </DialogTitle>
              <DialogDescription className="text-xs">
                Control No: <strong className="font-mono text-primary">{intakeSheet.controlNo}</strong>
              </DialogDescription>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            className="gap-2 font-bold h-9 px-4 mr-6"
            onClick={() => window.print()}
          >
            <Printer className="size-4" />
            Print Form MSWD-01
          </Button>
        </DialogHeader>

        <div className="space-y-6 pt-4 text-sm">
          {/* Section 1: Intake Metadata */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <Calendar className="size-4 text-primary" /> 1. Intake Metadata &amp; Staff Assignment
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-xl border border-border/60 bg-muted/20 p-4 text-xs">
              <div>
                <span className="text-muted-foreground font-medium">Intake Date &amp; Time:</span>
                <p className="font-bold text-foreground mt-0.5">{intakeSheet.intakeDate} {intakeSheet.intakeTime}</p>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Intake Type:</span>
                <p className="font-bold text-primary mt-0.5">{intakeSheet.intakeType}</p>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Ward &amp; Bed:</span>
                <p className="font-bold text-foreground mt-0.5">{intakeSheet.ward} ({intakeSheet.bedNo})</p>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Assigned RSW:</span>
                <p className="font-bold text-foreground mt-0.5">{intakeSheet.socialWorker}</p>
                <p className="text-[11px] font-mono text-muted-foreground">{intakeSheet.socialWorkerId}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Patient & Informant Identification */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <UserCheck className="size-4 text-primary" /> 2. Patient &amp; Respondent Identification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/60 p-4 space-y-2.5 bg-card">
                <span className="font-bold text-foreground text-xs uppercase tracking-wide block border-b border-border/40 pb-1.5">
                  Patient Profile
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground font-medium">Full Name:</span>
                    <p className="font-bold text-sm text-foreground mt-0.5">{patient.fullName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">Age / Gender:</span>
                    <p className="font-semibold text-foreground mt-0.5">{patient.age} yrs / {patient.gender}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">Hospital No:</span>
                    <p className="font-mono font-semibold text-foreground mt-0.5">{patient.hospitalNo}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">MSWD No:</span>
                    <p className="font-mono font-semibold text-primary mt-0.5">{patient.mswdNo}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground font-medium">Address:</span>
                    <p className="font-medium text-foreground mt-0.5 flex items-center gap-1">
                      <MapPin className="size-3.5 text-primary" /> {patient.address}, {patient.city}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 p-4 space-y-2.5 bg-card">
                <span className="font-bold text-foreground text-xs uppercase tracking-wide block border-b border-border/40 pb-1.5">
                  Informant / Respondent
                </span>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-muted-foreground font-medium">Informant Name:</span>
                    <p className="font-bold text-sm text-foreground mt-0.5">{intakeSheet.informantName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">Relationship:</span>
                    <p className="font-semibold text-foreground mt-0.5">{intakeSheet.informantRelationship}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">Contact Number:</span>
                    <p className="font-semibold text-foreground mt-0.5 font-mono flex items-center gap-1">
                      <Phone className="size-3.5 text-primary" /> {intakeSheet.informantContact}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Socio-Economic Data */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <Users className="size-4 text-primary" /> 3. Household Socio-Economic Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3 text-xs">
              <div className="rounded-xl border border-border/60 p-3 bg-muted/20">
                <span className="text-muted-foreground font-medium">Household Size:</span>
                <p className="text-base font-extrabold text-foreground font-mono mt-0.5">
                  {intakeSheet.householdSize} Members
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-3 bg-muted/20">
                <span className="text-muted-foreground font-medium">Monthly Income:</span>
                <p className="text-base font-extrabold text-foreground font-mono mt-0.5">
                  ₱{intakeSheet.monthlyIncome.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-3 bg-muted/20">
                <span className="text-muted-foreground font-medium">Per Capita Income:</span>
                <p className="text-base font-extrabold text-primary font-mono mt-0.5">
                  ₱{intakeSheet.perCapitaIncome.toLocaleString()} / mo
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-3 bg-muted/20">
                <span className="text-muted-foreground font-medium">Housing Status:</span>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {intakeSheet.housingStatus}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 overflow-hidden">
              <Table className="text-xs">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="font-bold">Family Member</TableHead>
                    <TableHead className="font-bold">Relationship</TableHead>
                    <TableHead className="font-bold">Age</TableHead>
                    <TableHead className="font-bold">Occupation</TableHead>
                    <TableHead className="font-bold">Monthly Income</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.familyMembers.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-semibold text-foreground">{m.fullName}</TableCell>
                      <TableCell>{m.relationship}</TableCell>
                      <TableCell>{m.age} yrs</TableCell>
                      <TableCell>{m.occupation || "None"}</TableCell>
                      <TableCell className="font-mono font-semibold">₱{m.monthlyIncome.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Section 4: Clinical Need & Assistance Grant */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <Heart className="size-4 text-primary" /> 4. Clinical Diagnosis &amp; Recommended Grant
            </h3>
            <div className="rounded-xl border border-border/60 p-4 space-y-3 bg-card">
              <div>
                <span className="text-xs font-bold text-muted-foreground">Admitting Clinical Diagnosis:</span>
                <p className="text-xs font-semibold text-foreground mt-0.5">{intakeSheet.diagnosis}</p>
              </div>
              <div className="border-t border-border/40 pt-2">
                <span className="text-xs font-bold text-muted-foreground">Social Worker Notes &amp; Assessment:</span>
                <p className="text-xs text-foreground mt-1 rounded-lg bg-muted/30 p-3 leading-relaxed">
                  {intakeSheet.socialWorkerNotes}
                </p>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-primary/10 border border-primary/20 p-3 mt-2">
                <div>
                  <Badge variant="default" className="text-xs font-bold px-2.5 py-0.5 mb-1">
                    {intakeSheet.category}
                  </Badge>
                  <p className="text-xs font-bold text-foreground">{intakeSheet.recommendedAssistance}</p>
                </div>
                <span className="font-mono text-lg font-extrabold text-primary">
                  ₱{intakeSheet.approvedAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Section 5: Signature Block */}
          <div className="border-t border-border/60 pt-4">
            <div className="flex items-center justify-between bg-muted/20 rounded-xl p-4 border border-border/60">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="size-4" /> Status: {intakeSheet.status} &amp; Signed
              </div>
              <div className="text-right text-xs">
                <p className="font-bold text-foreground">{intakeSheet.socialWorker}</p>
                <p className="text-muted-foreground font-mono text-[11px]">License: {intakeSheet.socialWorkerId}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
