import type { AppIcon } from "@/lib/icons"
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
} from "@/lib/icons"

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
  icon?: AppIcon
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmed",
  product_accepted: "Vendor accepted",
  shipped_to_warehouse: "Sent to warehouse",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  delivery_failed: "Delivery failed",
  customer_rejected: "Customer rejected",
  returning_to_warehouse: "Returning to warehouse",
  refund_processing: "Refund processing",
  refunded: "Refunded",
  cancelled: "Cancelled",
  awaiting_payment: "Awaiting payment",
}

export const FULFILLMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  partially_fulfilled: "Partially fulfilled",
  fulfilled: "Fulfilled",
  shipped: "Shipped",
  delivered: "Delivered",
  returned: "Returned",
  partially_returned: "Partially returned",
  cancelled: "Cancelled",
}

export const POST_SHIPMENT_STATUSES = [
  "shipped",
  "dispatched",
  "in_transit",
  "out_for_delivery",
  "delivered",
] as const

export function isPostShipmentStatus(status: string) {
  return (POST_SHIPMENT_STATUSES as readonly string[]).includes(status)
}

export const PRE_PACK_SHIPMENT_STATUSES = [
  "awaiting_items",
  "pending",
  "ready_to_pack",
] as const

export function isPrePackShipmentStatus(status: string) {
  return (PRE_PACK_SHIPMENT_STATUSES as readonly string[]).includes(status)
}

export function isPackedAwaitingShip(status: string) {
  return status === "packed"
}

export const SHIPMENT_STATUS_LABEL: Record<string, string> = {
  awaiting_items: "Awaiting items",
  pending: "Pending",
  ready_to_pack: "Ready to pack",
  packed: "Packed",
  shipped: "Shipped",
  dispatched: "Dispatched",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  delivery_failed: "Delivery failed",
  customer_rejected: "Customer rejected",
  returning_to_warehouse: "Returning to warehouse",
  returned_to_warehouse: "Returned to warehouse",
}

export const RETURN_STATUS_LABEL: Record<string, string> = {
  pending_warehouse_receipt: "Pending warehouse receipt",
  received_at_warehouse: "Received at warehouse",
  accepted: "Accepted",
  refund_processing: "Refund processing",
  refunded: "Refunded",
  damaged: "Damaged",
  inspection_rejected: "Inspection rejected",
  closed_without_refund: "Closed without refund",
}

export const RETURN_KIND_LABEL: Record<string, string> = {
  delivery_failed: "Delivery failed",
  customer_rejected: "Customer rejected",
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
  delivery_failed: "Delivery failed",
  customer_rejected: "Customer rejected",
  partially_rejected: "Partially rejected",
  cancelled: "Cancelled",
}

export const VENDOR_RETURN_SHIPMENT_STATUS_LABEL: Record<string, string> = {
  pending_dispatch_to_vendor: "Pending dispatch",
  in_transit_to_vendor: "In transit to vendor",
  received_by_vendor: "Received by vendor",
}

export function orderStatusBadge(status: string): StatusBadgeMeta {
  const name = ORDER_STATUS_LABEL[status] ?? status

  switch (status) {
    case "delivered":
      return { name, colors: badgeColors.active, icon: CheckCircle2 }
    case "cancelled":
      return { name, colors: badgeColors.rejected, icon: Ban }
    case "delivery_failed":
    case "customer_rejected":
      return { name, colors: badgeColors.rejected, icon: RefreshCcw }
    case "returning_to_warehouse":
    case "refund_processing":
      return { name, colors: badgeColors.under_review, icon: RefreshCcw }
    case "refunded":
      return { name, colors: badgeColors.rejected, icon: RefreshCcw }
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

export function returnStatusBadge(status: string): StatusBadgeMeta {
  const name = RETURN_STATUS_LABEL[status] ?? status.replaceAll("_", " ")

  switch (status) {
    case "refunded":
      return { name, colors: badgeColors.active, icon: CheckCircle2 }
    case "damaged":
    case "inspection_rejected":
    case "closed_without_refund":
      return { name, colors: badgeColors.rejected, icon: Ban }
    case "refund_processing":
    case "accepted":
    case "received_at_warehouse":
      return { name, colors: badgeColors.under_review, icon: Package }
    case "pending_warehouse_receipt":
      return { name, colors: badgeColors.submitted, icon: Truck }
    default:
      return { name, colors: badgeColors.neutral }
  }
}

export function fulfillmentStatusBadge(status: string): StatusBadgeMeta {
  const name = FULFILLMENT_STATUS_LABEL[status] ?? status

  switch (status) {
    case "fulfilled":
    case "delivered":
      return { name, colors: badgeColors.active, icon: PackageCheck }
    case "cancelled":
      return { name, colors: badgeColors.rejected, icon: Ban }
    case "returned":
    case "partially_returned":
      return { name, colors: badgeColors.rejected, icon: RefreshCcw }
    case "partially_fulfilled":
      return { name, colors: badgeColors.under_review, icon: Package }
    case "processing":
    case "shipped":
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
    case "delivery_failed":
    case "customer_rejected":
      return statusBadge(badgeColors.rejected)
    case "partially_rejected":
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

export function vendorReturnShipmentStatusBadge(
  status: string
): StatusBadgeMeta {
  const name =
    VENDOR_RETURN_SHIPMENT_STATUS_LABEL[status] ?? status.replaceAll("_", " ")

  switch (status) {
    case "received_by_vendor":
      return { name, colors: badgeColors.active, icon: CheckCircle2 }
    case "in_transit_to_vendor":
      return { name, colors: badgeColors.submitted, icon: Truck }
    case "pending_dispatch_to_vendor":
      return { name, colors: badgeColors.under_review, icon: Package }
    default:
      return { name, colors: badgeColors.neutral }
  }
}

export function formatMoney(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}
