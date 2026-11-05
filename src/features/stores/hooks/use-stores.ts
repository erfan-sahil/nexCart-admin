import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  adminStoreKeys,
  deleteAdminStore,
  getAdminStore,
  listAdminStores,
  setAdminStoreSuspension,
} from "../services"
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

export function useSetAdminStoreSuspensionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      storeId,
      suspended,
    }: {
      storeId: string
      suspended: boolean
    }) => setAdminStoreSuspension(storeId, suspended),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminStoreKeys.all })
    },
  })
}

export function useDeleteAdminStoreMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (storeId: string) => deleteAdminStore(storeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminStoreKeys.all })
    },
  })
}
