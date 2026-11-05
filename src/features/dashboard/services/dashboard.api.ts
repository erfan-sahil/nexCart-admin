import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"

import type { DashboardOverview, DashboardOverviewParams } from "../types"

export async function getDashboardOverview(
  params: DashboardOverviewParams = {}
): Promise<DashboardOverview> {
  try {
    const { data } = await api.get<ApiSuccess<DashboardOverview>>(
      "/admin/dashboard/overview",
      { params }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
