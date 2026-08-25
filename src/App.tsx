import { useState, useEffect } from "react"
import { MOCK_PATIENTS, type PatientRecord } from "@/data/patients-data"
import { MswdSidebar } from "@/components/mswd/mswd-sidebar"
import { MswdPatientView } from "@/components/mswd/mswd-patient-view"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ShieldCheck,
  Moon,
  Sun,
  Plus,
  UserCheck,
  Activity,
} from "lucide-react"

export function App() {
  const [patients, setPatients] = useState<PatientRecord[]>(MOCK_PATIENTS)
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    MOCK_PATIENTS[0]?.id || ""
  )
  const [isDark, setIsDark] = useState(false)

  const selectedPatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === "d" &&
        !["input", "textarea"].includes((e.target as HTMLElement)?.tagName?.toLowerCase())
      ) {
        setIsDark((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  const handleUpdatePatient = (updatedPatient: PatientRecord) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    )
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col bg-background text-foreground transition-colors duration-200 overflow-hidden font-sans">
        {/* Senior-Friendly Navbar */}
        <header className="flex h-15 shrink-0 items-center justify-between border-b border-border bg-card px-5 py-2.5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold font-heading text-lg shadow-xs">
                Z
              </div>
              <div>
                <h1 className="font-heading text-base font-bold tracking-tight leading-none text-foreground">
                  ZCMC Medical Social Services
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Zamboanga City Medical Center • Patient Safety Net Portal
                </p>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:flex gap-1.5 text-xs px-2.5 py-1">
              <Activity className="size-3.5 text-emerald-500" /> Live Database
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button size="default" className="gap-2 font-bold h-10 px-4">
              <Plus className="size-4" /> New Patient Intake
            </Button>
            <div className="h-5 w-px bg-border mx-1" />
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground mr-2">
              <UserCheck className="size-4 text-primary" />
              <span className="font-semibold text-foreground text-sm">Maria Santos, RSW</span>
            </div>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  size="default"
                  className="h-10 w-10 p-0"
                  onClick={() => setIsDark(!isDark)}
                >
                  {isDark ? <Sun className="size-4" /> : <Moon className="size-4 text-primary" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Theme (Press &apos;d&apos;)</TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Master-Detail Split Workspace */}
        <div className="flex flex-1 overflow-hidden">
          <MswdSidebar
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
          />
          <main className="flex-1 overflow-hidden">
            {selectedPatient ? (
              <MswdPatientView
                patient={selectedPatient}
                onUpdatePatient={handleUpdatePatient}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <ShieldCheck className="size-12 stroke-1 opacity-50 mb-3" />
                <p className="text-base font-bold">No Patient Selected</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default App
