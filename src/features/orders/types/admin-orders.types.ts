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

export type AdminVendorOrder = {
  id: string
  vendorOrderNumber: string
  storeName: string
  status: string
  itemsSubtotal: number
}

export type AdminOrderActivity = {
  id: string
  action: string
  actorRole: string
  createdAt: string
}

export type AdminOrderDetail = AdminOrderListItem & {
  shipping: {
    recipientName: string
    phone: string
    line1: string
    city: string
  }
  payment: {
    amountPaid: number
    balanceDue: number
    codCollectionStatus: string
  }
  vendorOrders: AdminVendorOrder[]
  activity: AdminOrderActivity[]
  canCancel: boolean
}

export type ListAdminOrdersParams = {
  page?: number
  limit?: number
  search?: string
}

export type ListAdminOrdersResult = {
  items: AdminOrderListItem[]
  pagination: { page: number; limit: number; total: number }
}
