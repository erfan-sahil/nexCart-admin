import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess, PaginationMeta } from "@/lib/api/types"

import type {
  Coupon,
  CreateCouponPayload,
  ListCouponsParams,
  ListCouponsResult,
  UpdateCouponPayload,
} from "../types"

export async function listCoupons(
  params: ListCouponsParams = {}
): Promise<ListCouponsResult> {
  try {
    const { data } = await api.get<ApiSuccess<Coupon[]>>("/coupons", { params })

    return {
      items: data.data,
      pagination: data.meta?.pagination as PaginationMeta,
    }
  } catch (error) {
    throw toApiError(error)
  }
}

export async function createCoupon(payload: CreateCouponPayload) {
  try {
    const { data } = await api.post<ApiSuccess<Coupon>>("/coupons", payload)
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function updateCoupon(id: string, payload: UpdateCouponPayload) {
  try {
    const { data } = await api.patch<ApiSuccess<Coupon>>(
      `/coupons/${id}`,
      payload
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function setCouponEnabled(id: string, isEnabled: boolean) {
  try {
    const { data } = await api.patch<ApiSuccess<Coupon>>(
      `/coupons/${id}/enabled`,
      {
        isEnabled,
      }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
