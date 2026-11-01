import { badgeColors } from "@/components/shared"

import type { Coupon, CouponDiscountType, CouponEnabledFilter } from "./types"

export const COUPON_FILTER_LABEL: Record<CouponEnabledFilter, string> = {
  all: "All coupons",
  enabled: "Enabled",
  disabled: "Disabled",
}

export type CouponLifecycle = "active" | "upcoming" | "ended"

export const COUPON_LIFECYCLE_LABEL: Record<CouponLifecycle, string> = {
  active: "Active",
  upcoming: "Upcoming",
  ended: "Ended",
}

export const COUPON_LIFECYCLE_BADGE = {
  active: badgeColors.active,
  upcoming: badgeColors.submitted,
  ended: badgeColors.neutral,
} as const

export function getCouponLifecycle(
  coupon: Pick<Coupon, "startsAt" | "endsAt">,
  now = new Date()
): CouponLifecycle {
  const startsAt = new Date(coupon.startsAt)
  const endsAt = new Date(coupon.endsAt)

  if (endsAt <= now) {
    return "ended"
  }

  if (startsAt > now) {
    return "upcoming"
  }

  return "active"
}

export function formatCouponDiscount(type: CouponDiscountType, value: number) {
  if (type === "percent") {
    return `${value}% off`
  }

  return `${value} off`
}

export function formatUsageLimit(usageLimit: number | null, usedCount: number) {
  if (usageLimit === null) {
    return `${usedCount} used · Unlimited`
  }

  return `${usedCount} / ${usageLimit} used`
}
