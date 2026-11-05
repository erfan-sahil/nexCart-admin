import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import { createIdempotencyKey } from "@/lib/idempotency"
import type { ApiSuccess } from "@/lib/api/types"

import type {
  AdminReturnListItem,
  InspectReturnLinePayload,
  ListAdminReturnsParams,
  ListAdminReturnsResult,
  RefundPreview,
  ResolveReturnPayload,
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

export async function listAdminReturns(
  params: ListAdminReturnsParams = {}
): Promise<ListAdminReturnsResult> {
  try {
    const { data } = await api.get<ApiSuccess<AdminReturnListItem[]>>(
      "/admin/returns",
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

export async function getAdminReturn(returnId: string) {
  try {
    const { data } = await api.get<ApiSuccess<AdminReturnListItem>>(
      `/admin/returns/${returnId}`
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function previewReturnRefund(returnId: string) {
  try {
    const { data } = await api.get<ApiSuccess<RefundPreview>>(
      `/admin/returns/${returnId}/refund-preview`
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function markReturnReturning(returnId: string) {
  try {
    const { data } = await api.post<ApiSuccess<unknown>>(
      `/admin/returns/${returnId}/returning`,
      undefined,
      {
        headers: {
          "Idempotency-Key": createIdempotencyKey(
            `return-returning-${returnId}`
          ),
        },
      }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function markReturnReceived(returnId: string) {
  try {
    const { data } = await api.post<ApiSuccess<unknown>>(
      `/admin/returns/${returnId}/receive`,
      undefined,
      {
        headers: {
          "Idempotency-Key": createIdempotencyKey(`return-receive-${returnId}`),
        },
      }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function inspectReturn(
  returnId: string,
  lines: InspectReturnLinePayload[]
) {
  try {
    const { data } = await api.post<ApiSuccess<unknown>>(
      `/admin/returns/${returnId}/inspect`,
      { lines },
      {
        headers: {
          "Idempotency-Key": createIdempotencyKey(`return-inspect-${returnId}`),
        },
      }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function resolveReturn(
  returnId: string,
  payload: ResolveReturnPayload
) {
  try {
    const { data } = await api.post<ApiSuccess<unknown>>(
      `/admin/returns/${returnId}/resolve`,
      payload,
      {
        headers: {
          "Idempotency-Key": createIdempotencyKey(`return-resolve-${returnId}`),
        },
      }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
