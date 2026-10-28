import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"

import type {
  ListProductsParams,
  ListProductsResult,
  ListVariantsResult,
  Product,
  ProductVariant,
} from "../types"

function cleanParams(params: ListProductsParams) {
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

function optionalNote(note?: string) {
  const trimmed = note?.trim() ?? ""

  return trimmed ? { note: trimmed } : {}
}

function pageResult<T>(
  items: T[],
  pagination: ListProductsResult["pagination"] | undefined,
  params: { page?: number; limit?: number }
) {
  return {
    items,
    pagination: pagination ?? {
      page: params.page ?? 1,
      limit: params.limit ?? items.length,
      total: items.length,
      totalPages: 1,
    },
  }
}

export async function listProductsForModeration(
  params: ListProductsParams = {}
): Promise<ListProductsResult> {
  try {
    const { data } = await api.get<ApiSuccess<Product[]>>("/products/manage", {
      params: cleanParams(params),
    })

    return pageResult(data.data, data.meta?.pagination, params)
  } catch (error) {
    throw toApiError(error)
  }
}

export async function getProduct(id: string) {
  try {
    const { data } = await api.get<ApiSuccess<Product>>(`/products/${id}`)

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function listProductVariants(
  productId: string
): Promise<ListVariantsResult> {
  try {
    const { data } = await api.get<ApiSuccess<ProductVariant[]>>(
      `/products/${productId}/variants`,
      { params: { limit: 100, sort: "createdAt" } }
    )

    return pageResult(data.data, data.meta?.pagination, { page: 1, limit: 100 })
  } catch (error) {
    throw toApiError(error)
  }
}

export async function approveProduct(id: string, note?: string) {
  try {
    const { data } = await api.post<ApiSuccess<Product>>(
      `/products/${id}/approve`,
      optionalNote(note)
    )

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function rejectProduct(id: string, note: string) {
  try {
    const { data } = await api.post<ApiSuccess<Product>>(
      `/products/${id}/reject`,
      { note: note.trim() }
    )

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
