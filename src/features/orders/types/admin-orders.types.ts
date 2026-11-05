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

export type VendorOrderRejectionLineSummary = {
  variantId: string
  productId: string
  productName: string
  sku: string
  orderedQty: number
  acceptedQty: number
  rejectedQty: number
  unitPrice: number
  disposition: string | null
}

export type VendorReturnShipmentLine = {
  variantId: string
  productId: string
  productName: string
  sku: string
  quantity: number
}

export type VendorReturnShipment = {
  id: string
  returnRequestId: string
  vendorOrderId: string
  parentOrderId: string
  storeId: string
  vendorUserId: string
  status: string
  lines: VendorReturnShipmentLine[]
  carrier: string
  trackingNumber: string
  dispatchedAt: string | null
  receivedByVendorAt: string | null
  createdAt: string
  updatedAt: string
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
  vendorReturnShipments?: VendorReturnShipment[]
  rejectionSummary?: VendorOrderRejectionLineSummary[]
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

export type AdminDeliveryReturnLine = {
  variantId: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  disposition: string
}

export type AdminDeliveryReturn = {
  id: string
  kind: "delivery_failed" | "customer_rejected" | string
  status: string
  reason: string
  refundAmount: number | null
  cashRefundAmount: number
  balanceWaivedAmount: number
  deliveryFeeRefund: number
  lines: AdminDeliveryReturnLine[]
  createdAt: string
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
    amountRefunded?: number
    balanceDue: number
    refundableAmount?: number
    codCollectionStatus: string
  }
  totals: AdminOrderTotals
  shipment: AdminShipment | null
  returns?: AdminDeliveryReturn[]
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

export type DeliveryReturnLinePayload = {
  variantId: string
  quantity: number
}

export type UpdateAdminOrderStatusPayload = {
  status:
    | "packed"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "delivery_failed"
    | "customer_rejected"
    | "returning_to_warehouse"
    | "returned_to_warehouse"
  carrier?: string
  trackingNumber?: string
  reason?: string
  returnId?: string
  lines?: DeliveryReturnLinePayload[]
}

export type InspectReturnLinePayload = {
  variantId: string
  disposition: "sellable" | "damaged"
}

export type ResolveReturnPayload = {
  action: "refund_without_restock" | "close_without_refund"
  note?: string
}

export type AdminReturnListItem = {
  id: string
  parentOrderId: string
  shipmentId: string | null
  vendorOrderId: string | null
  storeId: string | null
  kind: string
  status: string
  reason: string
  merchandiseRefund: number
  couponShare: number
  deliveryFeeRefund: number
  cashRefundAmount: number
  balanceWaivedAmount: number
  refundAmount: number | null
  processedAt: string | null
  createdAt: string
  updatedAt: string
  lines?: Array<{
    vendorOrderId: string
    variantId: string
    productName: string
    sku: string
    quantity: number
    unitPrice: number
    disposition: string
  }>
}

export type ListAdminReturnsParams = {
  page?: number
  limit?: number
  status?: string
  kind?: string
  parentOrderId?: string
}

export type ListAdminReturnsResult = {
  items: AdminReturnListItem[]
  pagination: PaginationMeta
}

export type ListAdminVendorReturnShipmentsParams = {
  page?: number
  limit?: number
  status?: string
  storeId?: string
  parentOrderId?: string
}

export type ListAdminVendorReturnShipmentsResult = {
  items: VendorReturnShipment[]
  pagination: PaginationMeta
}

export type DispatchVendorReturnShipmentPayload = {
  carrier?: string
  trackingNumber?: string
}

export type RefundPreview = {
  merchandiseRefund: number
  couponShare: number
  deliveryFeeRefund: number
  cashRefundAmount: number
  balanceWaivedAmount: number
  refundAmount: number
}

export type CodCollectionPayload = {
  amountCollected: number
  courierReference?: string
}

export type CodRemittancePayload = {
  remittedAmount: number
}
