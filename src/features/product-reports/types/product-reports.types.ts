import type { PaginationMeta } from "@/lib/api/types"

export const PRODUCT_REPORT_TYPES = [
  "misleading_listing",
  "counterfeit",
  "prohibited",
  "inappropriate_content",
  "pricing",
  "safety",
  "spam",
  "other",
] as const

export const PRODUCT_REPORT_STATUSES = [
  "open",
  "reviewed",
  "dismissed",
] as const

export type ProductReportType = (typeof PRODUCT_REPORT_TYPES)[number]
export type ProductReportStatus = (typeof PRODUCT_REPORT_STATUSES)[number]
export type StatusFilter = "all" | ProductReportStatus

export type ProductReportProduct = {
  id: string
  name: string
  slug: string
}

export type ProductReportStore = {
  id: string
  name: string
}

export type ProductReportReporter = {
  id: string
  displayName: string
}

export type ProductReport = {
  id: string
  type: ProductReportType
  message: string
  status: ProductReportStatus
  createdAt: string
  updatedAt: string
  product: ProductReportProduct
  store: ProductReportStore
  reporter: ProductReportReporter
  isMine: boolean
}

export type ListProductReportsParams = {
  page?: number
  limit?: number
  status?: ProductReportStatus
}

export type ListProductReportsResult = {
  items: ProductReport[]
  pagination: PaginationMeta
}

export type UpdateProductReportStatusPayload = {
  status: Extract<ProductReportStatus, "reviewed" | "dismissed">
}
