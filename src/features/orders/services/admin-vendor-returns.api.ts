import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import { createIdempotencyKey } from "@/lib/idempotency"
import type { ApiSuccess } from "@/lib/api/types"

import type {
  DispatchVendorReturnShipmentPayload,
  ListAdminVendorReturnShipmentsParams,
  ListAdminVendorReturnShipmentsResult,
  VendorReturnShipment,
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

export async function listAdminVendorReturnShipments(
  params: ListAdminVendorReturnShipmentsParams = {}
): Promise<ListAdminVendorReturnShipmentsResult> {
  try {
    const { data } = await api.get<ApiSuccess<VendorReturnShipment[]>>(
      "/admin/vendor-return-shipments",
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

export async function getAdminVendorReturnShipment(shipmentId: string) {
  try {
    const { data } = await api.get<ApiSuccess<VendorReturnShipment>>(
      `/admin/vendor-return-shipments/${shipmentId}`
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function dispatchVendorReturnShipment(
  shipmentId: string,
  payload: DispatchVendorReturnShipmentPayload = {}
) {
  try {
    const { data } = await api.post<ApiSuccess<VendorReturnShipment>>(
      `/admin/vendor-return-shipments/${shipmentId}/dispatch`,
      payload,
      {
        headers: {
          "Idempotency-Key": createIdempotencyKey(
            `vendor-return-dispatch-${shipmentId}`
          ),
        },
      }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
