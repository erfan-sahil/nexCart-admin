export type CouponDiscountType = "percent" | "amount"

export type CouponEnabledFilter = "all" | "enabled" | "disabled"

export type Coupon = {
  id: string
  code: string
  label: string
  discountType: CouponDiscountType
  discountValue: number
  minimumSubtotal: number
  startsAt: string
  endsAt: string
  usageLimit: number | null
  perCustomerLimit: number
  usedCount: number
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export type ListCouponsParams = {
  page?: number
  limit?: number
  enabled?: CouponEnabledFilter
  search?: string
}

export type ListCouponsResult = {
  items: Coupon[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type CreateCouponPayload = {
  code: string
  label?: string
  discountType: CouponDiscountType
  discountValue: number
  minimumSubtotal?: number
  startsAt: string
  endsAt: string
  usageLimit?: number | null
  perCustomerLimit?: number
  isEnabled?: boolean
}

export type UpdateCouponPayload = Partial<CreateCouponPayload>
