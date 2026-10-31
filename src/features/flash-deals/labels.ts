import { badgeColors } from "@/components/shared"

import type {
  FlashDealCampaign,
  FlashDealDiscountType,
  FlashDealFilter,
  FlashDealLifecycle,
} from "./types"

export const FLASH_DEAL_FILTER_LABEL: Record<FlashDealFilter, string> = {
  all: "All deals",
  active: "Active deals",
  ended: "Ended deals",
}

export const FLASH_DEAL_LIFECYCLE_LABEL: Record<FlashDealLifecycle, string> = {
  active: "Active",
  upcoming: "Upcoming",
  ended: "Ended",
}

export const FLASH_DEAL_LIFECYCLE_BADGE = {
  active: badgeColors.active,
  upcoming: badgeColors.submitted,
  ended: badgeColors.neutral,
} as const

export const FLASH_DEAL_ACTIVITIES = ["active", "inactive", "paused"] as const

export type FlashDealActivity = (typeof FLASH_DEAL_ACTIVITIES)[number]

export const FLASH_DEAL_ACTIVITY_LABEL: Record<FlashDealActivity, string> = {
  active: "Active",
  inactive: "Inactive",
  paused: "Paused",
}

export const FLASH_DEAL_ACTIVITY_BADGE = {
  active: badgeColors.active,
  inactive: badgeColors.neutral,
  paused: badgeColors.under_review,
} as const

/** One status only: paused beats active; ended/upcoming are inactive. */
export function getFlashDealActivity(
  campaign: Pick<FlashDealCampaign, "lifecycle" | "isEnabled">
): FlashDealActivity {
  if (campaign.lifecycle === "ended") {
    return "inactive"
  }

  if (!campaign.isEnabled) {
    return "paused"
  }

  if (campaign.lifecycle === "active") {
    return "active"
  }

  return "inactive"
}

export function formatDiscount(type: FlashDealDiscountType, value: number) {
  if (type === "percent") {
    return `${value}% off`
  }

  return `${value} off`
}
