import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"
import type { PaginationMeta } from "@/lib/api/types"

import type {
  CreateFlashDealCampaignPayload,
  CreateFlashDealItemPayload,
  FlashDealCampaign,
  FlashDealCampaignDetail,
  FlashDealItem,
  ListFlashDealsParams,
  ListFlashDealsResult,
  UpdateFlashDealCampaignPayload,
  UpdateFlashDealItemPayload,
} from "../types"

export async function listFlashDeals(
  params: ListFlashDealsParams = {}
): Promise<ListFlashDealsResult> {
  try {
    const { data } = await api.get<ApiSuccess<FlashDealCampaign[]>>(
      "/flash-deals/manage",
      { params }
    )

    return {
      items: data.data,
      pagination: data.meta?.pagination as PaginationMeta,
    }
  } catch (error) {
    throw toApiError(error)
  }
}

export async function getFlashDeal(id: string) {
  try {
    const { data } = await api.get<ApiSuccess<FlashDealCampaignDetail>>(
      `/flash-deals/${id}`
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function createFlashDeal(payload: CreateFlashDealCampaignPayload) {
  try {
    const { data } = await api.post<ApiSuccess<FlashDealCampaign>>(
      "/flash-deals",
      payload
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function updateFlashDeal(
  id: string,
  payload: UpdateFlashDealCampaignPayload
) {
  try {
    const { data } = await api.patch<ApiSuccess<FlashDealCampaign>>(
      `/flash-deals/${id}`,
      payload
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function endFlashDeal(id: string) {
  try {
    const { data } = await api.post<ApiSuccess<FlashDealCampaign>>(
      `/flash-deals/${id}/end`
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function addFlashDealItem(
  campaignId: string,
  payload: CreateFlashDealItemPayload
) {
  try {
    const { data } = await api.post<ApiSuccess<FlashDealItem>>(
      `/flash-deals/${campaignId}/items`,
      payload
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function updateFlashDealItem(
  campaignId: string,
  itemId: string,
  payload: UpdateFlashDealItemPayload
) {
  try {
    const { data } = await api.patch<ApiSuccess<FlashDealItem>>(
      `/flash-deals/${campaignId}/items/${itemId}`,
      payload
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function removeFlashDealItem(campaignId: string, itemId: string) {
  try {
    await api.delete(`/flash-deals/${campaignId}/items/${itemId}`)
  } catch (error) {
    throw toApiError(error)
  }
}
