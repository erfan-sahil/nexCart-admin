import { useMemo, useState } from "react"
import { ExternalLink, Eye, Loader2, MoreHorizontal } from "@/lib/icons"
import { useNavigate } from "react-router"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ApiError } from "@/lib/api/errors"
import { formatDateTime } from "@/lib/format"

import { useAdminVendorReturnShipments } from "../hooks"
import type { VendorReturnShipment } from "../types/admin-orders.types"
import { AdminOrderDetailsDialog } from "./admin-order-details-dialog"
import { DispatchVendorReturnDialog } from "./dispatch-vendor-return-dialog"
import { VendorReturnShipmentStepper } from "./vendor-return-shipment-status"

type VendorReturnShipmentsPanelProps = {
  embedded?: boolean
  status?: string
}

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

export function VendorReturnShipmentsPanel({
  embedded = false,
  status: controlledStatus = "all",
}: VendorReturnShipmentsPanelProps) {
  const navigate = useNavigate()
  const status = controlledStatus
  const [page, setPage] = useState(1)
  const [dispatchTarget, setDispatchTarget] =
    useState<VendorReturnShipment | null>(null)
  const [detailsOrderId, setDetailsOrderId] = useState<string | null>(null)

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

  const content = (
    <>
      {listQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-7 animate-spin text-muted-foreground" />
        </div>
      ) : errorMessage ? (
        <p className="px-4 py-12 text-center text-sm text-destructive sm:px-5">
          {errorMessage}
        </p>
      ) : items.length === 0 ? (
        <p className="px-4 py-12 text-center text-sm text-muted-foreground sm:px-5">
          No vendor return shipments yet. They appear after a delivery return is
          refunded with sellable lines.
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
                      <div className="min-w-0 flex-1 space-y-2">
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
                      <div className="flex flex-wrap items-center gap-2">
                        {shipment.status === "pending_dispatch_to_vendor" ? (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setDispatchTarget(shipment)}
                          >
                            Dispatch to vendor
                          </Button>
                        ) : null}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="cursor-pointer"
                              aria-label={`Actions for shipment ${shipment.id}`}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-44">
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onSelect={() => {
                                window.setTimeout(
                                  () =>
                                    setDetailsOrderId(shipment.parentOrderId),
                                  0
                                )
                              }}
                            >
                              <Eye className="size-3.5" />
                              Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onSelect={() => {
                                window.setTimeout(
                                  () =>
                                    navigate(
                                      `/commerce/orders/${shipment.parentOrderId}`
                                    ),
                                  0
                                )
                              }}
                            >
                              <ExternalLink className="size-3.5" />
                              Open order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-2.5 sm:px-5">
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
    </>
  )

  return (
    <>
      {embedded ? (
        content
      ) : (
        <div className="flex w-full min-w-0 flex-col gap-4">{content}</div>
      )}

      <DispatchVendorReturnDialog
        key={dispatchTarget?.id ?? "closed"}
        shipment={dispatchTarget}
        open={Boolean(dispatchTarget)}
        onClose={() => setDispatchTarget(null)}
      />

      <AdminOrderDetailsDialog
        orderId={detailsOrderId}
        open={Boolean(detailsOrderId)}
        onClose={() => setDetailsOrderId(null)}
        onUpdate={(order) => {
          setDetailsOrderId(null)
          navigate(`/commerce/orders/${order.id}`)
        }}
      />
    </>
  )
}
