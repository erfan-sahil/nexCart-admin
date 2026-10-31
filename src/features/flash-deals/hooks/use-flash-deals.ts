import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  addFlashDealItem,
  createFlashDeal,
  endFlashDeal,
  flashDealsKeys,
  getFlashDeal,
  listFlashDeals,
  removeFlashDealItem,
  setFlashDealEnabled,
  updateFlashDeal,
  updateFlashDealItem,
} from "../services"
import type {
  CreateFlashDealCampaignPayload,
  CreateFlashDealItemPayload,
  ListFlashDealsParams,
  UpdateFlashDealCampaignPayload,
  UpdateFlashDealItemPayload,
} from "../types"

export function useFlashDealsManageQuery(params: ListFlashDealsParams) {
  return useQuery({
    queryKey: flashDealsKeys.list(params),
    queryFn: () => listFlashDeals(params),
  })
}

export function useFlashDealQuery(id: string | null) {
  return useQuery({
    queryKey: flashDealsKeys.detail(id ?? ""),
    queryFn: () => getFlashDeal(id ?? ""),
    enabled: Boolean(id),
  })
}

export function useCreateFlashDealMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateFlashDealCampaignPayload) =>
      createFlashDeal(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: flashDealsKeys.all })
    },
  })
}

export function useUpdateFlashDealMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateFlashDealCampaignPayload
    }) => updateFlashDeal(id, payload),
    onSuccess: (campaign) => {
      void queryClient.invalidateQueries({ queryKey: flashDealsKeys.all })
      queryClient.setQueryData(flashDealsKeys.detail(campaign.id), (current) =>
        current && typeof current === "object"
          ? { ...current, ...campaign }
          : current
      )
    },
  })
}

export function useEndFlashDealMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: endFlashDeal,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: flashDealsKeys.all })
    },
  })
}

export function useSetFlashDealEnabledMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isEnabled }: { id: string; isEnabled: boolean }) =>
      setFlashDealEnabled(id, isEnabled),
    onSuccess: (campaign) => {
      void queryClient.invalidateQueries({ queryKey: flashDealsKeys.all })
      queryClient.setQueryData(flashDealsKeys.detail(campaign.id), (current) =>
        current && typeof current === "object"
          ? { ...current, ...campaign }
          : current
      )
    },
  })
}

export function useAddFlashDealItemMutation(campaignId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateFlashDealItemPayload) =>
      addFlashDealItem(campaignId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: flashDealsKeys.all })
      void queryClient.invalidateQueries({
        queryKey: flashDealsKeys.detail(campaignId),
      })
    },
  })
}

export function useUpdateFlashDealItemMutation(campaignId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: {
      itemId: string
      payload: UpdateFlashDealItemPayload
    }) => updateFlashDealItem(campaignId, itemId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: flashDealsKeys.detail(campaignId),
      })
      void queryClient.invalidateQueries({ queryKey: flashDealsKeys.lists() })
    },
  })
}

export function useRemoveFlashDealItemMutation(campaignId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) => removeFlashDealItem(campaignId, itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: flashDealsKeys.all })
      void queryClient.invalidateQueries({
        queryKey: flashDealsKeys.detail(campaignId),
      })
    },
  })
}
