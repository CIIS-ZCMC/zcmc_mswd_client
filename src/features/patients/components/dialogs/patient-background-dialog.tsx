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
import { Spinner } from "@/components/ui/spinner"
import type { UpdatePatientBackgroundPayload } from "../../api/patients-api"
import type { PatientRecord } from "../../types"

interface PatientBackgroundDialogProps {
  isOpen: boolean
  onClose: () => void
  patient: PatientRecord
  onSave: (payload: UpdatePatientBackgroundPayload) => void
  isSaving: boolean
}

export const PatientBackgroundDialog: React.FC<PatientBackgroundDialogProps> = ({
  isOpen,
  onClose,
  patient,
  onSave,
  isSaving,
}) => {
  const [form, setForm] = useState(() => ({
    religion: patient.religion ?? "",
    nationality: patient.nationality ?? "",
    place_of_birth: patient.placeOfBirth ?? "",
    permanent_address: patient.permanentAddress ?? "",
    present_address: patient.presentAddress ?? "",
    educational_attainment: patient.educationalAttainment ?? "",
    occupation: patient.occupation ?? "",
    employer: patient.employer ?? "",
    monthly_income: patient.monthlyIncome != null ? String(patient.monthlyIncome) : "",
  }))

  const handleSave = () => {
    onSave({
      religion: form.religion || undefined,
      nationality: form.nationality || undefined,
      place_of_birth: form.place_of_birth || undefined,
      permanent_address: form.permanent_address || undefined,
      present_address: form.present_address || undefined,
      educational_attainment: form.educational_attainment || undefined,
      occupation: form.occupation || undefined,
      employer: form.employer || undefined,
      monthly_income: form.monthly_income ? Number(form.monthly_income) : undefined,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Edit Background &amp; Economic Profile</DialogTitle>
          <DialogDescription className="text-xs">
            Saved directly to {patient.fullName}&apos;s patient record.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Religion</Label>
              <Input
                value={form.religion}
                onChange={(e) => setForm({ ...form, religion: e.target.value })}
                className="h-10 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Nationality</Label>
              <Input
                value={form.nationality}
                onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                className="h-10 mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Place of Birth</Label>
              <Input
                value={form.place_of_birth}
                onChange={(e) => setForm({ ...form, place_of_birth: e.target.value })}
                className="h-10 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Educational Attainment</Label>
              <Input
                value={form.educational_attainment}
                onChange={(e) => setForm({ ...form, educational_attainment: e.target.value })}
                className="h-10 mt-1"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold">Permanent Address</Label>
            <Input
              value={form.permanent_address}
              onChange={(e) => setForm({ ...form, permanent_address: e.target.value })}
              className="h-10 mt-1"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold">Present Address</Label>
            <Input
              value={form.present_address}
              onChange={(e) => setForm({ ...form, present_address: e.target.value })}
              className="h-10 mt-1"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-semibold">Occupation</Label>
              <Input
                value={form.occupation}
                onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                className="h-10 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Employer</Label>
              <Input
                value={form.employer}
                onChange={(e) => setForm({ ...form, employer: e.target.value })}
                className="h-10 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Monthly Income (₱)</Label>
              <Input
                type="number"
                value={form.monthly_income}
                onChange={(e) => setForm({ ...form, monthly_income: e.target.value })}
                className="h-10 mt-1 font-mono"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button size="default" className="h-10 font-bold px-6" disabled={isSaving} onClick={handleSave}>
            {isSaving ? <Spinner className="size-4" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
