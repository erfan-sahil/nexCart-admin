import type { ListAdminStoresParams } from "../types"

export const adminStoreKeys = {
  all: ["admin-stores"] as const,
  lists: () => ["admin-stores", "list"] as const,
  list: (params: ListAdminStoresParams) =>
    ["admin-stores", "list", params] as const,
  details: () => ["admin-stores", "detail"] as const,
  detail: (storeId: string) => ["admin-stores", "detail", storeId] as const,
}
