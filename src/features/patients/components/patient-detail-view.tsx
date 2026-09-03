import React, { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  ClipboardList,
  CreditCard,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  History,
  Printer,
  User,
  UserCheck,
  Users,
} from "lucide-react"
import { useAddFamilyMember, useAddWatcher } from "../hooks/use-patient-writes"
import { useIntakeSheetsForPatient } from "../hooks/use-intake-sheets"
import type { FamilyMember, PatientRecord } from "../types"
import { FamilyMemberDialog } from "./dialogs/family-member-dialog"
import { WatcherDialog } from "./dialogs/watcher-dialog"
import { DocumentsTab } from "./tabs/documents-tab"
import { FamilyTab } from "./tabs/family-tab"
import { HistoryTab } from "./tabs/history-tab"
import { IdTab } from "./tabs/id-tab"
import { IntakeSheetTab } from "./tabs/intake-sheet-tab"
import { ProfileTab } from "./tabs/profile-tab"
import { SocialCaseTab } from "./tabs/social-case-tab"
import { StaffTab } from "./tabs/staff-tab"
import { WatchersTab } from "./tabs/watchers-tab"

interface PatientDetailViewProps {
  patient: PatientRecord
  onUpdatePatient?: (updatedPatient: PatientRecord) => void
}

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({ patient }) => {
  const [activeTab, setActiveTab] = useState("profile")
  const [isAddFamilyOpen, setIsAddFamilyOpen] = useState(false)
  const [isAddWatcherOpen, setIsAddWatcherOpen] = useState(false)

  const addFamilyMember = useAddFamilyMember(patient.id)
  const addWatcher = useAddWatcher(patient.id)
  const { data: intakeSheets = [] } = useIntakeSheetsForPatient(patient.id)

  // Both hit the real API and invalidate the patient's profile query on
  // success (see use-patient-writes.ts) — no more client-synthesized ids or
  // audit entries; the server's own Auditable trail is what the History tab
  // reads now.
  const handleAddFamilyMember = (newFamily: Omit<FamilyMember, "id">) => {
    addFamilyMember.mutate({
      name: newFamily.fullName,
      relationship: newFamily.relationship,
      age: newFamily.age,
      occupation: newFamily.occupation,
      monthly_income: newFamily.monthlyIncome,
      is_living_with_patient: newFamily.isDependent,
    })
  }

  const handleAddWatcher = (watcherData: {
    fullName: string
    relationship: string
    contactNo: string
  }) => {
    addWatcher.mutate({
      name: watcherData.fullName,
      relationship: watcherData.relationship,
      contact_number: watcherData.contactNo || patient.contactNo,
    })
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background text-foreground transition-colors duration-200">
      {/* Patient Header Banner */}
      <div className="border-b border-border bg-card p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="size-16 border-2 border-primary/30">
              <AvatarFallback className="bg-primary/15 text-primary font-heading font-bold text-xl">
                {patient.fullName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-2xl font-bold tracking-tight">
                  {patient.fullName}
                </h1>
                <Badge variant="default" className="text-sm px-3 py-0.5 font-bold">
                  {patient.category}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1.5 font-mono">
                <span>
                  Hosp ID:{" "}
                  <strong className="text-foreground font-bold font-mono">
                    {patient.hospitalNo}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  MSWD ID:{" "}
                  <strong className="text-foreground font-bold font-mono">
                    {patient.mswdNo}
                  </strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-sans font-medium text-foreground">
                  <Building2 className="size-4 text-primary" />
                  {patient.ward} ({patient.bedNo})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="default"
              className="gap-2 text-sm font-semibold h-10"
              onClick={() => window.print()}
            >
              <Printer className="size-4" />
              Print Case Study
            </Button>
            <Button
              variant="default"
              size="default"
              className="gap-2 text-sm font-semibold h-10"
            >
              <Edit className="size-4" />
              Edit Status
            </Button>
          </div>
        </div>
      </div>

      {/* Main 8-Tab Workspace */}
      <div className="flex-1 p-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex flex-wrap w-full gap-2 h-auto p-1.5 bg-muted/50 rounded-2xl border border-border/60">
            <TabsTrigger
              value="profile"
              className="rounded-xl px-4 py-2.5 text-xs font-semibold gap-2 border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs transition-all"
            >
              <User className="size-4" />
              <span>Profile</span>
            </TabsTrigger>

            <TabsTrigger
              value="intake-sheet"
              className="rounded-xl px-4 py-2.5 text-xs font-semibold gap-2 border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs transition-all"
            >
              <ClipboardList className="size-4" />
              <span>Intake Sheet</span>
              <span className="ml-1 rounded-full bg-background/30 px-2 py-0.5 text-[10px] font-bold">
                {intakeSheets.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="id"
              className="rounded-xl px-4 py-2.5 text-xs font-semibold gap-2 border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs transition-all"
            >
              <CreditCard className="size-4" />
              <span>IDs</span>
            </TabsTrigger>

            <TabsTrigger
              value="family"
              className="rounded-xl px-4 py-2.5 text-xs font-semibold gap-2 border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs transition-all"
            >
              <Users className="size-4" />
              <span>Family</span>
              <span className="ml-1 rounded-full bg-background/30 px-2 py-0.5 text-[10px] font-bold">
                {patient.familyMembers.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="watchers"
              className="rounded-xl px-4 py-2.5 text-xs font-semibold gap-2 border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs transition-all"
            >
              <Eye className="size-4" />
              <span>Watchers</span>
              <span className="ml-1 rounded-full bg-background/30 px-2 py-0.5 text-[10px] font-bold">
                {patient.watchers.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="staff"
              className="rounded-xl px-4 py-2.5 text-xs font-semibold gap-2 border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs transition-all"
            >
              <UserCheck className="size-4" />
              <span>Staff</span>
            </TabsTrigger>

            <TabsTrigger
              value="social-case"
              className="rounded-xl px-4 py-2.5 text-xs font-semibold gap-2 border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs transition-all"
            >
              <FileSpreadsheet className="size-4" />
              <span>Social Case</span>
            </TabsTrigger>

            <TabsTrigger
              value="documents"
              className="rounded-xl px-4 py-2.5 text-xs font-semibold gap-2 border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs transition-all"
            >
              <FileText className="size-4" />
              <span>Docs</span>
              <span className="ml-1 rounded-full bg-background/30 px-2 py-0.5 text-[10px] font-bold">
                {patient.documents.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="history"
              className="rounded-xl px-4 py-2.5 text-xs font-semibold gap-2 border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs transition-all"
            >
              <History className="size-4" />
              <span>History</span>
              <span className="ml-1 rounded-full bg-background/30 px-2 py-0.5 text-[10px] font-bold">
                {patient.history.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab patient={patient} />
          </TabsContent>

          <TabsContent value="intake-sheet">
            <IntakeSheetTab patient={patient} />
          </TabsContent>

          <TabsContent value="id">
            <IdTab patient={patient} />
          </TabsContent>

          <TabsContent value="family">
            <FamilyTab
              patient={patient}
              onOpenAddFamilyDialog={() => setIsAddFamilyOpen(true)}
            />
          </TabsContent>

          <TabsContent value="watchers">
            <WatchersTab
              patient={patient}
              onOpenAddWatcherDialog={() => setIsAddWatcherOpen(true)}
            />
          </TabsContent>

          <TabsContent value="staff">
            <StaffTab patient={patient} />
          </TabsContent>

          <TabsContent value="social-case">
            <SocialCaseTab patient={patient} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsTab patient={patient} />
          </TabsContent>

          <TabsContent value="history">
            <HistoryTab patient={patient} />
          </TabsContent>
        </Tabs>
      </div>

      <FamilyMemberDialog
        isOpen={isAddFamilyOpen}
        onClose={() => setIsAddFamilyOpen(false)}
        onAddFamilyMember={handleAddFamilyMember}
      />

      <WatcherDialog
        isOpen={isAddWatcherOpen}
        onClose={() => setIsAddWatcherOpen(false)}
        defaultContactNo={patient.contactNo}
        onIssueWatcherPass={handleAddWatcher}
      />
    </div>
  )
}
