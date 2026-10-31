import { badgeColors } from "@/components/shared"

import type { SponsoredSection } from "./services/sponsored-placements.api"

export const SPONSORED_SECTION_LABEL: Record<SponsoredSection, string> = {
  "top-selling": "Top selling",
  "new-arrivals": "New arrivals",
}

export const SPONSORED_STATUS_LABEL = {
  active: "Active",
  inactive: "Inactive",
} as const

export const SPONSORED_STATUS_BADGE = {
  active: badgeColors.active,
  inactive: badgeColors.neutral,
} as const
