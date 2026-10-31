import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createFlashDeal,
  endFlashDeal,
  getFlashDealSettings,
  listFlashDeals,
  updateFlashDealSettings,
  type ListFlashDealsParams,
} from "./flash-deals.api"

export const flashDealsKeys = {
  settings: ["flash-deals", "settings"] as const,
  list: (params: ListFlashDealsParams) =>
    ["flash-deals", "manage", params] as const,
}

export function useFlashDealSettingsQuery() {
  return useQuery({
    queryKey: flashDealsKeys.settings,
    queryFn: getFlashDealSettings,
  })
}

export function useFlashDealsManageQuery(params: ListFlashDealsParams) {
  return useQuery({
    queryKey: flashDealsKeys.list(params),
    queryFn: () => listFlashDeals(params),
  })
}

export function useUpdateFlashDealSettingsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateFlashDealSettings,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: flashDealsKeys.settings })
    },
  })
}

export function useCreateFlashDealMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createFlashDeal,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["flash-deals"] })
    },
  })
}

export function useEndFlashDealMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: endFlashDeal,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["flash-deals"] })
    },
  })
}
