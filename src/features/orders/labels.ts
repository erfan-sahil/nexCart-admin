import type { BadgeColorCodes } from "@/components/shared/universal-badge"

import { badgeColors } from "@/components/shared"

export const FULFILLMENT_REJECTION_REASONS = [
  "damaged",
  "incorrect",
  "missing",
  "other",
] as const

export type FulfillmentRejectionReason =
  (typeof FULFILLMENT_REJECTION_REASONS)[number]

export const REJECTION_REASON_LABEL: Record<
  FulfillmentRejectionReason,
  string
> = {
  damaged: "Damaged",
  incorrect: "Incorrect item",
  missing: "Missing",
  other: "Other",
}

const statusBadge = (
  colors: BadgeColorCodes = badgeColors.neutral
): BadgeColorCodes => colors

export const ORDER_STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmed",
  product_accepted: "Vendor accepted",
  shipped_to_warehouse: "Sent to warehouse",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  awaiting_payment: "Awaiting payment",
}

export const FULFILLMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  partially_fulfilled: "Partially fulfilled",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
}

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  unpaid: "Unpaid",
  partially_paid: "Partially paid",
  paid: "Paid",
  refunded: "Refunded",
}

export const VENDOR_ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Pending vendor",
  accepted: "Accepted",
  preparing: "Preparing",
  sending_to_warehouse: "In transit to warehouse",
  received_at_warehouse: "Received",
  inspecting: "Inspecting",
  accepted_at_warehouse: "Accepted at warehouse",
  partially_accepted: "Partially accepted",
  rejected_at_warehouse: "Rejected at warehouse",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export function vendorOrderStatusBadge(status: string): BadgeColorCodes {
  switch (status) {
    case "delivered":
    case "accepted_at_warehouse":
      return statusBadge(badgeColors.active)
    case "cancelled":
    case "rejected_at_warehouse":
      return statusBadge(badgeColors.rejected)
    case "partially_accepted":
    case "inspecting":
      return statusBadge(badgeColors.under_review)
    case "sending_to_warehouse":
    case "received_at_warehouse":
      return statusBadge(badgeColors.submitted)
    default:
      return statusBadge()
  }
}

export function formatMoney(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}
