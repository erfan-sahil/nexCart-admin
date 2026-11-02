import type { PaginationMeta } from "@/lib/api/types"

import type { FulfillmentRejectionReason } from "../labels"

export type AdminOrderListItem = {
  id: string
  orderNumber: string
  status: string
  fulfillmentStatus: string
  paymentStatus: string
  paymentMethod: string
  grandTotal: number
  currency: string
  vendorOrderCount: number
  createdAt: string
}

export type AdminOrderLineItem = {
  variantId: string
  productId: string
  productName: string
  sku: string
  quantity: number
  expectedQty: number
  targetQty: number
  acceptedQtyCumulative: number
  unitPrice: number
  lineTotal: number
}

export type InboundBatchLine = {
  variantId: string
  sku: string
  productName: string
  sentQty: number
  acceptedQty: number
  rejectedQty: number
  rejectionReason: string | null
  rejectionNote: string
}

export type InboundBatch = {
  id: string
  sequence: number
  status: string
  lines: InboundBatchLine[]
  dispatchedAt: string
  receivedAt: string | null
  inspectedAt: string | null
}

export type RejectReturnLine = {
  variantId: string
  sku: string
  quantity: number
  rejectionReason: string
  rejectionNote: string
}

export type RejectReturn = {
  id: string
  inboundBatchId: string
  status: string
  lines: RejectReturnLine[]
  sentToVendorAt: string | null
  receivedByVendorAt: string | null
}

export type AdminVendorOrder = {
  id: string
  parentOrderId: string
  orderNumber: string
  vendorOrderNumber: string
  storeId: string
  storeName: string
  status: string
  items: AdminOrderLineItem[]
  itemsSubtotal: number
  inboundBatches: InboundBatch[]
  rejectReturns: RejectReturn[]
  createdAt: string
  updatedAt: string
}

export type AdminShipment = {
  status: string
  carrier: string
  trackingNumber: string
  packedAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
}

export type AdminOrderActivity = {
  id: string
  parentOrderId: string
  vendorOrderId: string | null
  actorUserId: string
  actorRole: string
  action: string
  metadata: Record<string, unknown> | null
  createdAt: string
}

export type AdminOrderTotals = {
  itemsSubtotal: number
  discountTotal: number
  deliveryFee: number
  grandTotal: number
}

export type AdminOrderDetail = AdminOrderListItem & {
  shipping: {
    recipientName: string
    phone: string
    line1: string
    line2: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  payment: {
    amountPaid: number
    balanceDue: number
    codCollectionStatus: string
  }
  totals: AdminOrderTotals
  shipment: AdminShipment | null
  vendorOrders: AdminVendorOrder[]
  activity: AdminOrderActivity[]
  canCancel: boolean
}

export type ListAdminOrdersParams = {
  page?: number
  limit?: number
  search?: string
  fulfillmentStatus?: string
  paymentStatus?: string
  sort?: "createdAt" | "-createdAt"
}

export type ListAdminOrdersResult = {
  items: AdminOrderListItem[]
  pagination: PaginationMeta
}

export type AdminVendorOrderListItem = Pick<
  AdminVendorOrder,
  | "id"
  | "parentOrderId"
  | "orderNumber"
  | "vendorOrderNumber"
  | "storeName"
  | "status"
  | "itemsSubtotal"
  | "updatedAt"
>

export type ListAdminVendorOrdersParams = {
  page?: number
  limit?: number
  search?: string
  status?: string
  sort?: "createdAt" | "-createdAt" | "updatedAt" | "-updatedAt"
}

export type ListAdminVendorOrdersResult = {
  items: AdminVendorOrderListItem[]
  pagination: PaginationMeta
}

export type InspectLinePayload = {
  variantId: string
  acceptedQty: number
  rejectedQty: number
  rejectionReason?: FulfillmentRejectionReason
  rejectionNote?: string
}

export type UpdateAdminVendorOrderStatusPayload = {
  status: string
  items?: InspectLinePayload[]
  rejectReturnId?: string
  adjustQuantities?: { variantId: string; targetQty: number }[]
}

export type UpdateAdminOrderStatusPayload = {
  status: "packed" | "shipped" | "out_for_delivery" | "delivered" | "cancelled"
  carrier?: string
  trackingNumber?: string
}

export type CodCollectionPayload = {
  amountCollected: number
  courierReference?: string
}

export type CodRemittancePayload = {
  remittedAmount: number
}
