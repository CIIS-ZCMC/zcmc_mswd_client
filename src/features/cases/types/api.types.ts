export interface ApiCaseWatcher {
  id: number
  case_id: number
  patient_watcher_id: number | null
  name: string
  relationship: string
  contact_number: string | null
  address: string | null
  is_primary: boolean
  is_informant: boolean
  pass_number: string | null
  pass_valid_until: string | null
  pass_status: string
  present_from: string | null
  present_until: string | null
  added_by?: { id: number; name: string } | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ApiWatcherStatus {
  requirement: string
  has_primary: boolean
  satisfied: boolean
  blocking: boolean
}

export interface ApiWatcherRelationshipType {
  id: number
  name: string
  code: string
  created_at?: string
  updated_at?: string
}
