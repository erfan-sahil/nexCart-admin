"use client"

import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  listInboundShipments,
  receiveInbound,
  startInspection,
  submitInspection,
} from "../services/warehouse.api"

export function WarehouseIncomingPage() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const query = useQuery({
    queryKey: ["warehouse-incoming"],
    queryFn: () => listInboundShipments({ limit: 50 }),
  })
  const selected = query.data?.items.find((row) => row.id === selectedId)

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["warehouse-incoming"] })

  const onReceive = async () => {
    if (!selected) return
    await receiveInbound(
      selected.id,
      selected.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantityOrdered,
      }))
    )
    await refresh()
  }

  const onInspect = async () => {
    if (!selected) return
    await startInspection(selected.id)
    await submitInspection(
      selected.id,
      selected.items.map((item) => ({
        variantId: item.variantId,
        quantityAccepted: item.quantityOrdered,
        quantityRejected: 0,
      }))
    )
    await refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Incoming shipments
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vendor inbound shipments waiting for receive and inspection.
        </p>
      </div>
      {query.isLoading ? (
        <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" />
      ) : (
        <div className="rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tracking</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data?.items ?? []).map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedId(row.id)}
                >
                  <TableCell>{row.orderNumber}</TableCell>
                  <TableCell>{row.storeName}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.inboundTracking || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {selected ? (
        <div className="flex flex-wrap gap-2">
          <Button onClick={onReceive}>Receive (full qty)</Button>
          <Button variant="secondary" onClick={onInspect}>
            Accept inspection (full qty)
          </Button>
        </div>
      ) : null}
    </div>
  )
}
