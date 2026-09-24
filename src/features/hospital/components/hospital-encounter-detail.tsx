import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import type { HospitalEncounter, HospitalLookup } from "../types/hospital-transaction.types"

const PLACEHOLDER = "—"

function lookupText(value: HospitalLookup | null): string {
  return value?.description ?? PLACEHOLDER
}

function text(value: string | null): string {
  return value && value.trim() !== "" ? value : PLACEHOLDER
}

function peso(amount: number | null): string {
  if (amount === null) return PLACEHOLDER
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount)
}

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="space-y-0.5">
    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="text-sm">{value}</div>
  </div>
)

interface HospitalEncounterDetailProps {
  encounter: HospitalEncounter
}

export const HospitalEncounterDetail: React.FC<HospitalEncounterDetailProps> = ({ encounter }) => {
  return (
    <div className="space-y-5 pt-1">
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Service type" value={lookupText(encounter.serviceType)} />
        <Field label="Admission case type" value={lookupText(encounter.admissionCaseType)} />
        <Field label="Admission result" value={lookupText(encounter.admissionResult)} />
        <Field label="Hospital plan" value={lookupText(encounter.hospitalPlan)} />
        <Field label="Discount" value={lookupText(encounter.discount)} />
        <Field label="PhilHealth membership" value={lookupText(encounter.membership)} />
        <Field label="Transaction type" value={lookupText(encounter.transactionType)} />
        <Field label="Patient category" value={text(encounter.patientCategory)} />
        <Field label="With PhilHealth" value={encounter.isWithPhic ? "Yes" : "No"} />
      </section>

      <Separator />

      <section className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Diagnosis (from HIS — reference)</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Final diagnosis" value={text(encounter.finalDiagnosis)} />
          <Field label="Final diagnosis code" value={text(encounter.finalDiagnosisCode)} />
          <Field label="Discharge diagnosis" value={text(encounter.dischargeDiagnosis)} />
          <Field label="Doctor's impression" value={text(encounter.impression)} />
        </div>
      </section>

      <Separator />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Discharge no." value={text(encounter.dischargeNumber)} />
        <Field label="Discharge date" value={text(encounter.dischargeDate)} />
        <Field label="May-go-home no." value={text(encounter.mayGoHomeNumber)} />
        <Field label="May-go-home date" value={text(encounter.mayGoHomeDatetime)} />
        <Field label="Hemodialysis" value={encounter.isHemodialysis ? "Yes" : "No"} />
        <Field label="Cancelled" value={encounter.isCancelled ? `Yes${encounter.cancelDate ? ` (${encounter.cancelDate})` : ""}` : "No"} />
      </section>

      <Separator />

      <section className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Guarantors {encounter.guarantors.length > 0 ? `· total ${peso(encounter.guarantorTotal)}` : ""}
        </div>
        {encounter.guarantors.length === 0 ? (
          <div className="text-sm text-muted-foreground">None on file for this encounter.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guarantor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Posted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {encounter.guarantors.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{text(g.name)}</TableCell>
                  <TableCell className="text-right">{peso(g.amount)}</TableCell>
                  <TableCell>{g.glPosted ? text(g.glPostDate) : "No"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  )
}
