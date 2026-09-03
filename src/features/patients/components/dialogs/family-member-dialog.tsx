import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, GraduationCap, Heart, Phone, User, Users } from "lucide-react"
import type { FamilyMember } from "../../types"

interface FamilyMemberDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddFamilyMember: (member: Omit<FamilyMember, "id">) => void
}

const RELATIONSHIP_OPTIONS = [
  "Spouse",
  "Child",
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Grandparent",
  "Relative",
  "In-law",
  "Other",
]

const EDUCATIONAL_ATTAINMENT_OPTIONS = [
  "No Formal Education",
  "Elementary Level",
  "Elementary Graduate",
  "High School Level",
  "High School Graduate",
  "Vocational / Technical",
  "College Level",
  "College Graduate",
  "Post-Graduate",
]

function computeAgeFromBirthdate(birthdateString: string): number | null {
  if (!birthdateString) return null
  const birthDate = new Date(birthdateString)
  if (isNaN(birthDate.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age >= 0 ? age : 0
}

export const FamilyMemberDialog: React.FC<FamilyMemberDialogProps> = ({
  isOpen,
  onClose,
  onAddFamilyMember,
}) => {
  const [newFamily, setNewFamily] = useState({
    fullName: "",
    relationship: "Child",
    birthdate: "",
    sex: "",
    age: 0,
    occupation: "",
    monthlyIncome: 0,
    educationalAttainment: "",
    contactNumber: "",
    isLivingWithPatient: true,
  })

  const handleBirthdateChange = (dateVal: string) => {
    const calculatedAge = computeAgeFromBirthdate(dateVal)
    setNewFamily((prev) => ({
      ...prev,
      birthdate: dateVal,
      age: calculatedAge !== null ? calculatedAge : prev.age,
    }))
  }

  const handleSave = () => {
    if (!newFamily.fullName.trim()) return
    onAddFamilyMember(newFamily)
    setNewFamily({
      fullName: "",
      relationship: "Child",
      age: 0,
      civilStatus: "Single",
      birthdate: "",
      sex: "",
      occupation: "",
      monthlyIncome: 0,
      educationalAttainment: "",
      isDependent: true,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-2xl p-7 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-border/40">
          <DialogTitle className="text-2xl font-extrabold flex items-center gap-2.5">
            <Users className="size-6 text-primary" /> Add Family Member
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-1">
            Register household member details and socio-economic relationship.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Section 1: Personal Demographics */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
              <User className="size-5 text-primary" />
              <h4 className="text-lg font-bold text-foreground">1. Personal Demographics</h4>
            </div>

            <div>
              <Label className="text-[17px] font-bold text-foreground mb-1.5 block">Full Name *</Label>
              <Input
                placeholder="e.g. Maria San Juan"
                value={newFamily.fullName}
                onChange={(e) => setNewFamily({ ...newFamily, fullName: e.target.value })}
                className="h-12 text-base font-medium px-4"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-[17px] font-bold text-foreground mb-1.5 block">Sex</Label>
                <Select
                  value={newFamily.sex}
                  onValueChange={(val) => setNewFamily({ ...newFamily, sex: val ?? "" })}
                >
                  <SelectTrigger className="h-12 text-base font-medium px-4">
                    <SelectValue placeholder="Select Sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male" className="text-base py-2.5 font-medium">
                      Male
                    </SelectItem>
                    <SelectItem value="female" className="text-base py-2.5 font-medium">
                      Female
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[17px] font-bold text-foreground mb-1.5 block">Birthdate</Label>
                <Input
                  type="date"
                  value={newFamily.birthdate}
                  onChange={(e) => handleBirthdateChange(e.target.value)}
                  className="h-12 text-base font-medium px-4"
                />
              </div>

              <div>
                <Label className="text-[17px] font-bold text-foreground mb-1.5 block">Age (Years)</Label>
                <Input
                  type="number"
                  placeholder="Age"
                  value={newFamily.age !== undefined && newFamily.age !== null ? newFamily.age : ""}
                  onChange={(e) =>
                    setNewFamily({ ...newFamily, age: parseInt(e.target.value) || 0 })
                  }
                  className="h-12 text-base font-medium px-4"
                />
                {newFamily.birthdate && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                    ✓ Auto-calculated from birthdate
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Household Relationship & Dependency */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
              <Heart className="size-5 text-primary" />
              <h4 className="text-lg font-bold text-foreground">2. Household &amp; Contact</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-[17px] font-bold text-foreground mb-1.5 block">Relationship</Label>
                <Select
                  value={newFamily.relationship}
                  onValueChange={(val) => setNewFamily({ ...newFamily, relationship: val ?? newFamily.relationship })}
                >
                  <SelectTrigger className="h-12 text-base font-medium px-4">
                    <SelectValue placeholder="Relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map((rel) => (
                      <SelectItem key={rel} value={rel} className="text-base py-2.5 font-medium">
                        {rel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[17px] font-bold text-foreground mb-1.5 flex items-center gap-2">
                  <Phone className="size-4.5 text-muted-foreground" /> Contact Number
                </Label>
                <Input
                  placeholder="e.g. 09171234567"
                  value={newFamily.contactNumber}
                  onChange={(e) => setNewFamily({ ...newFamily, contactNumber: e.target.value })}
                  className="h-12 text-base font-medium px-4"
                />
              </div>

              <div>
                <Label className="text-[17px] font-bold text-foreground mb-1.5 block">Living With Patient</Label>
                <Select
                  value={newFamily.isLivingWithPatient ? "yes" : "no"}
                  onValueChange={(val) => setNewFamily({ ...newFamily, isLivingWithPatient: val === "yes" })}
                >
                  <SelectTrigger className="h-12 text-base font-medium px-4">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes" className="text-base py-2.5 font-medium">
                      Yes
                    </SelectItem>
                    <SelectItem value="no" className="text-base py-2.5 font-medium">
                      No
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section 3: Socio-Economic & Education Profile */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
              <Briefcase className="size-5 text-primary" />
              <h4 className="text-lg font-bold text-foreground">3. Socio-Economic &amp; Education</h4>
            </div>

            <div>
              <Label className="text-[17px] font-bold text-foreground mb-1.5 flex items-center gap-2">
                <GraduationCap className="size-4.5 text-muted-foreground" /> Educational Attainment
              </Label>
              <Select
                value={newFamily.educationalAttainment}
                onValueChange={(val) => setNewFamily({ ...newFamily, educationalAttainment: val ?? "" })}
              >
                <SelectTrigger className="h-12 text-base font-medium px-4">
                  <SelectValue placeholder="Select Educational Attainment" />
                </SelectTrigger>
                <SelectContent>
                  {EDUCATIONAL_ATTAINMENT_OPTIONS.map((edu) => (
                    <SelectItem key={edu} value={edu} className="text-base py-2.5 font-medium">
                      {edu}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-[17px] font-bold text-foreground mb-1.5 block">Occupation</Label>
                <Input
                  placeholder="e.g. Student / Vendor / None"
                  value={newFamily.occupation}
                  onChange={(e) =>
                    setNewFamily({ ...newFamily, occupation: e.target.value })
                  }
                  className="h-12 text-base font-medium px-4"
                />
              </div>

              <div>
                <Label className="text-[17px] font-bold text-foreground mb-1.5 block">Monthly Income (₱)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newFamily.monthlyIncome || ""}
                  onChange={(e) =>
                    setNewFamily({
                      ...newFamily,
                      monthlyIncome: parseInt(e.target.value) || 0,
                    })
                  }
                  className="h-12 text-base font-mono font-bold px-4"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border/40">
          <Button
            size="lg"
            className="h-12 text-lg font-bold px-8 shadow-sm"
            disabled={!newFamily.fullName.trim()}
            onClick={handleSave}
          >
            Save Family Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
