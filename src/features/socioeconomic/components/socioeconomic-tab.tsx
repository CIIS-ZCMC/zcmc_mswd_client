import React, { useState } from "react"
import { AlertCircle, Plus, RefreshCw, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { usePermission } from "@/features/auth/hooks/use-permission"
import type { PatientRecord } from "@/features/patients/types"
import {
  useSocioeconomic,
  useDeleteSocioeconomicProfile,
} from "../hooks/use-socioeconomic"
import { SocioeconomicHeader } from "./socioeconomic-header"
import { ExpensesCard } from "./expenses-card"
import { IncomeCard } from "./income-card"
import { TrendCard } from "./trend-card"
import { ProfileFormDialog } from "./dialogs/profile-form-dialog"

interface SocioeconomicTabProps {
  patient: PatientRecord
}

export const SocioeconomicTab: React.FC<SocioeconomicTabProps> = ({ patient }) => {
  const patientId = patient.id
  const canView = usePermission("socioeconomic.view")
  const canCreate = usePermission("socioeconomic.create")
  const canUpdate = usePermission("socioeconomic.update")
  const canDelete = usePermission("socioeconomic.delete")

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useSocioeconomic(patientId)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const deleteMutation = useDeleteSocioeconomicProfile(patientId)

  const handleOpenCreate = () => {
    setIsEditing(false)
    setIsFormOpen(true)
  }

  const handleOpenEdit = () => {
    setIsEditing(true)
    setIsFormOpen(true)
  }

  const handleDeleteCurrent = async () => {
    if (!data?.current) return
    try {
      await deleteMutation.mutateAsync(data.current.id)
      setIsDeleteDialogOpen(false)
    } catch {
      // Error handled by mutation
    }
  }

  if (!canView) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center bg-card/40">
        <Receipt className="size-10 text-muted-foreground/50 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-foreground">Access Restricted</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          You do not have permission to view patient expense records.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="rounded-xl">
        <AlertCircle className="size-4" />
        <AlertTitle className="text-sm font-semibold">Failed to load expense records</AlertTitle>
        <AlertDescription className="text-xs mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>{(error as Error)?.message || "An unexpected network or server error occurred."}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-7 text-xs font-semibold gap-1.5 shrink-0 bg-background hover:bg-muted cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>Retry</span>
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const current = data?.current

  return (
    <div className="space-y-4 pb-8">
      {current ? (
        <>
          <SocioeconomicHeader
            current={current}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onEdit={handleOpenEdit}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <ExpensesCard
              house={current.house}
              lightSource={current.lightSource}
              waterSource={current.waterSource}
              expenses={current.expenses}
              total={current.total}
            />
            <IncomeCard
              income={current.income}
              onUpdate={canUpdate ? handleOpenEdit : undefined}
            />
          </div>

          <TrendCard history={data?.history || []} />
        </>
      ) : (
        <div className="rounded-xl border border-dashed p-10 text-center bg-card/40 space-y-4">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
            <Receipt className="size-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-semibold text-foreground">No List of Expenses Recorded</h3>
            <p className="text-xs text-muted-foreground">
              An expense and living assessment has not been recorded for {patient.fullName} yet.
            </p>
          </div>
          {canCreate && (
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="h-9 gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Record List of Expenses</span>
            </Button>
          )}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <ProfileFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        patientId={patientId}
        initialProfile={isEditing ? current : null}
        liveIncome={data?.liveIncome}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => !open && setIsDeleteDialogOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">Delete Expense Record</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground mt-1">
              Are you sure you want to delete this expense record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="text-xs font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCurrent}
              disabled={deleteMutation.isPending}
              className="text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Record"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
