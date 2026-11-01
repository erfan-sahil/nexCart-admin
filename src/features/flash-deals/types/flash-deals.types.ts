import type { PaginationMeta } from "@/lib/api/types"

export const FLASH_DEAL_DISCOUNT_TYPES = ["percent", "amount"] as const

export const FLASH_DEAL_FILTERS = ["all", "active", "ended"] as const

export const FLASH_DEAL_LIFECYCLES = ["active", "upcoming", "ended"] as const

export type FlashDealDiscountType = (typeof FLASH_DEAL_DISCOUNT_TYPES)[number]

export type FlashDealFilter = (typeof FLASH_DEAL_FILTERS)[number]

export type FlashDealLifecycle = (typeof FLASH_DEAL_LIFECYCLES)[number]

export type FlashDealItem = {
  id: string
  campaignId: string
  productId: string
  productName: string
  productSlug: string
  storeName: string
  discountType: FlashDealDiscountType
  discountValue: number
  createdAt: string
  updatedAt: string
}

export type FlashDealCampaign = {
  id: string
  name: string
  startsAt: string
  endsAt: string
  isEnabled: boolean
  lifecycle: FlashDealLifecycle
  itemCount: number
  createdAt: string
  updatedAt: string
}

export type FlashDealCampaignDetail = FlashDealCampaign & {
  items: FlashDealItem[]
}

export type ListFlashDealsParams = {
  page?: number
  limit?: number
  status?: FlashDealFilter
  search?: string
}

export type ListFlashDealsResult = {
  items: FlashDealCampaign[]
  pagination: PaginationMeta
}

export type CreateFlashDealCampaignPayload = {
  name: string
  startsAt: string
  endsAt: string
}

export type UpdateFlashDealCampaignPayload = {
  name?: string
  startsAt?: string
  endsAt?: string
}

export type CreateFlashDealItemPayload = {
  productId: string
  discountType: FlashDealDiscountType
  discountValue: number
}

export type UpdateFlashDealItemPayload = {
  discountType?: FlashDealDiscountType
  discountValue?: number
}
