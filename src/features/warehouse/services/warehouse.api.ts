import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess, PaginationMeta } from "@/lib/api/types"

import type { ListAdminVendorOrdersParams } from "@/features/orders/types/admin-orders.types"
import type { AdminVendorOrderListItem } from "@/features/orders/types/admin-orders.types"

export async function listWarehouseQueue(
  params: ListAdminVendorOrdersParams = {}
) {
  try {
    const { data } = await api.get<ApiSuccess<AdminVendorOrderListItem[]>>(
      "/admin/vendor-orders",
      { params }
    )

    return {
      items: data.data,
      pagination: (data.meta?.pagination ?? {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        total: data.data.length,
        totalPages: 1,
      }) as PaginationMeta,
    }
  } catch (error) {
    throw toApiError(error)
  }
}

export { updateAdminVendorOrderStatus } from "@/features/orders/services/admin-orders.api"
