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
  const [newWatcher, setNewWatcher] = useState({
    fullName: "",
    relationship: "Relative",
    contactNo: "",
  })

  const handleSave = () => {
    if (!newWatcher.fullName) return
    onIssueWatcherPass({
      fullName: newWatcher.fullName,
      relationship: newWatcher.relationship,
      contactNo: newWatcher.contactNo || defaultContactNo,
    })
    setNewWatcher({
      fullName: "",
      relationship: "Relative",
      contactNo: "",
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-fit max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Issue Watcher Pass</DialogTitle>
          <DialogDescription className="text-xs">
            Register an authorized watcher for the ward.
          </DialogDescription>
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
                onChange={(e) =>
                  setNewWatcher({ ...newWatcher, relationship: e.target.value })
                }
                className="h-10 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Contact Number</Label>
              <Input
                placeholder="+63 9XX XXX XXXX"
                value={newWatcher.contactNo}
                onChange={(e) =>
                  setNewWatcher({ ...newWatcher, contactNo: e.target.value })
                }
                className="h-10 mt-1"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button size="default" className="h-10 font-bold px-6" onClick={handleSave}>
            Issue Pass
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
