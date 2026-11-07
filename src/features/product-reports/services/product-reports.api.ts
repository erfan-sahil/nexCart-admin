import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess, PaginationMeta } from "@/lib/api/types"

import type {
  ListProductReportsParams,
  ListProductReportsResult,
  ProductReport,
  UpdateProductReportStatusPayload,
} from "../types"

function cleanParams(params: ListProductReportsParams) {
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

export async function listProductReports(
  params: ListProductReportsParams = {}
): Promise<ListProductReportsResult> {
  try {
    const { data } = await api.get<ApiSuccess<{ reports: ProductReport[] }>>(
      "/product-reports",
      { params: cleanParams(params) }
    )

    const pagination = data.meta?.pagination as PaginationMeta | undefined

    return {
      items: data.data.reports,
      pagination: pagination ?? {
        page: params.page ?? 1,
        limit: params.limit ?? data.data.reports.length,
        total: data.data.reports.length,
        totalPages: 1,
      },
    }
  } catch (error) {
    throw toApiError(error)
  }
}

export async function updateProductReportStatus(
  reportId: string,
  payload: UpdateProductReportStatusPayload
) {
  try {
    const { data } = await api.patch<ApiSuccess<{ report: ProductReport }>>(
      `/product-reports/${reportId}`,
      payload
    )
    return data.data.report
  } catch (error) {
    throw toApiError(error)
  }
}

export async function deleteProductReport(reportId: string) {
  try {
    const { data } = await api.delete<ApiSuccess<{ id: string }>>(
      `/product-reports/${reportId}`
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
