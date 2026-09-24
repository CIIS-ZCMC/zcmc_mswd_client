import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, Loader2 } from "lucide-react"
import { ApiError } from "@/lib/api-client"
import { useAssessEncounter, useAssignableCases } from "../../hooks/use-hospital-encounters"

interface AssessEncounterDialogProps {
  encounterId: number
  hospitalNumber: string | number | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssessed?: () => void
}

export const AssessEncounterDialog: React.FC<AssessEncounterDialogProps> = ({
  encounterId,
  hospitalNumber,
  open,
  onOpenChange,
  onAssessed,
}) => {
  const [caseId, setCaseId] = useState<string>("")
  const [error, setError] = useState("")

  const { data: cases = [], isLoading } = useAssignableCases(encounterId, open)
  const assess = useAssessEncounter(encounterId, hospitalNumber)

  const handleConfirm = async () => {
    if (!caseId) {
      setError("Select a case to attach this encounter to.")
      return
    }
    setError("")
    try {
      await assess.mutateAsync(Number(caseId))
      setCaseId("")
      onOpenChange(false)
      onAssessed?.()
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.firstValidationMessage ?? err.message)
      } else {
        setError(err instanceof Error ? err.message : "Could not attach the encounter.")
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Assess hospital encounter</DialogTitle>
          <DialogDescription>
            Attach this HIS encounter to one of the patient's open cases. Only the patient's own open cases appear.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="font-semibold text-xs uppercase tracking-wider">
              Attach to case <span className="text-destructive">*</span>
            </Label>

            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading cases…
              </div>
            ) : cases.length === 0 ? (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 flex gap-2.5 items-start text-xs text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>This patient has no open case. Open a case first, then assess the encounter into it.</span>
              </div>
            ) : (
              <Select
                value={caseId}
                onValueChange={(value) => {
                  setCaseId(value)
                  if (error) setError("")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a case" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.caseCode} · {c.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {error && <p className="text-xs text-destructive font-medium">{error}</p>}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="senior"
            onClick={() => onOpenChange(false)}
            disabled={assess.isPending}
            className="border-2 font-bold text-sm h-11 px-5"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="senior"
            onClick={handleConfirm}
            disabled={assess.isPending || cases.length === 0 || !caseId}
            className="font-extrabold text-sm h-11 px-6 shadow-md transition-all"
          >
            {assess.isPending && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
            Attach to case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
