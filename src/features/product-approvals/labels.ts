import type { ProductApprovalStatus, ProductStatus } from "./types"

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  active: "Active",
  archived: "Archived",
}

export const PRODUCT_APPROVAL_LABEL: Record<ProductApprovalStatus, string> = {
  pending: "Pending",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
}
