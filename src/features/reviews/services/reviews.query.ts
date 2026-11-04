import type { ListReviewsParams } from "../types"

export const adminReviewKeys = {
  all: ["admin-reviews"] as const,
  lists: () => ["admin-reviews", "list"] as const,
  list: (params: ListReviewsParams) =>
    ["admin-reviews", "list", params] as const,
}
