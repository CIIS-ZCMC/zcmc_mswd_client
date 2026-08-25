export type WatcherPassStatus = "Active" | "Expired" | "Revoked"

export interface Watcher {
  id: string
  fullName: string
  relationship: string
  contactNo: string
  passNo: string
  validUntil: string
  status: WatcherPassStatus
}
