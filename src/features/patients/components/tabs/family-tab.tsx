import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Users } from "lucide-react"
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
    <Card className="shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/40">
        <div>
          <CardTitle className="text-xl font-extrabold flex items-center gap-2.5">
            <Users className="size-6 text-primary" /> Family Composition &amp; Economic Dependency
          </CardTitle>
          <CardDescription className="text-sm mt-1">
            Household members, employment status, and monthly income breakdown for {patient.fullName}.
          </CardDescription>
        </div>
        <Button
          variant="default"
          size="default"
          className="h-11 px-5 text-base font-bold gap-2 shadow-xs cursor-pointer"
          onClick={onOpenAddFamilyDialog}
        >
          <Plus className="size-5" /> Add Family Member
        </Button>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="overflow-x-auto">
          <Table className="text-base">
            <TableHeader>
              <TableRow className="border-b border-border/60">
                <TableHead className="font-extrabold text-foreground text-base">Full Name</TableHead>
                <TableHead className="font-extrabold text-foreground text-base">Relationship</TableHead>
                <TableHead className="font-extrabold text-foreground text-base">Age</TableHead>
                <TableHead className="font-extrabold text-foreground text-base">Sex</TableHead>
                <TableHead className="font-extrabold text-foreground text-base">Contact Number</TableHead>
                <TableHead className="font-extrabold text-foreground text-base">Occupation</TableHead>
                <TableHead className="font-extrabold text-foreground text-base">Educational Attainment</TableHead>
                <TableHead className="font-extrabold text-foreground text-base">Monthly Income</TableHead>
                <TableHead className="font-extrabold text-foreground text-base">Living With Patient</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patient.familyMembers.map((fam) => (
                <TableRow key={fam.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-bold text-foreground text-base">{fam.fullName}</TableCell>
                  <TableCell className="font-medium text-base">{fam.relationship}</TableCell>
                  <TableCell className="font-medium text-base">{fam.age} yrs</TableCell>
                  <TableCell className="capitalize font-medium text-base">{fam.sex || "N/A"}</TableCell>
                  <TableCell className="font-mono font-medium text-base">{fam.contactNumber || "N/A"}</TableCell>
                  <TableCell className="font-medium text-base">{fam.occupation || "N/A"}</TableCell>
                  <TableCell className="font-medium text-base">{fam.educationalAttainment || "N/A"}</TableCell>
                  <TableCell className="font-mono font-bold text-primary text-base">
                    ₱{fam.monthlyIncome.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={fam.isLivingWithPatient ? "secondary" : "outline"}
                      className="text-xs px-3 py-1 font-bold"
                    >
                      {fam.isLivingWithPatient ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

