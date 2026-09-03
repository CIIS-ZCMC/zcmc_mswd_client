import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Edit, Heart, MapPin, Phone, User } from "lucide-react"
import { useUpdatePatientBackground } from "../../hooks/use-patient-writes"
import type { PatientRecord } from "../../types"
import { PatientBackgroundDialog } from "../dialogs/patient-background-dialog"

interface ProfileTabProps {
  patient: PatientRecord
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ patient }) => {
  const [isEditingBackground, setIsEditingBackground] = useState(false)
  const updateBackground = useUpdatePatientBackground(patient.id)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 font-bold">
            <User className="size-5 text-primary" /> Personal Demographics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground font-medium text-xs">Full Name:</span>
            <p className="font-bold text-base text-foreground mt-0.5">{patient.fullName}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-border/50 pt-2">
            <div>
              <span className="text-muted-foreground font-medium text-xs">Age / Gender:</span>
              <p className="font-semibold text-sm">
                {patient.age} yrs / {patient.gender}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground font-medium text-xs">Birth Date:</span>
              <p className="font-semibold text-sm">{patient.birthDate}</p>
            </div>
          </div>
          <div className="border-t border-border/50 pt-2">
            <span className="text-muted-foreground font-medium text-xs">Civil Status:</span>
            <p className="font-semibold text-sm">{patient.civilStatus}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 font-bold">
            <MapPin className="size-5 text-primary" /> Address &amp; Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground font-medium text-xs">Contact Number:</span>
            <p className="font-semibold text-sm flex items-center gap-1.5 text-foreground mt-0.5">
              <Phone className="size-4 text-primary" /> {patient.contactNo}
            </p>
          </div>
          <div className="border-t border-border/50 pt-2">
            <span className="text-muted-foreground font-medium text-xs">Barangay:</span>
            <p className="font-semibold text-sm">
              {patient.barangay}, {patient.city}
            </p>
          </div>
          <div className="border-t border-border/50 pt-2">
            <span className="text-muted-foreground font-medium text-xs">Full Address:</span>
            <p className="font-medium text-sm text-foreground">{patient.address}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 font-bold">
            <Heart className="size-5 text-primary" /> Admission &amp; Medical Diagnosis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground font-medium text-xs">
              Admission Status:
            </span>
            <p className="font-bold text-sm text-primary mt-0.5">
              {patient.admissionStatus}
            </p>
          </div>
          <div className="border-t border-border/50 pt-2">
            <span className="text-muted-foreground font-medium text-xs">Ward &amp; Bed:</span>
            <p className="font-semibold text-sm">
              {patient.ward} - {patient.bedNo}
            </p>
          </div>
          <div className="border-t border-border/50 pt-2">
            <span className="text-muted-foreground font-medium text-xs">
              Clinical Diagnosis:
            </span>
            <p className="font-semibold text-sm text-foreground leading-relaxed">
              {patient.diagnosis}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 font-bold">
            <Briefcase className="size-5 text-primary" /> Background &amp; Economic Profile
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs gap-1.5 font-semibold"
            onClick={() => setIsEditingBackground(true)}
          >
            <Edit className="size-3.5" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 text-sm">
          <div>
            <span className="text-muted-foreground font-medium text-xs">Religion:</span>
            <p className="font-semibold text-sm">{patient.religion || "Not on file"}</p>
          </div>
          <div>
            <span className="text-muted-foreground font-medium text-xs">Nationality:</span>
            <p className="font-semibold text-sm">{patient.nationality || "Not on file"}</p>
          </div>
          <div>
            <span className="text-muted-foreground font-medium text-xs">Place of Birth:</span>
            <p className="font-semibold text-sm">{patient.placeOfBirth || "Not on file"}</p>
          </div>
          <div>
            <span className="text-muted-foreground font-medium text-xs">Educational Attainment:</span>
            <p className="font-semibold text-sm">{patient.educationalAttainment || "Not on file"}</p>
          </div>
          <div>
            <span className="text-muted-foreground font-medium text-xs">Permanent Address:</span>
            <p className="font-semibold text-sm">{patient.permanentAddress || "Not on file"}</p>
          </div>
          <div>
            <span className="text-muted-foreground font-medium text-xs">Present Address:</span>
            <p className="font-semibold text-sm">{patient.presentAddress || "Not on file"}</p>
          </div>
          <div>
            <span className="text-muted-foreground font-medium text-xs">Occupation:</span>
            <p className="font-semibold text-sm">{patient.occupation || "Not on file"}</p>
          </div>
          <div>
            <span className="text-muted-foreground font-medium text-xs">Employer:</span>
            <p className="font-semibold text-sm">{patient.employer || "Not on file"}</p>
          </div>
          <div>
            <span className="text-muted-foreground font-medium text-xs">Monthly Income:</span>
            <p className="font-semibold text-sm font-mono">
              {patient.monthlyIncome != null ? `₱${patient.monthlyIncome.toLocaleString()}` : "Not on file"}
            </p>
          </div>
        </CardContent>
      </Card>

      <PatientBackgroundDialog
        isOpen={isEditingBackground}
        onClose={() => setIsEditingBackground(false)}
        patient={patient}
        isSaving={updateBackground.isPending}
        onSave={(payload) =>
          updateBackground.mutate(payload, { onSuccess: () => setIsEditingBackground(false) })
        }
      />
    </div>
  )
}
