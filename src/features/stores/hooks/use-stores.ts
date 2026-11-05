import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { adminStoreKeys, getAdminStore, listAdminStores } from "../services"
import type { ListAdminStoresParams } from "../types"

export function useAdminStoresQuery(params: ListAdminStoresParams) {
  return useQuery({
    queryKey: adminStoreKeys.list(params),
    queryFn: () => listAdminStores(params),
    placeholderData: keepPreviousData,
  })
}

export function useAdminStoreQuery(storeId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: adminStoreKeys.detail(storeId ?? ""),
    queryFn: () => getAdminStore(storeId!),
    enabled: enabled && Boolean(storeId),
  })
}
