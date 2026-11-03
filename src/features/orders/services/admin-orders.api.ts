import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import { createIdempotencyKey } from "@/lib/idempotency"
import type { ApiSuccess } from "@/lib/api/types"

import type {
  AdminOrderDetail,
  AdminOrderListItem,
  AdminVendorOrder,
  CodCollectionPayload,
  CodRemittancePayload,
  ListAdminOrdersParams,
  ListAdminOrdersResult,
  ListAdminVendorOrdersParams,
  ListAdminVendorOrdersResult,
  UpdateAdminOrderStatusPayload,
  UpdateAdminVendorOrderStatusPayload,
} from "../types/admin-orders.types"

function cleanParams<T extends Record<string, unknown>>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false
      }

      if (typeof value === "string" && value.trim() === "") {
        return false
      }

      return true
    })
  )
}

function paginationFromResponse<T>(
  data: ApiSuccess<T[]>,
  params: { page?: number; limit?: number }
) {
  return (
    data.meta?.pagination ?? {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      total: data.data.length,
      totalPages: 1,
    }
  )
}

export async function listAdminOrders(
  params: ListAdminOrdersParams = {}
): Promise<ListAdminOrdersResult> {
  try {
    const { data } = await api.get<ApiSuccess<AdminOrderListItem[]>>(
      "/admin/orders",
      { params: cleanParams(params) }
    )

    return {
      items: data.data,
      pagination: paginationFromResponse(data, params),
    }
  } catch (error) {
    throw toApiError(error)
  }
}

export async function getAdminOrder(
  orderId: string
): Promise<AdminOrderDetail> {
  try {
    const { data } = await api.get<ApiSuccess<AdminOrderDetail>>(
      `/admin/orders/${orderId}`
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function cancelAdminOrder(orderId: string) {
  try {
    const { data } = await api.post<ApiSuccess<AdminOrderDetail>>(
      `/admin/orders/${orderId}/cancel`
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function updateAdminOrderStatus(
  orderId: string,
  payload: UpdateAdminOrderStatusPayload
) {
  try {
    const { data } = await api.post<ApiSuccess<unknown>>(
      `/admin/orders/${orderId}/status`,
      payload,
      {
        headers: {
          "Idempotency-Key": createIdempotencyKey(`admin-order-${orderId}`),
        },
      }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function collectCod(
  orderId: string,
  payload: CodCollectionPayload
) {
  try {
    const { data } = await api.post<ApiSuccess<unknown>>(
      `/admin/orders/${orderId}/cod/collect`,
      payload,
      {
        headers: {
          "Idempotency-Key": createIdempotencyKey(`cod-collect-${orderId}`),
        },
      }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function remitCod(orderId: string, payload: CodRemittancePayload) {
  try {
    const { data } = await api.post<ApiSuccess<unknown>>(
      `/admin/orders/${orderId}/cod/remit`,
      payload,
      {
        headers: {
          "Idempotency-Key": createIdempotencyKey(`cod-remit-${orderId}`),
        },
      }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function reconcileCod(orderId: string) {
  try {
    const { data } = await api.post<ApiSuccess<unknown>>(
      `/admin/orders/${orderId}/cod/reconcile`,
      undefined,
      {
        headers: {
          "Idempotency-Key": createIdempotencyKey(`cod-reconcile-${orderId}`),
        },
      }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function listAdminVendorOrders(
  params: ListAdminVendorOrdersParams = {}
): Promise<ListAdminVendorOrdersResult> {
  try {
    const { data } = await api.get<
      ApiSuccess<ListAdminVendorOrdersResult["items"]>
    >("/admin/vendor-orders", { params: cleanParams(params) })

    return {
      items: data.data,
      pagination: paginationFromResponse(data, params),
    }
  } catch (error) {
    throw toApiError(error)
  }
}

export async function updateAdminVendorOrderStatus(
  vendorOrderId: string,
  payload: UpdateAdminVendorOrderStatusPayload
): Promise<AdminVendorOrder> {
  try {
    const { data } = await api.post<ApiSuccess<AdminVendorOrder>>(
      `/admin/vendor-orders/${vendorOrderId}/status`,
      payload,
      {
        headers: {
          "Idempotency-Key": createIdempotencyKey(
            `admin-vendor-order-${vendorOrderId}`
          ),
        },
      }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
