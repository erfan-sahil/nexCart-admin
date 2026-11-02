import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess, PaginationMeta } from "@/lib/api/types"

import type {
  AdminOrderDetail,
  AdminOrderListItem,
  ListAdminOrdersParams,
  ListAdminOrdersResult,
} from "../types/admin-orders.types"

export async function listAdminOrders(
  params: ListAdminOrdersParams = {}
): Promise<ListAdminOrdersResult> {
  try {
    const { data } = await api.get<ApiSuccess<AdminOrderListItem[]>>(
      "/admin/orders",
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
