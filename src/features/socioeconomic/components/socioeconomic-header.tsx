import React from "react"
import { format, parseISO } from "date-fns"
import { Calendar, Pencil, Trash2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SocioeconomicCurrent } from "../types/socioeconomic.types"

interface SocioeconomicHeaderProps {
  current: SocioeconomicCurrent
  canUpdate: boolean
  canDelete: boolean
  onEdit: () => void
  onDelete: () => void
}

export const SocioeconomicHeader: React.FC<SocioeconomicHeaderProps> = ({
  current,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}) => {
  const formattedDate = current.recordedOn
    ? (() => {
        try {
          return format(parseISO(current.recordedOn), "MMMM d, yyyy")
        } catch {
          return current.recordedOn
        }
      })()
    : "Unspecified date"

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-card text-card-foreground shadow-xs">
      <div className="space-y-1">
        <h2 className="text-base font-semibold tracking-tight">List of Expenses</h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-muted-foreground/70" />
            <span>Recorded on <span className="font-medium text-foreground">{formattedDate}</span></span>
          </div>
          {current.recordedBy?.name && (
            <div className="flex items-center gap-1.5">
              <User className="size-3.5 text-muted-foreground/70" />
              <span>Assessed by <span className="font-medium text-foreground">{current.recordedBy.name}</span></span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {canUpdate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Pencil className="size-3.5" />
            <span>Update Record</span>
          </Button>
        )}
        {canDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="h-8 gap-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 cursor-pointer"
          >
            <Trash2 className="size-3.5" />
            <span>Delete</span>
          </Button>
        )}
      </div>
    </div>
  )
}
