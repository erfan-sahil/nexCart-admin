import { badgeColors } from "@/components/shared"

import type { FlashDealDiscountType, FlashDealStatus } from "./types"

export const FLASH_DEAL_STATUS_LABEL: Record<FlashDealStatus, string> = {
  active: "Active",
  upcoming: "Upcoming",
  ended: "Ended",
}

export const FLASH_DEAL_STATUS_BADGE = {
  active: badgeColors.active,
  upcoming: badgeColors.submitted,
  ended: badgeColors.neutral,
} as const

export function formatDiscount(type: FlashDealDiscountType, value: number) {
  if (type === "percent") {
    return `${value}% off`
  }

  return `${value} off`
}
