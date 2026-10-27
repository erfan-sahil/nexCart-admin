import type { ListProductsParams } from "../types"

export const productApprovalsQueryKey = {
  all: ["product-approvals"] as const,
  lists: () => [...productApprovalsQueryKey.all, "list"] as const,
  list: (params: ListProductsParams) =>
    [...productApprovalsQueryKey.lists(), params] as const,
  details: () => [...productApprovalsQueryKey.all, "detail"] as const,
  detail: (id: string) => [...productApprovalsQueryKey.details(), id] as const,
  variants: (id: string) =>
    [...productApprovalsQueryKey.all, "variants", id] as const,
}
