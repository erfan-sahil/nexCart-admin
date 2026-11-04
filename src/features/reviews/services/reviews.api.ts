import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess, PaginationMeta } from "@/lib/api/types"

import type {
  ListReviewsParams,
  ListReviewsResult,
  ManagementReview,
} from "../types"

function cleanParams(params: ListReviewsParams) {
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

export async function listAdminReviews(
  params: ListReviewsParams = {}
): Promise<ListReviewsResult> {
  try {
    const { data } = await api.get<ApiSuccess<ManagementReview[]>>(
      "/admin/reviews",
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

export async function deleteAdminReview(reviewId: string) {
  try {
    const { data } = await api.delete<ApiSuccess<{ summary: unknown }>>(
      `/admin/reviews/${reviewId}`
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
