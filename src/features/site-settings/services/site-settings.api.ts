import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"

import type { SiteSettings, UpdateSiteSettingsPayload } from "../types"

export async function getSiteSettings() {
  try {
    const { data } = await api.get<ApiSuccess<SiteSettings>>("/site-settings")
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function saveSiteSettings(input: UpdateSiteSettingsPayload) {
  try {
    const { data } = await api.put<ApiSuccess<SiteSettings>>(
      "/site-settings",
      input
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
