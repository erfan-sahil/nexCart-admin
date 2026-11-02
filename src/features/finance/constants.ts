import { badgeColors } from "@/components/shared"
import type { BadgeColorCodes } from "@/components/shared"

export const WITHDRAWAL_STATUS_LABEL: Record<string, string> = {
  pending: "Pending review",
  approved: "Approved",
  processing: "Processing",
  paid: "Paid",
  rejected: "Rejected",
  cancelled: "Cancelled",
}

export const WITHDRAWAL_STATUS_COLORS: Record<string, BadgeColorCodes> = {
  pending: badgeColors.under_review,
  approved: badgeColors.approved,
  processing: badgeColors.submitted,
  paid: badgeColors.active,
  rejected: badgeColors.rejected,
  cancelled: badgeColors.draft,
}

export const PAYOUT_METHOD_LABEL: Record<string, string> = {
  bank: "Bank transfer",
  bkash: "bKash",
  nagad: "Nagad",
}

export const WITHDRAWAL_STATUS_TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "processing", label: "Processing" },
  { value: "paid", label: "Paid" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
] as const
