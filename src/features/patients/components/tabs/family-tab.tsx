import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"
import type { PatientRecord } from "../../types"

interface FamilyTabProps {
  patient: PatientRecord
  onOpenAddFamilyDialog: () => void
}

export const FamilyTab: React.FC<FamilyTabProps> = ({
  patient,
  onOpenAddFamilyDialog,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold">
            Family Composition &amp; Economic Dependency
          </CardTitle>
          <CardDescription className="text-xs">
            Household members and income breakdown.
          </CardDescription>
        </div>
        <Button
          size="default"
          className="gap-2 font-semibold h-10"
          onClick={onOpenAddFamilyDialog}
        >
          <Plus className="size-4" /> Add Family Member
        </Button>
      </CardHeader>
      <CardContent>
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Full Name</TableHead>
              <TableHead className="font-bold">Relationship</TableHead>
              <TableHead className="font-bold">Age</TableHead>
              <TableHead className="font-bold">Occupation</TableHead>
              <TableHead className="font-bold">Monthly Income</TableHead>
              <TableHead className="font-bold">Dependent Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patient.familyMembers.map((fam) => (
              <TableRow key={fam.id}>
                <TableCell className="font-bold text-foreground">{fam.fullName}</TableCell>
                <TableCell>{fam.relationship}</TableCell>
                <TableCell>{fam.age} yrs</TableCell>
                <TableCell>{fam.occupation || "N/A"}</TableCell>
                <TableCell className="font-mono font-semibold">
                  ₱{fam.monthlyIncome.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={fam.isDependent ? "secondary" : "outline"}
                    className="text-xs px-2.5 py-0.5"
                  >
                    {fam.isDependent ? "Dependent" : "Non-Dependent"}
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
