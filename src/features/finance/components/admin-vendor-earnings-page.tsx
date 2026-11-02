"use client"

import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { listVendorEarnings } from "../services/admin-finance.api"

export function AdminVendorEarningsPage() {
  const query = useQuery({
    queryKey: ["admin", "vendor-earnings"],
    queryFn: () => listVendorEarnings(1, 100),
  })

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Vendor earnings</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Store</TableHead>
            <TableHead>Pending settlement</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Withdrawn</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(query.data?.items ?? []).map((row) => (
            <TableRow key={row.storeId}>
              <TableCell>{row.storeName}</TableCell>
              <TableCell>৳{row.pendingSettlement.toFixed(2)}</TableCell>
              <TableCell>৳{row.availableBalance.toFixed(2)}</TableCell>
              <TableCell>৳{row.withdrawnBalance.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
