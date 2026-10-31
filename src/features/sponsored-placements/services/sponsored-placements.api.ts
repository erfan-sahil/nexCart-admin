import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"

export const SPONSORED_SECTIONS = ["top-selling", "new-arrivals"] as const
export const SPONSORED_SLOTS = ["1", "2"] as const

export type SponsoredSection = (typeof SPONSORED_SECTIONS)[number]
export type SponsoredSlot = (typeof SPONSORED_SLOTS)[number]

export type SponsoredPlacement = {
  slot: SponsoredSlot
  productId: string | null
  productName: string
  section: SponsoredSection | null
  title: string
  subtitle: string
  ctaLabel: string
  isActive: boolean
}

export type UpsertSponsoredPayload = {
  productId: string
  section: SponsoredSection
  title?: string
  subtitle?: string
  ctaLabel?: string
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
  slot: SponsoredSlot,
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
