import type {
  VendorApplicationStatus,
  VendorBusinessType,
  VendorDocumentType,
} from "./types"

export const STATUS_LABEL: Record<VendorApplicationStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  more_info_required: "More info",
  approved: "Approved",
  rejected: "Rejected",
}

export const BUSINESS_TYPE_LABEL: Record<VendorBusinessType, string> = {
  individual: "Individual",
  company: "Company",
}

export const DOCUMENT_TYPE_LABEL: Record<VendorDocumentType, string> = {
  nid: "National ID",
  passport: "Passport",
}
