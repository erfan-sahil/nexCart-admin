import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess, PaginationMeta } from "@/lib/api/types"

export type InboundShipment = {
  id: string
  orderNumber: string
  storeName: string
  status: string
  inboundCarrier: string
  inboundTracking: string
  items: {
    variantId: string
    productName: string
    sku: string
    quantityOrdered: number
    quantityReceived: number
    quantityAccepted: number
    quantityRejected: number
  }[]
}

export async function listInboundShipments(params: {
  page?: number
  limit?: number
  status?: string
}) {
  try {
    const { data } = await api.get<ApiSuccess<InboundShipment[]>>(
      "/admin/fulfillments",
      {
        params,
      }
    )
    return {
      items: data.data,
      pagination: data.meta?.pagination as PaginationMeta,
    }
  } catch (error) {
    throw toApiError(error)
  }
}

export async function receiveInbound(
  fulfillmentId: string,
  items: { variantId: string; quantity: number }[]
) {
  const { data } = await api.post<ApiSuccess<InboundShipment>>(
    `/admin/fulfillments/${fulfillmentId}/receive`,
    { items }
  )
  return data.data
}

export async function startInspection(fulfillmentId: string) {
  const { data } = await api.post<ApiSuccess<InboundShipment>>(
    `/admin/fulfillments/${fulfillmentId}/inspect/start`
  )
  return data.data
}

export async function submitInspection(
  fulfillmentId: string,
  items: {
    variantId: string
    quantityAccepted: number
    quantityRejected: number
    rejectionReason?: string
  }[]
) {
  const { data } = await api.post<ApiSuccess<InboundShipment>>(
    `/admin/fulfillments/${fulfillmentId}/inspect`,
    { items }
  )
  return data.data
}
