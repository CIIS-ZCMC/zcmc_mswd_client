export {
  usePatients,
  usePatient,
  usePatientIds,
  usePatientFamily,
  usePatientWatchers,
  usePatientCaretakers,
  usePatientDocuments,
  usePatientHistory,
  usePatientDuplicates,
  useCreatePatient,
  useUpdatePatient,
  useArchivePatient,
  useRestorePatient,
  useMergePatient,
  useUnmergePatient,
  patientKeys,
} from './queries'
export { patientsApi } from './api'
export { patientFullName, patientAge, patientFormSchema, SEXES, CIVIL_STATUSES } from './schemas'
export type {
  Patient,
  PatientFormInput,
  PatientFormOutput,
  PatientId,
  FamilyMember,
  Watcher,
  Caretaker,
  PatientDocument,
  PatientActivity,
} from './schemas'
