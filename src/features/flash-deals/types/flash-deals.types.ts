import type { PaginationMeta } from "@/lib/api/types"

export const FLASH_DEAL_DISCOUNT_TYPES = ["percent", "amount"] as const

export const FLASH_DEAL_STATUSES = ["active", "upcoming", "ended"] as const

export type FlashDealDiscountType = (typeof FLASH_DEAL_DISCOUNT_TYPES)[number]

export type FlashDealStatus = (typeof FLASH_DEAL_STATUSES)[number]

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
  status?: FlashDealStatus
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
