import type { LucideIcon } from "lucide-react"
import {
  Ban,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Loader2,
  Package,
  PackageCheck,
  RefreshCcw,
  Truck,
  Wallet,
} from "lucide-react"

import { badgeColors } from "@/components/shared"
import type { BadgeColorCodes } from "@/components/shared/universal-badge"

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

export type StatusBadgeMeta = {
  name: string
  colors: BadgeColorCodes
  icon?: LucideIcon
}

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

export function orderStatusBadge(status: string): StatusBadgeMeta {
  const name = ORDER_STATUS_LABEL[status] ?? status

  switch (status) {
    case "delivered":
      return { name, colors: badgeColors.active, icon: CheckCircle2 }
    case "cancelled":
      return { name, colors: badgeColors.rejected, icon: Ban }
    case "out_for_delivery":
      return { name, colors: badgeColors.submitted, icon: Truck }
    case "shipped_to_warehouse":
    case "product_accepted":
      return { name, colors: badgeColors.submitted, icon: Package }
    case "awaiting_payment":
      return { name, colors: badgeColors.under_review, icon: Wallet }
    case "confirmed":
      return { name, colors: badgeColors.submitted, icon: CheckCircle2 }
    default:
      return { name, colors: badgeColors.neutral }
  }
}

export function fulfillmentStatusBadge(status: string): StatusBadgeMeta {
  const name = FULFILLMENT_STATUS_LABEL[status] ?? status

  switch (status) {
    case "fulfilled":
      return { name, colors: badgeColors.active, icon: PackageCheck }
    case "cancelled":
      return { name, colors: badgeColors.rejected, icon: Ban }
    case "partially_fulfilled":
      return { name, colors: badgeColors.under_review, icon: Package }
    case "processing":
      return { name, colors: badgeColors.submitted, icon: Loader2 }
    case "pending":
      return { name, colors: badgeColors.draft, icon: Clock3 }
    default:
      return { name, colors: badgeColors.neutral }
  }
}

export function paymentStatusBadge(status: string): StatusBadgeMeta {
  const name = PAYMENT_STATUS_LABEL[status] ?? status

  switch (status) {
    case "paid":
      return { name, colors: badgeColors.active, icon: CircleDollarSign }
    case "refunded":
      return { name, colors: badgeColors.rejected, icon: RefreshCcw }
    case "partially_paid":
      return { name, colors: badgeColors.under_review, icon: Wallet }
    case "unpaid":
      return { name, colors: badgeColors.draft, icon: Clock3 }
    default:
      return { name, colors: badgeColors.neutral }
  }
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
