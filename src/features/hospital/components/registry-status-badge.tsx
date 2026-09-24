import React from "react"
import { Badge } from "@/components/ui/badge"
import type { RegistryStatus } from "../types/hospital-transaction.types"

const STATUS_CLASSES: Record<string, string> = {
  A: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  D: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  X: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
  M: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  U: "bg-muted text-muted-foreground border-border",
}

interface RegistryStatusBadgeProps {
  status: RegistryStatus | null
}

export const RegistryStatusBadge: React.FC<RegistryStatusBadgeProps> = ({ status }) => {
  if (!status) {
    return (
      <Badge variant="outline" className="font-semibold text-xs">
        Unknown
      </Badge>
    )
  }

  const className = STATUS_CLASSES[status.code] ?? STATUS_CLASSES.U

  return (
    <Badge variant="outline" className={`font-semibold text-xs border ${className}`}>
      {status.label}
    </Badge>
  )
}
