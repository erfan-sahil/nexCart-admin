import type { ListAdminOrdersParams } from "../types/admin-orders.types"

export const adminOrderKeys = {
  all: ["admin-orders"] as const,
  list: (params: ListAdminOrdersParams) =>
    [...adminOrderKeys.all, "list", params] as const,
  detail: (id: string) => [...adminOrderKeys.all, "detail", id] as const,
}
