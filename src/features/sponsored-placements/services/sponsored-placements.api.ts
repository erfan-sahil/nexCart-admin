import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"

export type SponsoredSection = "top-selling" | "trending" | "new-arrivals"

export type SponsoredPlacement = {
  slot: "1" | "2"
  productId: string | null
  productName: string
  section: SponsoredSection | null
  title: string
  subtitle: string
  ctaLabel: string
  image: string
  isActive: boolean
}

export type UpsertSponsoredPayload = {
  productId: string
  section: SponsoredSection
  title?: string
  subtitle?: string
  ctaLabel?: string
  image?: string
  isActive: boolean
}

export async function listSponsoredPlacementsManage() {
  try {
    const { data } = await api.get<ApiSuccess<SponsoredPlacement[]>>(
      "/sponsored-placements/manage"
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function upsertSponsoredPlacement(
  slot: "1" | "2",
  payload: UpsertSponsoredPayload
) {
  try {
    const { data } = await api.put<ApiSuccess<SponsoredPlacement>>(
      `/sponsored-placements/${slot}`,
      payload
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
