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
import type { FamilyMember } from "../../types"

interface FamilyMemberDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddFamilyMember: (member: Omit<FamilyMember, "id">) => void
}

export const FamilyMemberDialog: React.FC<FamilyMemberDialogProps> = ({
  isOpen,
  onClose,
  onAddFamilyMember,
}) => {
  const [newFamily, setNewFamily] = useState({
    fullName: "",
    relationship: "Child",
    age: 0,
    civilStatus: "Single",
    occupation: "",
    monthlyIncome: 0,
    isDependent: true,
  })

  const handleSave = () => {
    if (!newFamily.fullName) return
    onAddFamilyMember(newFamily)
    setNewFamily({
      fullName: "",
      relationship: "Child",
      age: 0,
      civilStatus: "Single",
      occupation: "",
      monthlyIncome: 0,
      isDependent: true,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Add Family Member</DialogTitle>
          <DialogDescription className="text-xs">
            Enter household member information.
          </DialogDescription>
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
                onChange={(e) =>
                  setNewFamily({ ...newFamily, relationship: e.target.value })
                }
                className="h-10 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Age</Label>
              <Input
                type="number"
                value={newFamily.age}
                onChange={(e) =>
                  setNewFamily({ ...newFamily, age: parseInt(e.target.value) || 0 })
                }
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
                onChange={(e) =>
                  setNewFamily({ ...newFamily, occupation: e.target.value })
                }
                className="h-10 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Monthly Income (₱)</Label>
              <Input
                type="number"
                value={newFamily.monthlyIncome}
                onChange={(e) =>
                  setNewFamily({
                    ...newFamily,
                    monthlyIncome: parseInt(e.target.value) || 0,
                  })
                }
                className="h-10 mt-1"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button size="default" className="h-10 font-bold px-6" onClick={handleSave}>
            Save Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
