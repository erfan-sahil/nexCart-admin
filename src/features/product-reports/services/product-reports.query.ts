import type { ListProductReportsParams } from "../types"

export const productReportKeys = {
  all: ["admin-product-reports"] as const,
  lists: () => ["admin-product-reports", "list"] as const,
  list: (params: ListProductReportsParams) =>
    ["admin-product-reports", "list", params] as const,
}
