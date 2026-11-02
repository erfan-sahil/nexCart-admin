import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  adminOrderKeys,
  cancelAdminOrder,
  getAdminOrder,
  listAdminOrders,
} from "../services"
import type { ListAdminOrdersParams } from "../types/admin-orders.types"

export function useAdminOrders(params: ListAdminOrdersParams) {
  return useQuery({
    queryKey: adminOrderKeys.list(params),
    queryFn: () => listAdminOrders(params),
    placeholderData: keepPreviousData,
    staleTime: 20_000,
  })
}

export function useAdminOrder(orderId: string) {
  return useQuery({
    queryKey: adminOrderKeys.detail(orderId),
    queryFn: () => getAdminOrder(orderId),
    enabled: orderId.length > 0,
  })
}

export function useCancelAdminOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelAdminOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminOrderKeys.all })
    },
  })
}
