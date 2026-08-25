import React, { useState } from "react"
import type { PatientRecord, FamilyMember, Watcher } from "@/data/patients-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  User,
  CreditCard,
  Users,
  Eye,
  UserCheck,
  FileSpreadsheet,
  FileText,
  History,
  Printer,
  Edit,
  Plus,
  CheckCircle2,
  Download,
  Building2,
  Phone,
  MapPin,
  Heart,
  Briefcase,
} from "lucide-react"

interface MswdPatientViewProps {
  patient: PatientRecord
  onUpdatePatient?: (updatedPatient: PatientRecord) => void
}

export const MswdPatientView: React.FC<MswdPatientViewProps> = ({ patient, onUpdatePatient }) => {
  const [activeTab, setActiveTab] = useState("profile")
  const [isAddFamilyOpen, setIsAddFamilyOpen] = useState(false)
  const [isAddWatcherOpen, setIsAddWatcherOpen] = useState(false)

  // New family member state
  const [newFamily, setNewFamily] = useState({
    fullName: "",
    relationship: "Child",
    age: 0,
    civilStatus: "Single",
    occupation: "",
    monthlyIncome: 0,
    isDependent: true,
  })

  // New watcher state
  const [newWatcher, setNewWatcher] = useState({
    fullName: "",
    relationship: "Relative",
    contactNo: "",
  })

  const handleAddFamilyMember = () => {
    if (!newFamily.fullName) return
    const member: FamilyMember = {
      id: `fam-${Date.now()}`,
      ...newFamily,
    }
    const updated = {
      ...patient,
      familyMembers: [...patient.familyMembers, member],
      history: [
        {
          id: `hist-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          action: "Family Member Added",
          performedBy: "Medical Social Worker",
          details: `Added family member: ${member.fullName} (${member.relationship})`,
        },
        ...patient.history,
      ],
    }
    onUpdatePatient?.(updated)
    setIsAddFamilyOpen(false)
    setNewFamily({
      fullName: "",
      relationship: "Child",
      age: 0,
      civilStatus: "Single",
      occupation: "",
      monthlyIncome: 0,
      isDependent: true,
    })
  }

  const handleAddWatcher = () => {
    if (!newWatcher.fullName) return
    const watcher: Watcher = {
      id: `watch-${Date.now()}`,
      fullName: newWatcher.fullName,
      relationship: newWatcher.relationship,
      contactNo: newWatcher.contactNo || patient.contactNo,
      passNo: `WP-2026-${Math.floor(100 + Math.random() * 900)}`,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Active",
    }
    const updated = {
      ...patient,
      watchers: [...patient.watchers, watcher],
      history: [
        {
          id: `hist-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          action: "Watcher Pass Issued",
          performedBy: "Medical Social Worker",
          details: `Issued Pass ${watcher.passNo} for watcher: ${watcher.fullName}`,
        },
        ...patient.history,
      ],
    }
    onUpdatePatient?.(updated)
    setIsAddWatcherOpen(false)
    setNewWatcher({
      fullName: "",
      relationship: "Relative",
      contactNo: "",
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
                <span>Hosp ID: <strong className="text-foreground font-bold">{patient.hospitalNo}</strong></span>
                <span>•</span>
                <span>MSWD ID: <strong className="text-foreground font-bold">{patient.mswdNo}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-sans font-medium text-foreground">
                  <Building2 className="size-4 text-primary" />
                  {patient.ward} ({patient.bedNo})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="default" className="gap-2 text-sm font-semibold h-10" onClick={() => window.print()}>
              <Printer className="size-4" />
              Print Case Study
            </Button>
            <Button variant="default" size="default" className="gap-2 text-sm font-semibold h-10">
              <Edit className="size-4" />
              Edit Status
            </Button>
          </div>
        </div>
      </div>

      {/* Main 8-Tab Workspace */}
      <div className="flex-1 p-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Senior-Friendly Rounded Pill/Chip Tab List */}
          <TabsList className="mb-6 flex flex-wrap w-full gap-2 h-auto p-1.5 bg-muted/50 rounded-2xl border border-border/60">
            <TabsTrigger value="profile" className="rounded-xl px-4 py-2.5 text-xs font-semibold gap-2 border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs transition-all">
              <User className="size-4" />
              <span>Profile</span>
            </TabsTrigger>

            <TabsTrigger value="id" className="rounded-xl px-4 py-2.5 text-xs font-semibold gap-2 border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs transition-all">
              <CreditCard className="size-4" />
              <span>IDs</span>
            </TabsTrigger>

            <TabsTrigger value="family" className="rounded-xl px-4 py-2.5 text-xs font-semibold gap-2 border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs transition-all">
              <Users className="size-4" />
              <span>Family</span>
              <span className="ml-1 rounded-full bg-background/30 px-2 py-0.5 text-[10px] font-bold">
                {patient.familyMembers.length}
              </span>
            </TabsTrigger>

            <TabsTrigger value="watchers" className="rounded-xl px-4 py-2.5 text-xs font-semibold gap-2 border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs transition-all">
              <Eye className="size-4" />
              <span>Watchers</span>
              <span className="ml-1 rounded-full bg-background/30 px-2 py-0.5 text-[10px] font-bold">
                {patient.watchers.length}
              </span>
            </TabsTrigger>

            <TabsTrigger value="staff" className="rounded-xl px-4 py-2.5 text-xs font-semibold gap-2 border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs transition-all">
              <UserCheck className="size-4" />
              <span>Staff</span>
            </TabsTrigger>

            <TabsTrigger value="social-case" className="rounded-xl px-4 py-2.5 text-xs font-semibold gap-2 border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs transition-all">
              <FileSpreadsheet className="size-4" />
              <span>Social Case</span>
            </TabsTrigger>

            <TabsTrigger value="documents" className="rounded-xl px-4 py-2.5 text-xs font-semibold gap-2 border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs transition-all">
              <FileText className="size-4" />
              <span>Docs</span>
              <span className="ml-1 rounded-full bg-background/30 px-2 py-0.5 text-[10px] font-bold">
                {patient.documents.length}
              </span>
            </TabsTrigger>

            <TabsTrigger value="history" className="rounded-xl px-4 py-2.5 text-xs font-semibold gap-2 border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs transition-all">
              <History className="size-4" />
              <span>History</span>
              <span className="ml-1 rounded-full bg-background/30 px-2 py-0.5 text-[10px] font-bold">
                {patient.history.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Profile */}
          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 font-bold">
                    <User className="size-5 text-primary" /> Personal Demographics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground font-medium text-xs">Full Name:</span>
                    <p className="font-bold text-base text-foreground mt-0.5">{patient.fullName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t border-border/50 pt-2">
                    <div>
                      <span className="text-muted-foreground font-medium text-xs">Age / Gender:</span>
                      <p className="font-semibold text-sm">{patient.age} yrs / {patient.gender}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-medium text-xs">Birth Date:</span>
                      <p className="font-semibold text-sm">{patient.birthDate}</p>
                    </div>
                  </div>
                  <div className="border-t border-border/50 pt-2">
                    <span className="text-muted-foreground font-medium text-xs">Civil Status:</span>
                    <p className="font-semibold text-sm">{patient.civilStatus}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 font-bold">
                    <MapPin className="size-5 text-primary" /> Address &amp; Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground font-medium text-xs">Contact Number:</span>
                    <p className="font-semibold text-sm flex items-center gap-1.5 text-foreground mt-0.5">
                      <Phone className="size-4 text-primary" /> {patient.contactNo}
                    </p>
                  </div>
                  <div className="border-t border-border/50 pt-2">
                    <span className="text-muted-foreground font-medium text-xs">Barangay:</span>
                    <p className="font-semibold text-sm">{patient.barangay}, {patient.city}</p>
                  </div>
                  <div className="border-t border-border/50 pt-2">
                    <span className="text-muted-foreground font-medium text-xs">Full Address:</span>
                    <p className="font-medium text-sm text-foreground">{patient.address}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 font-bold">
                    <Heart className="size-5 text-primary" /> Admission &amp; Medical Diagnosis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground font-medium text-xs">Admission Status:</span>
                    <p className="font-bold text-sm text-primary mt-0.5">{patient.admissionStatus}</p>
                  </div>
                  <div className="border-t border-border/50 pt-2">
                    <span className="text-muted-foreground font-medium text-xs">Ward &amp; Bed:</span>
                    <p className="font-semibold text-sm">{patient.ward} - {patient.bedNo}</p>
                  </div>
                  <div className="border-t border-border/50 pt-2">
                    <span className="text-muted-foreground font-medium text-xs">Clinical Diagnosis:</span>
                    <p className="font-semibold text-sm text-foreground leading-relaxed">{patient.diagnosis}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 2: Identification/ID */}
          <TabsContent value="id" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">Government &amp; Health Identification Credentials</CardTitle>
                <CardDescription className="text-xs">Verified IDs and indigency documents on file.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-card shadow-2xs">
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">PhilHealth Membership</p>
                    <p className="font-mono text-xs text-muted-foreground font-semibold">{patient.philHealthNo}</p>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-500 gap-1.5 px-3 py-1 text-xs">
                    <CheckCircle2 className="size-4" /> Verified
                  </Badge>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-card shadow-2xs">
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">Barangay Indigency Certificate</p>
                    <p className="text-xs text-muted-foreground">Issued by Barangay {patient.barangay}</p>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-500 gap-1.5 px-3 py-1 text-xs">
                    <CheckCircle2 className="size-4" /> Valid
                  </Badge>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-card shadow-2xs">
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">Senior Citizen ID</p>
                    <p className="font-mono text-xs text-muted-foreground font-semibold">{patient.seniorCitizenId || "Not Applicable"}</p>
                  </div>
                  <Badge variant={patient.seniorCitizenId ? "default" : "secondary"} className="px-3 py-1 text-xs">
                    {patient.seniorCitizenId ? "Active" : "N/A"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-card shadow-2xs">
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">PWD Identification Card</p>
                    <p className="font-mono text-xs text-muted-foreground font-semibold">{patient.pwdId || "Not Applicable"}</p>
                  </div>
                  <Badge variant={patient.pwdId ? "default" : "secondary"} className="px-3 py-1 text-xs">
                    {patient.pwdId ? "Active" : "N/A"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Family */}
          <TabsContent value="family" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Family Composition &amp; Economic Dependency</CardTitle>
                  <CardDescription className="text-xs">Household members and income breakdown.</CardDescription>
                </div>
                <Dialog open={isAddFamilyOpen} onOpenChange={setIsAddFamilyOpen}>
                  <DialogTrigger>
                    <Button size="default" className="gap-2 font-semibold h-10">
                      <Plus className="size-4" /> Add Family Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold">Add Family Member</DialogTitle>
                      <DialogDescription className="text-xs">Enter household member information.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-3 text-sm">
                      <div>
                        <Label className="text-xs font-semibold">Full Name</Label>
                        <Input
                          placeholder="e.g. Maria San Juan"
                          value={newFamily.fullName}
                          onChange={(e) => setNewFamily({ ...newFamily, fullName: e.target.value })}
                          className="h-10 mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-semibold">Relationship</Label>
                          <Input
                            placeholder="e.g. Spouse / Child"
                            value={newFamily.relationship}
                            onChange={(e) => setNewFamily({ ...newFamily, relationship: e.target.value })}
                            className="h-10 mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">Age</Label>
                          <Input
                            type="number"
                            value={newFamily.age}
                            onChange={(e) => setNewFamily({ ...newFamily, age: parseInt(e.target.value) || 0 })}
                            className="h-10 mt-1"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-semibold">Occupation</Label>
                          <Input
                            placeholder="e.g. Student / Vendor"
                            value={newFamily.occupation}
                            onChange={(e) => setNewFamily({ ...newFamily, occupation: e.target.value })}
                            className="h-10 mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">Monthly Income (₱)</Label>
                          <Input
                            type="number"
                            value={newFamily.monthlyIncome}
                            onChange={(e) => setNewFamily({ ...newFamily, monthlyIncome: parseInt(e.target.value) || 0 })}
                            className="h-10 mt-1"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button size="default" className="h-10 font-bold px-6" onClick={handleAddFamilyMember}>Save Member</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Full Name</TableHead>
                      <TableHead className="font-bold">Relationship</TableHead>
                      <TableHead className="font-bold">Age</TableHead>
                      <TableHead className="font-bold">Occupation</TableHead>
                      <TableHead className="font-bold">Monthly Income</TableHead>
                      <TableHead className="font-bold">Dependent Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patient.familyMembers.map((fam) => (
                      <TableRow key={fam.id}>
                        <TableCell className="font-bold text-foreground">{fam.fullName}</TableCell>
                        <TableCell>{fam.relationship}</TableCell>
                        <TableCell>{fam.age} yrs</TableCell>
                        <TableCell>{fam.occupation || "N/A"}</TableCell>
                        <TableCell className="font-mono font-semibold">₱{fam.monthlyIncome.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={fam.isDependent ? "secondary" : "outline"} className="text-xs px-2.5 py-0.5">
                            {fam.isDependent ? "Dependent" : "Non-Dependent"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Watchers */}
          <TabsContent value="watchers" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Registered Hospital Watchers &amp; Bystander Passes</CardTitle>
                  <CardDescription className="text-xs">Authorized watchers with active ZCMC ward access passes.</CardDescription>
                </div>
                <Dialog open={isAddWatcherOpen} onOpenChange={setIsAddWatcherOpen}>
                  <DialogTrigger>
                    <Button size="default" className="gap-2 font-semibold h-10">
                      <Plus className="size-4" /> Issue Watcher Pass
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold">Issue Watcher Pass</DialogTitle>
                      <DialogDescription className="text-xs">Register an authorized watcher for the ward.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-3 text-sm">
                      <div>
                        <Label className="text-xs font-semibold">Watcher Full Name</Label>
                        <Input
                          placeholder="e.g. Juan San Juan"
                          value={newWatcher.fullName}
                          onChange={(e) => setNewWatcher({ ...newWatcher, fullName: e.target.value })}
                          className="h-10 mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-semibold">Relationship</Label>
                          <Input
                            placeholder="e.g. Spouse / Sibling"
                            value={newWatcher.relationship}
                            onChange={(e) => setNewWatcher({ ...newWatcher, relationship: e.target.value })}
                            className="h-10 mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">Contact Number</Label>
                          <Input
                            placeholder="+63 9XX XXX XXXX"
                            value={newWatcher.contactNo}
                            onChange={(e) => setNewWatcher({ ...newWatcher, contactNo: e.target.value })}
                            className="h-10 mt-1"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button size="default" className="h-10 font-bold px-6" onClick={handleAddWatcher}>Issue Pass</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Watcher Name</TableHead>
                      <TableHead className="font-bold">Relationship</TableHead>
                      <TableHead className="font-bold">Contact No.</TableHead>
                      <TableHead className="font-bold">Pass Number</TableHead>
                      <TableHead className="font-bold">Valid Until</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patient.watchers.map((watch) => (
                      <TableRow key={watch.id}>
                        <TableCell className="font-bold text-foreground">{watch.fullName}</TableCell>
                        <TableCell>{watch.relationship}</TableCell>
                        <TableCell className="font-mono font-semibold">{watch.contactNo}</TableCell>
                        <TableCell className="font-mono text-primary font-bold">{watch.passNo}</TableCell>
                        <TableCell>{watch.validUntil}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-emerald-600 border-emerald-500 text-xs px-2.5 py-0.5">
                            {watch.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Assign Staff */}
          <TabsContent value="staff" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Assigned Medical Social Workers &amp; Clinical Staff</CardTitle>
                  <CardDescription className="text-xs">Personnel handling case evaluation and management.</CardDescription>
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
                  <p className="text-base font-bold text-foreground">{patient.assignedStaff.socialWorker}</p>
                  <p className="font-mono text-muted-foreground text-xs font-semibold">License: {patient.assignedStaff.socialWorkerId}</p>
                </div>

                <div className="rounded-2xl border border-border p-5 space-y-3 bg-card shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Briefcase className="size-5 text-primary" />
                    <span className="font-bold text-base text-foreground">Attending Physician</span>
                  </div>
                  <p className="text-base font-bold text-foreground">{patient.assignedStaff.attendingPhysician}</p>
                  <p className="text-xs text-muted-foreground font-medium">Case Officer: {patient.assignedStaff.caseOfficer}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 6: Social Case */}
          <TabsContent value="social-case" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold">Social Safety Net Case Study Report</CardTitle>
                  <Badge variant="default" className="text-sm px-3 py-1 font-bold">{patient.caseStudy.category}</Badge>
                </div>
                <CardDescription className="text-xs font-mono font-semibold">Case Study No: {patient.caseStudy.caseNumber}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 text-sm">
                <div>
                  <span className="font-bold text-base text-foreground">Classification Details:</span>
                  <p className="mt-1.5 text-muted-foreground leading-relaxed">{patient.caseStudy.classificationDetails}</p>
                </div>
                <div>
                  <span className="font-bold text-base text-foreground">Presenting Problem:</span>
                  <p className="mt-1.5 text-muted-foreground leading-relaxed">{patient.caseStudy.presentingProblem}</p>
                </div>
                <div>
                  <span className="font-bold text-base text-foreground">Social Worker Evaluation Notes:</span>
                  <p className="mt-2 rounded-xl bg-muted/40 p-4 text-foreground leading-relaxed border border-border/60">
                    {patient.caseStudy.socialWorkerNotes}
                  </p>
                </div>
                <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-foreground">Recommended Financial Assistance:</span>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">{patient.caseStudy.recommendedAssistance}</p>
                  </div>
                  <span className="font-mono text-xl font-extrabold text-primary">
                    ₱{patient.caseStudy.approvedAmount?.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 7: Documents */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Uploaded Requirement Attachments</CardTitle>
                  <CardDescription className="text-xs">Verification documents &amp; prescriptions.</CardDescription>
                </div>
                <Button size="default" className="gap-2 font-semibold h-10">
                  <Plus className="size-4" /> Upload Document
                </Button>
              </CardHeader>
              <CardContent>
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Document Title</TableHead>
                      <TableHead className="font-bold">Category</TableHead>
                      <TableHead className="font-bold">Upload Date</TableHead>
                      <TableHead className="font-bold">File Size</TableHead>
                      <TableHead className="font-bold">Verification Status</TableHead>
                      <TableHead className="text-right font-bold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patient.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-bold text-foreground flex items-center gap-2">
                          <FileText className="size-4 text-primary" />
                          {doc.title}
                        </TableCell>
                        <TableCell>{doc.category}</TableCell>
                        <TableCell>{doc.uploadDate}</TableCell>
                        <TableCell className="font-mono font-semibold">{doc.fileSize}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-emerald-600 border-emerald-500 text-xs px-2.5 py-0.5">
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Download">
                            <Download className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 8: History */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">Audit History &amp; Activity Log</CardTitle>
                <CardDescription className="text-xs">Chronological log of intake and assessment actions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.history.map((hist) => (
                  <div key={hist.id} className="flex items-start gap-4 border-b border-border/50 pb-4 last:border-b-0">
                    <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                      <History className="size-4" />
                    </div>
                    <div className="flex-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base text-foreground">{hist.action}</span>
                        <span className="font-mono text-xs text-muted-foreground font-semibold">{hist.timestamp}</span>
                      </div>
                      <p className="text-muted-foreground mt-1 leading-relaxed">{hist.details}</p>
                      <span className="text-xs font-semibold text-primary mt-1 inline-block">By: {hist.performedBy}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
