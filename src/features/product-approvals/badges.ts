import { badgeColors, type BadgeColorCodes } from "@/components/shared"

import type { ProductApprovalStatus, ProductStatus } from "./types"

export const APPROVAL_BADGE: Record<ProductApprovalStatus, BadgeColorCodes> = {
  pending: badgeColors.under_review,
  submitted: badgeColors.submitted,
  approved: badgeColors.approved,
  rejected: badgeColors.rejected,
}

export const STATUS_BADGE: Record<ProductStatus, BadgeColorCodes> = {
  active: badgeColors.active,
  archived: badgeColors.draft,
}
