import React from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MswdClassificationCard } from "@/features/cases/components/mswd-classification-card"
import { formatCurrency } from "@/features/cases/lib/classification"
import {
  FUND_SOURCE_OPTIONS,
  HOUSE_TENURE_OPTIONS,
  LIGHT_SOURCE_OPTIONS,
  PROBLEM_CATEGORY_OPTIONS,
  RECOMMENDATION_MODE_OPTIONS,
  WATER_SOURCE_OPTIONS,
  labelFor,
} from "@/features/cases/lib/assessment-constants"
import type { PatientUisRow } from "@/features/cases/types/uis.types"
import type { PatientRecord } from "../types"

interface UisSheetViewProps {
  row: PatientUisRow
  patient: PatientRecord
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-2.5">
    <h3 className="text-sm font-extrabold uppercase tracking-wider text-primary">{title}</h3>
    {children}
  </section>
)

const Field: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="space-y-0.5">
    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="text-sm font-medium text-foreground">
      {value === null || value === undefined || value === "" ? "—" : value}
    </p>
  </div>
)

/**
 * Read-only ANNEX B layout (sections I–V) of a case's intake assessment, as the
 * server prints it. The figures come from the server (classification,
 * net per-capita income); nothing is recomputed here.
 */
export const UisSheetView: React.FC<UisSheetViewProps> = ({ row, patient }) => {
  const a = row.assessment

  if (!a) {
    return (
      <p className="text-sm text-muted-foreground">
        {row.hasSocialCase
          ? "This case's assessment was promoted to its Social Case Study Report, so there is no intake assessment to show as a UIS."
          : "This case has no intake assessment yet."}
      </p>
    )
  }

  const informantName = a.informantName || "—"
  const otherIncomeTotal = a.otherIncomeSources.reduce((sum, i) => sum + (i.amount ?? 0), 0)
  const patientAddress =
    patient.address || [patient.barangay, patient.city].filter(Boolean).join(", ")

  return (
    <div className="space-y-6">
      <Section title="Informant">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Name of informant" value={informantName} />
          <Field label="Relation to patient" value={a.informantRelationship} />
          <Field label="Address" value={a.informantAddress || patientAddress} />
          <Field label="Contact number" value={a.informantContact || patient.contactNo} />
        </div>
        {!a.informantAddress && !a.informantContact && (
          <p className="text-xs text-muted-foreground">
            No informant address or contact recorded — the printed sheet uses the patient&apos;s.
          </p>
        )}
      </Section>

      <Separator />

      <Section title="I. Identifying information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Client's name" value={patient.fullName} />
          <Field label="Referral source" value={a.referralSource} />
        </div>
      </Section>

      <Separator />

      <Section title="II. Family composition">
        {patient.familyMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No family members on file.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Relation</th>
                  <th className="px-3 py-2">Civil status</th>
                  <th className="px-3 py-2">Age</th>
                  <th className="px-3 py-2">Occupation</th>
                  <th className="px-3 py-2 text-right">Monthly income</th>
                </tr>
              </thead>
              <tbody>
                {patient.familyMembers.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="px-3 py-2 font-medium">{m.fullName}</td>
                    <td className="px-3 py-2">{m.relationship}</td>
                    <td className="px-3 py-2">{m.civilStatus || "—"}</td>
                    <td className="px-3 py-2">{m.age || "—"}</td>
                    <td className="px-3 py-2">{m.occupation || "—"}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatCurrency(m.monthlyIncome)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="Other sources of family income"
            value={
              a.otherIncomeSources.length === 0
                ? "None recorded"
                : a.otherIncomeSources
                    .map((i) => `${i.source}${i.amount ? ` (${formatCurrency(i.amount)})` : ""}`)
                    .join(", ")
            }
          />
          <Field
            label="Total family income"
            value={
              a.totalFamilyIncome === null
                ? null
                : `${formatCurrency(a.totalFamilyIncome)}${otherIncomeTotal ? ` (incl. ${formatCurrency(otherIncomeTotal)} other)` : ""}`
            }
          />
        </div>
      </Section>

      <Separator />

      <Section title="III. List of expenses">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="House / lot" value={labelFor(HOUSE_TENURE_OPTIONS, a.houseTenure)} />
          <Field
            label="Light source"
            value={a.lightSource.map((v) => labelFor(LIGHT_SOURCE_OPTIONS, v)).join(", ")}
          />
          <Field
            label="Water source"
            value={a.waterSource.map((v) => labelFor(WATER_SOURCE_OPTIONS, v)).join(", ")}
          />
        </div>
        {a.expenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No expense lines recorded.</p>
        ) : (
          <div className="rounded-lg border divide-y">
            {a.expenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="font-medium">{e.expenseType}</span>
                <span className="font-mono">{formatCurrency(e.amount)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-3 py-2 text-sm font-bold bg-muted/40">
              <span>Total monthly expenses</span>
              <span className="font-mono">{formatCurrency(a.expensesTotal)}</span>
            </div>
          </div>
        )}
      </Section>

      <Separator />

      <Section title="IV. Problem presented">
        <div className="flex flex-wrap gap-1.5">
          {a.problemCategories.length === 0 ? (
            <span className="text-sm text-muted-foreground">No category selected.</span>
          ) : (
            a.problemCategories.map((c) => (
              <Badge key={c} variant="secondary" className="font-semibold">
                {labelFor(PROBLEM_CATEGORY_OPTIONS, c)}
              </Badge>
            ))
          )}
        </div>
        <Field label="Presenting problem" value={a.presentingProblem} />
        <Field label="Specify" value={a.problemSpecify} />
        <Field label="Medical history / diagnosis" value={a.medicalHistory} />
      </Section>

      <Separator />

      <Section title="V. Recommendation">
        <Field label="Recommendation" value={a.recommendation} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="Mode of assistance"
            value={labelFor(RECOMMENDATION_MODE_OPTIONS, a.recommendationMode)}
          />
          <Field label="Fund source" value={labelFor(FUND_SOURCE_OPTIONS, a.fundSource)} />
        </div>
      </Section>

      <Separator />

      <Section title="MSWD classification">
        <MswdClassificationCard assessment={a} />
      </Section>
    </div>
  )
}
