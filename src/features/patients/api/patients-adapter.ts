/**
 * Assembles the UI's `PatientRecord` shape (designed around a flat,
 * single-episode mock model) from the backend's normalized, episode-driven
 * resources (Patient, Case, Assessment, ...).
 *
 * Ground rules applied throughout (per product decision, 2026-08-31):
 *  - Never fabricate a value for a field the backend doesn't track. Real
 *    data or an honest placeholder ("Not on file", "Not tracked") — never a
 *    plausible-looking guess. This matters more than usual here: this is a
 *    hospital case-management system, and an invented physician's name or
 *    classification would be actively misleading, not just a UI nicety.
 *  - "Most recent case" stands in for "the patient's episode" everywhere a
 *    single case/classification is expected. A patient with two concurrent
 *    open cases will only show one here — known limitation, not a bug.
 *  - Intake Sheets are intentionally NOT wired to real data yet (separate
 *    phase) — always returns `[]`. The tab's add/edit flow still works
 *    against local-only state via `usePatientMutations`, same as before.
 */
import type { FamilyMember, MedicalCategory, StaffAssignment } from "../types/case-study.types"
import type { DocumentItem } from "../types/document.types"
import type { AuditHistory } from "../types/audit.types"
import type { PatientRecord } from "../types/patient.types"
import type { Watcher } from "../types/watcher.types"
import type {
  ApiActivity,
  ApiAssessment,
  ApiCase,
  ApiDocument,
  ApiFamilyMember,
  ApiPatient,
  ApiPatientId,
  ApiWatcher,
} from "../types/api.types"

const NOT_ON_FILE = "Not on file"
const NOT_TRACKED = "Not tracked"

export interface PatientDetailExtras {
  latestCase?: ApiCase | null
  latestAssessment?: ApiAssessment | null
  history?: ApiActivity[]
}

/**
 * `raw.patient_ids[].id_type` is a completely free-text Filament field (no
 * select options, no enum) — there is no defined convention for how
 * "PhilHealth" vs "Senior Citizen" vs "PWD" get spelled. This does a
 * best-effort case-insensitive match against real stored records; it never
 * invents a number. Revisit once real data-entry conventions are settled.
 */
function findIdNumber(patientIds: ApiPatientId[] | undefined, keywords: string[]): string | undefined {
  if (!patientIds) return undefined
  const match = patientIds.find((pid) =>
    keywords.some((kw) => pid.id_type.toLowerCase().includes(kw))
  )
  return match?.id_number
}

function buildFullName(raw: ApiPatient): string {
  const middleInitial = raw.middle_name ? `${raw.middle_name.charAt(0)}.` : ""
  return [raw.first_name, middleInitial, raw.last_name, raw.extension_name]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
}

function computeAge(birthdate: string | null): number {
  if (!birthdate) return 0
  const dob = new Date(birthdate)
  if (Number.isNaN(dob.getTime())) return 0
  const diff = Date.now() - dob.getTime()
  return Math.max(0, Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)))
}

/**
 * Backend `classification` values (per the assessments migration comment):
 * indigent, low_income, self_sufficient, others. No enum is enforced, so
 * anything else stored gets a generic title-case fallback rather than
 * being hidden.
 */
function classificationLabel(raw: string | undefined | null): MedicalCategory {
  if (!raw) return "Unclassified"
  const known: Record<string, string> = {
    indigent: "Indigent",
    low_income: "Low Income",
    self_sufficient: "Self-Sufficient",
    others: "Others",
  }
  return known[raw] ?? raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function buildClassificationSummary(assessment: ApiAssessment | null | undefined): string {
  if (!assessment) return "No assessment recorded yet."
  const parts: string[] = []
  if (assessment.housing_type) parts.push(`Housing: ${assessment.housing_type}`)
  if (assessment.utilities_access) parts.push(`Utilities: ${assessment.utilities_access}`)
  if (assessment.total_family_income != null) {
    parts.push(`Monthly family income: ₱${Number(assessment.total_family_income).toLocaleString()}`)
  }
  return parts.length > 0 ? parts.join(" • ") : "No income/housing basis recorded."
}

function toFamilyMember(raw: ApiFamilyMember): FamilyMember {
  return {
    id: String(raw.id),
    fullName: raw.name,
    relationship: raw.relationship ?? "",
    age: raw.age ?? 0,
    occupation: raw.occupation ?? "",
    monthlyIncome: raw.monthly_income != null ? Number(raw.monthly_income) : 0,
    isDependent: raw.is_living_with_patient,
  }
}

function toWatcher(raw: ApiWatcher): Watcher {
  return {
    id: String(raw.id),
    fullName: raw.name,
    relationship: raw.relationship ?? "",
    contactNo: raw.contact_number ?? "",
    // No pass-number/expiry/status columns exist on the backend at all.
    passNo: NOT_TRACKED,
    validUntil: "—",
    status: NOT_TRACKED,
  }
}

function toDocumentItem(raw: ApiDocument): DocumentItem {
  return {
    id: String(raw.id),
    title: raw.file_name,
    category: raw.document_type,
    uploadDate: raw.created_at,
    // No verification workflow or size tracking on the Document model.
    status: NOT_TRACKED,
    fileSize: "—",
  }
}

function toAuditHistory(raw: ApiActivity): AuditHistory {
  return {
    id: String(raw.id),
    timestamp: raw.created_at,
    action: raw.event ? raw.event.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : raw.subject_type,
    performedBy: raw.causer?.name ?? "System",
    details: raw.description,
  }
}

function buildAssignedStaff(latestCase: ApiCase | null | undefined): StaffAssignment {
  return {
    socialWorker: latestCase?.assigned_user?.name ?? "Unassigned",
    // No RSW license field exists on the User model.
    socialWorkerId: NOT_ON_FILE,
    // No case-officer role exists separately from the assigned social worker.
    caseOfficer: NOT_ON_FILE,
    // Attending physician is clinical data — out of scope for this system
    // per the project's own module boundaries; never sourced from MSS data.
    attendingPhysician: "Not tracked (outside MSS system scope)",
    assignedDate: latestCase?.date_opened ?? "",
    shift: "Morning",
  }
}

/**
 * List-view mapping: demographics only, no per-patient case/assessment
 * fetch (that would be N+1 across a whole page of patients). Category,
 * ward/bed, admission status and intake date are only available once a
 * patient's detail is opened — see `toPatientDetailRecord`.
 */
export function toPatientListRecord(raw: ApiPatient): PatientRecord {
  return {
    id: String(raw.id),
    hospitalNo: raw.hospital_id != null ? String(raw.hospital_id) : "—",
    mswdNo: raw.mswd_id != null ? String(raw.mswd_id) : "—",
    fullName: buildFullName(raw),
    age: raw.estimated_age ?? computeAge(raw.birthdate),
    gender: raw.sex,
    birthDate: raw.birthdate ?? "",
    civilStatus: raw.civil_status ?? "",
    contactNo: raw.contact_number ?? "",
    address: raw.address ?? "",
    barangay: raw.barangay ?? "",
    city: raw.municipality ?? "",
    intakeDate: raw.created_at,
    admissionStatus: "Unknown",
    ward: NOT_ON_FILE,
    bedNo: NOT_ON_FILE,
    diagnosis: "Not recorded in this view",
    category: "Unclassified",
    philHealthNo: findIdNumber(raw.patient_ids, ["philhealth", "phic"]) ?? "",
    seniorCitizenId: findIdNumber(raw.patient_ids, ["senior"]),
    pwdId: findIdNumber(raw.patient_ids, ["pwd"]),
    religion: raw.religion ?? undefined,
    nationality: raw.nationality ?? undefined,
    placeOfBirth: raw.place_of_birth ?? undefined,
    permanentAddress: raw.permanent_address ?? undefined,
    presentAddress: raw.present_address ?? undefined,
    educationalAttainment: raw.educational_attainment ?? undefined,
    occupation: raw.occupation ?? undefined,
    employer: raw.employer ?? undefined,
    monthlyIncome: raw.monthly_income != null ? Number(raw.monthly_income) : undefined,
    familyMembers: (raw.family_members ?? []).map(toFamilyMember),
    watchers: (raw.watchers ?? []).map(toWatcher),
    assignedStaff: buildAssignedStaff(null),
    caseStudy: {
      caseNumber: "No active case",
      assessmentDate: "",
      category: "Unclassified",
      classificationDetails: buildClassificationSummary(null),
      presentingProblem: "",
      socialWorkerNotes: "",
      // Belongs to the (separately phased) Financial Assistance module.
      recommendedAssistance: NOT_ON_FILE,
      approvedAmount: undefined,
    },
    documents: (raw.documents ?? []).map(toDocumentItem),
    history: [],
  }
}

/**
 * Detail-view mapping: the same base fields as the list, enriched with the
 * patient's most recent case + assessment + audit history — the extra
 * calls `usePatientDetail` makes that a list row doesn't.
 */
export function toPatientDetailRecord(raw: ApiPatient, extras: PatientDetailExtras): PatientRecord {
  const base = toPatientListRecord(raw)
  const { latestCase, latestAssessment, history = [] } = extras

  return {
    ...base,
    intakeDate: latestCase?.date_opened ?? base.intakeDate,
    admissionStatus: latestCase?.admission_type ?? "Unknown",
    category: classificationLabel(latestAssessment?.classification),
    assignedStaff: buildAssignedStaff(latestCase),
    caseStudy: {
      caseNumber: latestCase?.case_code ?? "No active case",
      assessmentDate: latestAssessment?.created_at ?? "",
      category: classificationLabel(latestAssessment?.classification),
      classificationDetails: buildClassificationSummary(latestAssessment),
      presentingProblem: latestAssessment?.presenting_problem ?? "",
      socialWorkerNotes: latestAssessment?.assessment_notes ?? "",
      recommendedAssistance: NOT_ON_FILE,
      approvedAmount: undefined,
    },
    history: history.map(toAuditHistory),
  }
}
