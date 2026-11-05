import { useQuery } from "@tanstack/react-query"

import { adminDashboardKeys, getDashboardOverview } from "../services"
import type { DashboardRange } from "../types"

export function useDashboardOverviewQuery(range: DashboardRange) {
  return useQuery({
    queryKey: adminDashboardKeys.overview(range),
    queryFn: () => getDashboardOverview({ range }),
    staleTime: 30_000,
  })
}
