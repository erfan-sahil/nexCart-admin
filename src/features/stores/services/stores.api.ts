import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess, PaginationMeta } from "@/lib/api/types"

import type {
  AdminStoreDetail,
  AdminStoreSummary,
  ListAdminStoresParams,
  ListAdminStoresResult,
} from "../types"

function cleanParams(params: ListAdminStoresParams) {
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

export async function listAdminStores(
  params: ListAdminStoresParams = {}
): Promise<ListAdminStoresResult> {
  try {
    const { data } = await api.get<ApiSuccess<AdminStoreSummary[]>>(
      "/admin/stores",
      { params: cleanParams(params) }
    )

    const pagination = data.meta?.pagination as PaginationMeta | undefined

    return {
      items: data.data,
      pagination: pagination ?? {
        page: params.page ?? 1,
        limit: params.limit ?? data.data.length,
        total: data.data.length,
        totalPages: 1,
      },
    }
  } catch (error) {
    throw toApiError(error)
  }
}

export async function getAdminStore(
  storeId: string
): Promise<AdminStoreDetail> {
  try {
    const { data } = await api.get<ApiSuccess<AdminStoreDetail>>(
      `/admin/stores/${storeId}`
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function setAdminStoreSuspension(
  storeId: string,
  suspended: boolean
): Promise<AdminStoreDetail> {
  try {
    const { data } = await api.patch<ApiSuccess<AdminStoreDetail>>(
      `/admin/stores/${storeId}/suspension`,
      { suspended }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function deleteAdminStore(storeId: string) {
  try {
    const { data } = await api.delete<ApiSuccess<{ id: string }>>(
      `/admin/stores/${storeId}`
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
