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
import { NativeSelect } from "@/components/ui/native-select"
import { useWatcherRelationshipTypes } from "../../hooks/use-intake-sheets"

interface WatcherDialogProps {
  isOpen: boolean
  onClose: () => void
  defaultContactNo?: string
  onIssueWatcherPass: (watcherData: {
    fullName: string
    relationship: string
    contactNo: string
  }) => void
}

export const WatcherDialog: React.FC<WatcherDialogProps> = ({
  isOpen,
  onClose,
  defaultContactNo = "",
  onIssueWatcherPass,
}) => {
  const relationshipTypesQuery = useWatcherRelationshipTypes()
  const [newWatcher, setNewWatcher] = useState({
    fullName: "",
    relationship: "",
    contactNo: "",
  })

  const handleSave = () => {
    if (!newWatcher.fullName.trim() || !newWatcher.relationship) return
    onIssueWatcherPass({
      fullName: newWatcher.fullName,
      relationship: newWatcher.relationship,
      contactNo: newWatcher.contactNo || defaultContactNo,
    })
    setNewWatcher({
      fullName: "",
      relationship: "",
      contactNo: "",
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-lg p-6 sm:p-8">
        <DialogHeader className="space-y-1.5 text-left">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Issue Watcher Pass
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Register an authorized watcher for the ward.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div>
            <Label className="text-sm font-bold text-foreground mb-1.5 block">
              Watcher Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. Juan San Juan"
              value={newWatcher.fullName}
              onChange={(e) =>
                setNewWatcher({ ...newWatcher, fullName: e.target.value })
              }
              className="h-12 text-base px-4 rounded-lg focus-visible:ring-2"
            />
          </div>

          <div>
            <Label className="text-sm font-bold text-foreground mb-1.5 block">
              Relationship to Patient <span className="text-destructive">*</span>
            </Label>
            <NativeSelect
              size="lg"
              value={newWatcher.relationship}
              disabled={relationshipTypesQuery.isPending}
              onChange={(e) =>
                setNewWatcher({ ...newWatcher, relationship: e.target.value })
              }
              className="w-full rounded-lg"
            >
              <option value="" className="text-base py-2">
                {relationshipTypesQuery.isPending
                  ? "Loading relationship options..."
                  : "— Select Relationship —"}
              </option>
              {relationshipTypesQuery.data?.map((rel) => (
                <option key={rel.id} value={rel.code} className="text-base py-2">
                  {rel.name}
                </option>
              ))}
            </NativeSelect>
            <p className="text-xs text-muted-foreground mt-1.5">
              Select how the watcher is related to the patient.
            </p>
          </div>

          <div>
            <Label className="text-sm font-bold text-foreground mb-1.5 block">
              Contact Number
            </Label>
            <Input
              placeholder="+63 9XX XXX XXXX"
              value={newWatcher.contactNo}
              onChange={(e) =>
                setNewWatcher({ ...newWatcher, contactNo: e.target.value })
              }
              className="h-12 text-base px-4 rounded-lg font-mono"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-12 px-6 text-base font-semibold rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="default"
            className="h-12 font-bold px-8 text-base rounded-lg shadow-sm"
            onClick={handleSave}
            disabled={!newWatcher.fullName.trim() || !newWatcher.relationship}
          >
            Issue Pass
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


