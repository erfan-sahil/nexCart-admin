import { useState } from "react"
import { Loader2, PackageX, RotateCcw } from "lucide-react"

import { UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/errors"
import { formatDateTime } from "@/lib/format"

import { useDeliveryReturnActions } from "../hooks"
import {
  RETURN_KIND_LABEL,
  RETURN_STATUS_LABEL,
  formatMoney,
  returnStatusBadge,
} from "../labels"
import type {
  AdminDeliveryReturn,
  AdminOrderDetail,
} from "../types/admin-orders.types"
import { InspectReturnDialog } from "./inspect-return-dialog"

type DeliveryReturnCardProps = {
  order: AdminOrderDetail
  returnItem: AdminDeliveryReturn
}

export function DeliveryReturnCard({
  order,
  returnItem,
}: DeliveryReturnCardProps) {
  const actions = useDeliveryReturnActions(order.id)
  const [inspectOpen, setInspectOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const badge = returnStatusBadge(returnItem.status)
  const shipmentStatus = order.shipment?.status ?? ""

  const pending =
    actions.returning.isPending ||
    actions.receive.isPending ||
    actions.inspect.isPending ||
    actions.resolve.isPending

  const run = async (fn: () => Promise<unknown>) => {
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not update return."
      )
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-start gap-3 border-b border-border px-4 py-3.5 sm:px-5">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-text">
          <PackageX className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">Delivery return</h3>
            <UniversalBadge
              name={badge.name}
              colors={badge.colors}
              icon={badge.icon}
            />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {RETURN_KIND_LABEL[returnItem.kind] ?? returnItem.kind}
            <span className="mx-1.5 text-border">·</span>
            {formatDateTime(returnItem.createdAt)}
          </p>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <p className="text-sm text-muted-foreground">{returnItem.reason}</p>

        <ul className="space-y-2 text-sm">
          {returnItem.lines.map((line) => (
            <li
              key={`${line.variantId}-${line.sku}`}
              className="flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-medium">{line.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {line.sku} · qty {line.quantity}
                  {line.disposition !== "pending"
                    ? ` · ${line.disposition}`
                    : ""}
                </p>
              </div>
              <p className="shrink-0 tabular-nums">
                {formatMoney(order.currency, line.unitPrice * line.quantity)}
              </p>
            </li>
          ))}
        </ul>

        {returnItem.status === "refunded" ||
        returnItem.cashRefundAmount > 0 ||
        returnItem.balanceWaivedAmount > 0 ? (
          <dl className="space-y-1.5 rounded-lg border border-border bg-muted/30 px-3 py-3 text-sm">
            {returnItem.cashRefundAmount > 0 ? (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Cash refund</dt>
                <dd className="font-medium tabular-nums">
                  {formatMoney(order.currency, returnItem.cashRefundAmount)}
                </dd>
              </div>
            ) : null}
            {returnItem.balanceWaivedAmount > 0 ? (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Balance waived</dt>
                <dd className="tabular-nums">
                  {formatMoney(order.currency, returnItem.balanceWaivedAmount)}
                </dd>
              </div>
            ) : null}
            {returnItem.deliveryFeeRefund > 0 ? (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Delivery fee refund</dt>
                <dd className="tabular-nums">
                  {formatMoney(order.currency, returnItem.deliveryFeeRefund)}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-3 border-t border-border pt-1.5">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                {RETURN_STATUS_LABEL[returnItem.status] ?? returnItem.status}
              </dd>
            </div>
          </dl>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {returnItem.status === "pending_warehouse_receipt" &&
          ["delivery_failed", "customer_rejected"].includes(shipmentStatus) ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() =>
                void run(() => actions.returning.mutateAsync(returnItem.id))
              }
            >
              {actions.returning.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RotateCcw className="size-4" />
              )}
              Mark returning
            </Button>
          ) : null}

          {returnItem.status === "pending_warehouse_receipt" ? (
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={() =>
                void run(() => actions.receive.mutateAsync(returnItem.id))
              }
            >
              {actions.receive.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Mark received at warehouse
            </Button>
          ) : null}

          {returnItem.status === "received_at_warehouse" ? (
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={() => setInspectOpen(true)}
            >
              Inspect return
            </Button>
          ) : null}

          {returnItem.status === "damaged" ||
          returnItem.status === "inspection_rejected" ? (
            <>
              <Button
                type="button"
                size="sm"
                disabled={pending}
                onClick={() =>
                  void run(() =>
                    actions.resolve.mutateAsync({
                      returnId: returnItem.id,
                      payload: { action: "refund_without_restock" },
                    })
                  )
                }
              >
                Refund without restock
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  void run(() =>
                    actions.resolve.mutateAsync({
                      returnId: returnItem.id,
                      payload: { action: "close_without_refund" },
                    })
                  )
                }
              >
                Close without refund
              </Button>
            </>
          ) : null}
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <InspectReturnDialog
        key={`${returnItem.id}-${inspectOpen}`}
        returnItem={returnItem}
        currency={order.currency}
        open={inspectOpen}
        onClose={() => setInspectOpen(false)}
        isPending={actions.inspect.isPending}
        onSubmit={async (lines) => {
          await actions.inspect.mutateAsync({
            returnId: returnItem.id,
            lines,
          })
          setInspectOpen(false)
        }}
      />
    </section>
  )
}
