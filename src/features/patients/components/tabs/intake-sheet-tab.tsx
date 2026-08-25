import React, { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  CheckCircle2,
  ClipboardList,
  Edit,
  Eye,
  FilterX,
  Plus,
  Search,
  UserCheck,
} from "lucide-react"
import { usePatientMutations } from "../../hooks/use-patient-mutations"
import type { IntakeSheetRecord, PatientRecord } from "../../types"
import { IntakeSheetViewModal } from "../dialogs/intake-sheet-view-modal"
import { IntakeSheetWizardModal } from "../dialogs/intake-sheet-wizard-modal"

interface IntakeSheetTabProps {
  patient: PatientRecord
  onUpdatePatient?: (updated: PatientRecord) => void
}

export const IntakeSheetTab: React.FC<IntakeSheetTabProps> = ({
  patient,
  onUpdatePatient = () => {},
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [selectedViewRecord, setSelectedViewRecord] = useState<IntakeSheetRecord | null>(null)
  const [selectedEditRecord, setSelectedEditRecord] = useState<IntakeSheetRecord | null>(null)
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  const { mutateWithAudit } = usePatientMutations(patient, onUpdatePatient)

  const intakeSheetsList = patient.intakeSheets || []

  const filteredSheets = useMemo(() => {
    return intakeSheetsList.filter((sheet) => {
      const matchesSearch =
        searchQuery === "" ||
        sheet.controlNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sheet.intakeType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sheet.socialWorker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sheet.ward.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus =
        statusFilter === "ALL" || sheet.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [intakeSheetsList, searchQuery, statusFilter])

  const handleCreateOrUpdateIntakeSheet = (
    data: Omit<IntakeSheetRecord, "id"> & { id?: string }
  ) => {
    if (data.id) {
      // Edit existing record
      mutateWithAudit(
        "Intake Sheet Updated",
        `Updated social intake record ${data.controlNo} (${data.intakeType})`,
        (prev) => ({
          ...prev,
          intakeSheets: (prev.intakeSheets || []).map((s) =>
            s.id === data.id ? ({ ...data, id: data.id } as IntakeSheetRecord) : s
          ),
        })
      )
    } else {
      // Create new record
      const newSheet: IntakeSheetRecord = {
        id: `is-${Date.now()}`,
        ...data,
      } as IntakeSheetRecord

      mutateWithAudit(
        "Intake Sheet Created",
        `Created new social intake record ${newSheet.controlNo} (${newSheet.intakeType})`,
        (prev) => ({
          ...prev,
          category: newSheet.category || prev.category,
          intakeSheets: [newSheet, ...(prev.intakeSheets || [])],
        })
      )
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Verified":
        return "outline"
      case "Pending Review":
        return "secondary"
      case "Archived":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Management Summary Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold font-heading text-xl shadow-xs">
            <ClipboardList className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
                Social Intake Assessment Sheets
              </h2>
              <Badge variant="secondary" className="font-mono text-xs px-2.5 py-0.5 font-bold">
                {intakeSheetsList.length} Record{intakeSheetsList.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Form MSWD-01 intake records &amp; assessment logs for {patient.fullName}.
            </p>
          </div>
        </div>

        <Button
          variant="default"
          size="default"
          className="gap-2 font-bold h-10 px-5"
          onClick={() => {
            setSelectedEditRecord(null)
            setIsWizardOpen(true)
          }}
        >
          <Plus className="size-4" />
          Create New Intake Sheet
        </Button>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <UserCheck className="size-5 text-primary" /> Intake Records Registry
            </CardTitle>
            <CardDescription className="text-xs">
              Chronological listing of verified &amp; archived MSWD intake evaluations.
            </CardDescription>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search control #, worker, ward..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border">
              {["ALL", "Verified", "Pending Review", "Archived"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {(searchQuery || statusFilter !== "ALL") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-2 text-xs"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("ALL")
                }}
              >
                <FilterX className="size-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table className="text-sm">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold">Control No.</TableHead>
                <TableHead className="font-bold">Intake Date &amp; Time</TableHead>
                <TableHead className="font-bold">Intake Type</TableHead>
                <TableHead className="font-bold">Ward / Bed</TableHead>
                <TableHead className="font-bold">Category</TableHead>
                <TableHead className="font-bold">Evaluating RSW</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSheets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <ClipboardList className="size-8 stroke-1 opacity-50" />
                      <p className="font-semibold text-sm">No intake sheet records found</p>
                      <p className="text-xs">Click &quot;Create New Intake Sheet&quot; to add a new record.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSheets.map((sheet) => (
                  <TableRow key={sheet.id} className="hover:bg-muted/20">
                    <TableCell className="font-mono font-bold text-primary">
                      {sheet.controlNo}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      <div className="flex flex-col">
                        <span>{sheet.intakeDate}</span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {sheet.intakeTime}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{sheet.intakeType}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {sheet.ward} ({sheet.bedNo})
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="text-xs font-bold px-2.5 py-0.5">
                        {sheet.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{sheet.socialWorker}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {sheet.socialWorkerId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(sheet.status)}
                        className="text-xs px-2.5 py-0.5 gap-1 text-emerald-600 border-emerald-500"
                      >
                        <CheckCircle2 className="size-3" /> {sheet.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs gap-1 font-semibold"
                          title="View / Print Document"
                          onClick={() => setSelectedViewRecord(sheet)}
                        >
                          <Eye className="size-3.5 text-primary" /> View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs gap-1 font-semibold"
                          title="Edit Intake Sheet"
                          onClick={() => {
                            setSelectedEditRecord(sheet)
                            setIsWizardOpen(true)
                          }}
                        >
                          <Edit className="size-3.5" /> Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Document Preview Modal */}
      <IntakeSheetViewModal
        intakeSheet={selectedViewRecord}
        patient={patient}
        isOpen={Boolean(selectedViewRecord)}
        onClose={() => setSelectedViewRecord(null)}
      />

      {/* Creation / Edit Wizard Modal */}
      <IntakeSheetWizardModal
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false)
          setSelectedEditRecord(null)
        }}
        patient={patient}
        initialRecord={selectedEditRecord}
        onSave={handleCreateOrUpdateIntakeSheet}
      />
    </div>
  )
}
