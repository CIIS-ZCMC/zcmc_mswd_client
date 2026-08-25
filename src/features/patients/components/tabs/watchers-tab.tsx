import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"
import type { PatientRecord } from "../../types"

interface WatchersTabProps {
  patient: PatientRecord
  onOpenAddWatcherDialog: () => void
}

export const WatchersTab: React.FC<WatchersTabProps> = ({
  patient,
  onOpenAddWatcherDialog,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold">
            Registered Hospital Watchers &amp; Bystander Passes
          </CardTitle>
          <CardDescription className="text-xs">
            Authorized watchers with active ZCMC ward access passes.
          </CardDescription>
        </div>
        <Button
          size="default"
          className="gap-2 font-semibold h-10"
          onClick={onOpenAddWatcherDialog}
        >
          <Plus className="size-4" /> Issue Watcher Pass
        </Button>
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
                <TableCell className="font-bold text-foreground">
                  {watch.fullName}
                </TableCell>
                <TableCell>{watch.relationship}</TableCell>
                <TableCell className="font-mono font-semibold">
                  {watch.contactNo}
                </TableCell>
                <TableCell className="font-mono text-primary font-bold">
                  {watch.passNo}
                </TableCell>
                <TableCell>{watch.validUntil}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-emerald-600 border-emerald-500 text-xs px-2.5 py-0.5"
                  >
                    {watch.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
