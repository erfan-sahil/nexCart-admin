import type { DashboardRange } from "../types"

export const adminDashboardKeys = {
  all: ["admin-dashboard"] as const,
  overview: (range: DashboardRange) =>
    ["admin-dashboard", "overview", range] as const,
}
