import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  adminOrderKeys,
  cancelAdminOrder,
  collectCod,
  getAdminOrder,
  listAdminOrders,
  listAdminVendorOrders,
  reconcileCod,
  remitCod,
  updateAdminOrderStatus,
  updateAdminVendorOrderStatus,
} from "../services"
import type {
  CodCollectionPayload,
  CodRemittancePayload,
  ListAdminOrdersParams,
  ListAdminVendorOrdersParams,
  UpdateAdminOrderStatusPayload,
  UpdateAdminVendorOrderStatusPayload,
} from "../types/admin-orders.types"

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

export function useAdminVendorOrders(params: ListAdminVendorOrdersParams) {
  return useQuery({
    queryKey: adminOrderKeys.vendorList(params),
    queryFn: () => listAdminVendorOrders(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  })
}

function useInvalidateOrders() {
  const queryClient = useQueryClient()

  return async (orderId?: string) => {
    await queryClient.invalidateQueries({ queryKey: adminOrderKeys.all })
    if (orderId) {
      await queryClient.invalidateQueries({
        queryKey: adminOrderKeys.detail(orderId),
      })
    }
  }
}

export function useCancelAdminOrder() {
  const invalidate = useInvalidateOrders()

  return useMutation({
    mutationFn: cancelAdminOrder,
    onSuccess: async (order) => {
      await invalidate(order.id)
    },
  })
}

export function useUpdateAdminOrderStatus(orderId: string) {
  const invalidate = useInvalidateOrders()

  return useMutation({
    mutationFn: (payload: UpdateAdminOrderStatusPayload) =>
      updateAdminOrderStatus(orderId, payload),
    onSuccess: async () => {
      await invalidate(orderId)
    },
  })
}

export function useUpdateAdminVendorOrderStatus(orderId: string) {
  const invalidate = useInvalidateOrders()

  return useMutation({
    mutationFn: ({
      vendorOrderId,
      payload,
    }: {
      vendorOrderId: string
      payload: UpdateAdminVendorOrderStatusPayload
    }) => updateAdminVendorOrderStatus(vendorOrderId, payload),
    onSuccess: async () => {
      await invalidate(orderId)
    },
  })
}

export function useCodMutations(orderId: string) {
  const invalidate = useInvalidateOrders()

  const onSuccess = async () => {
    await invalidate(orderId)
  }

  const collect = useMutation({
    mutationFn: (payload: CodCollectionPayload) => collectCod(orderId, payload),
    onSuccess,
  })

  const remit = useMutation({
    mutationFn: (payload: CodRemittancePayload) => remitCod(orderId, payload),
    onSuccess,
  })

  const reconcile = useMutation({
    mutationFn: () => reconcileCod(orderId),
    onSuccess,
  })

  return { collect, remit, reconcile }
}
