import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  couponsKeys,
  createCoupon,
  listCoupons,
  setCouponEnabled,
  updateCoupon,
} from "../services"
import type {
  CreateCouponPayload,
  ListCouponsParams,
  UpdateCouponPayload,
} from "../types"

export function useCouponsQuery(params: ListCouponsParams) {
  return useQuery({
    queryKey: couponsKeys.list(params),
    queryFn: () => listCoupons(params),
  })
}

export function useCreateCouponMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCouponPayload) => createCoupon(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: couponsKeys.all })
    },
  })
}

export function useUpdateCouponMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateCouponPayload
    }) => updateCoupon(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: couponsKeys.all })
    },
  })
}

export function useSetCouponEnabledMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isEnabled }: { id: string; isEnabled: boolean }) =>
      setCouponEnabled(id, isEnabled),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: couponsKeys.all })
    },
  })
}
