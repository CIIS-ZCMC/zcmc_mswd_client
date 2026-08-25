export type DocumentCategory =
  | "Indigency"
  | "Medical Abstract"
  | "Billing Statement"
  | "Prescription"
  | "Government ID"

export type DocumentStatus = "Verified" | "Pending Review" | "Action Needed"

export interface DocumentItem {
  id: string
  title: string
  category: DocumentCategory
  uploadDate: string
  status: DocumentStatus
  fileSize: string
}
