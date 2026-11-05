import type { DashboardRange } from "../types"

const RANGE_LABEL: Record<DashboardRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
}

export function dashboardRangeLabel(range: DashboardRange) {
  return RANGE_LABEL[range]
}

export function formatChangeDetail(changePercent: number | null) {
  if (changePercent === null) {
    return "No prior period to compare"
  }

  const sign = changePercent > 0 ? "+" : ""
  return `${sign}${changePercent.toFixed(1)}% vs prior period`
}

export function formatChartDayLabel(date: string, range: DashboardRange) {
  const parsed = new Date(`${date}T00:00:00.000Z`)

  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  if (range === "7d") {
    return parsed.toLocaleDateString("en", {
      weekday: "short",
      timeZone: "UTC",
    })
  }

  return parsed.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

export function formatCount(value: number) {
  return value.toLocaleString()
}
