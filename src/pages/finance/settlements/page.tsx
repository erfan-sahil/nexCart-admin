"use client"

import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { getFinanceReportSummary } from "@/features/finance/services/admin-finance.api"

export function SettlementsPage() {
  const query = useQuery({
    queryKey: ["admin", "finance", "summary"],
    queryFn: getFinanceReportSummary,
  })

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const data = query.data

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Settlements overview</h1>
      <ul className="space-y-2 text-sm">
        <li>
          GMV (vendor orders): ৳{data?.gmvFromVendorOrders.toFixed(2) ?? "0.00"}
        </li>
        <li>
          Commission (snapshots): ৳
          {data?.commissionFromSnapshots.toFixed(2) ?? "0.00"}
        </li>
        <li>COD orders outstanding: {data?.codOrdersOutstanding ?? 0}</li>
      </ul>
    </div>
  )
}
