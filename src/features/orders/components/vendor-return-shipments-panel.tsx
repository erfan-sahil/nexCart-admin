import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApiError } from "@/lib/api/errors"
import { formatDateTime } from "@/lib/format"

import { useAdminVendorReturnShipments } from "../hooks"
import type { VendorReturnShipment } from "../types/admin-orders.types"
import { DispatchVendorReturnDialog } from "./dispatch-vendor-return-dialog"
import { VendorReturnShipmentStepper } from "./vendor-return-shipment-status"

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "pending_dispatch_to_vendor", label: "Pending dispatch" },
  { value: "in_transit_to_vendor", label: "In transit" },
  { value: "received_by_vendor", label: "Received by vendor" },
] as const

function groupByStore(items: VendorReturnShipment[]) {
  const groups = new Map<
    string,
    { storeId: string; shipments: VendorReturnShipment[] }
  >()

  for (const shipment of items) {
    const key = shipment.storeId
    const group = groups.get(key) ?? { storeId: key, shipments: [] }
    group.shipments.push(shipment)
    groups.set(key, group)
  }

  return [...groups.values()]
}

export function VendorReturnShipmentsPanel() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState("all")
  const [dispatchTarget, setDispatchTarget] =
    useState<VendorReturnShipment | null>(null)

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      ...(status !== "all" ? { status } : {}),
    }),
    [page, status]
  )

  const listQuery = useAdminVendorReturnShipments(params)
  const items = useMemo(
    () => listQuery.data?.items ?? [],
    [listQuery.data?.items]
  )
  const pagination = listQuery.data?.pagination
  const grouped = useMemo(() => groupByStore(items), [items])

  const errorMessage =
    listQuery.error instanceof ApiError
      ? listQuery.error.message
      : listQuery.isError
        ? "Could not load vendor return shipments."
        : null

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {listQuery.isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-7 animate-spin text-muted-foreground" />
          </div>
        ) : errorMessage ? (
          <p className="px-4 py-12 text-center text-sm text-destructive">
            {errorMessage}
          </p>
        ) : items.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            No vendor return shipments yet. They appear after a delivery return
            is refunded with sellable lines.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {grouped.map((group) => (
              <div key={group.storeId} className="space-y-3 px-4 py-4 sm:px-5">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Store {group.storeId.slice(-6)}
                </p>
                <ul className="space-y-3">
                  {group.shipments.map((shipment) => (
                    <li
                      key={shipment.id}
                      className="rounded-lg border border-border bg-muted/20 px-3 py-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 space-y-2">
                          <VendorReturnShipmentStepper
                            shipment={shipment}
                            compact
                          />
                          <ul className="space-y-1 text-sm">
                            {shipment.lines.map((line) => (
                              <li key={`${shipment.id}-${line.variantId}`}>
                                <span className="font-medium">
                                  {line.productName}
                                </span>
                                <span className="text-muted-foreground">
                                  {" "}
                                  · {line.sku} · qty {line.quantity}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <p className="text-xs text-muted-foreground">
                            Created {formatDateTime(shipment.createdAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {shipment.status === "pending_dispatch_to_vendor" ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => setDispatchTarget(shipment)}
                            >
                              Dispatch to vendor
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <Link
                              to={`/commerce/orders/${shipment.parentOrderId}`}
                            >
                              Open order
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || listQuery.isFetching}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages || listQuery.isFetching}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <DispatchVendorReturnDialog
        key={dispatchTarget?.id ?? "closed"}
        shipment={dispatchTarget}
        open={Boolean(dispatchTarget)}
        onClose={() => setDispatchTarget(null)}
      />
    </div>
  )
}
