import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"
import type { PaginationMeta } from "@/lib/api/types"

export type FlashDealDiscountType = "percent" | "amount"

export type FlashDeal = {
  id: string
  productId: string
  productName: string
  productSlug: string
  storeName: string
  discountType: FlashDealDiscountType
  discountValue: number
  startsAt: string
  endsAt: string
  createdAt: string
  updatedAt: string
}

export type FlashDealSettings = {
  sectionTitle: string
}

export type ListFlashDealsParams = {
  page?: number
  limit?: number
  status?: "active" | "upcoming" | "ended"
}

export type CreateFlashDealPayload = {
  productId: string
  discountType: FlashDealDiscountType
  discountValue: number
  startsAt: string
  endsAt: string
}

export async function getFlashDealSettings() {
  try {
    const { data } = await api.get<ApiSuccess<FlashDealSettings>>(
      "/flash-deals/settings"
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function updateFlashDealSettings(sectionTitle: string) {
  try {
    const { data } = await api.put<ApiSuccess<FlashDealSettings>>(
      "/flash-deals/settings",
      { sectionTitle }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function listFlashDeals(params: ListFlashDealsParams = {}) {
  try {
    const { data } = await api.get<ApiSuccess<FlashDeal[]>>(
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

export async function createFlashDeal(payload: CreateFlashDealPayload) {
  try {
    const { data } = await api.post<ApiSuccess<FlashDeal>>(
      "/flash-deals",
      payload
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function endFlashDeal(id: string) {
  try {
    const { data } = await api.post<ApiSuccess<FlashDeal>>(
      `/flash-deals/${id}/end`
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
