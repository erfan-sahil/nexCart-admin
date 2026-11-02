import { ArrowLeft, Loader2 } from "lucide-react"
import { Link, useParams } from "react-router"

import { badgeColors, UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/errors"
import { formatDateTime } from "@/lib/format"

import { useAdminOrder, useCancelAdminOrder } from "../hooks"
import {
  formatMoney,
  FULFILLMENT_STATUS_LABEL,
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
} from "../labels"
import { CodActionsCard } from "./cod-actions-card"
import { ParentOrderFulfillmentCard } from "./parent-order-fulfillment-card"
import { VendorOrderFulfillmentCard } from "./vendor-order-fulfillment-card"

export function AdminOrderDetailPageContent() {
  const { orderId = "" } = useParams()
  const detailQuery = useAdminOrder(orderId)
  const cancel = useCancelAdminOrder()
  const order = detailQuery.data

  const errorMessage =
    detailQuery.error instanceof ApiError
      ? detailQuery.error.message
      : detailQuery.isError
        ? "Could not load order."
        : null

  const onCancel = async () => {
    if (!order) {
      return
    }

    await cancel.mutateAsync(order.id)
  }

  if (detailQuery.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (errorMessage || !order) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <p className="text-sm text-destructive">
          {errorMessage ?? "Order not found."}
        </p>
        <Button type="button" variant="outline" asChild>
          <Link to="/commerce/orders">Back to orders</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link to="/commerce/orders">
            <ArrowLeft />
            All orders
          </Link>
        </Button>
      </div>

      <header className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              {order.orderNumber}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <UniversalBadge
              name={ORDER_STATUS_LABEL[order.status] ?? order.status}
              colors={badgeColors.submitted}
            />
            <UniversalBadge
              name={
                FULFILLMENT_STATUS_LABEL[order.fulfillmentStatus] ??
                order.fulfillmentStatus
              }
              colors={badgeColors.neutral}
            />
            <UniversalBadge
              name={
                PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus
              }
              colors={badgeColors.neutral}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Customer</p>
            <p className="text-sm font-medium">
              {order.shipping.recipientName}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.shipping.phone}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Ship to</p>
            <p className="text-sm">
              {order.shipping.line1}, {order.shipping.city}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Payment</p>
            <p className="text-sm">{order.paymentMethod.toUpperCase()}</p>
            <p className="text-sm tabular-nums">
              Paid {formatMoney(order.currency, order.payment.amountPaid)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Total</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatMoney(order.currency, order.grandTotal)}
            </p>
          </div>
        </div>

        {order.canCancel ? (
          <Button
            type="button"
            variant="destructive"
            className="mt-5"
            disabled={cancel.isPending}
            onClick={() => void onCancel()}
          >
            Cancel entire order
          </Button>
        ) : null}
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Vendor fulfillment</h2>
        {order.vendorOrders.map((vendorOrder) => (
          <VendorOrderFulfillmentCard
            key={vendorOrder.id}
            order={order}
            vendorOrder={vendorOrder}
          />
        ))}
      </section>

      <ParentOrderFulfillmentCard order={order} />
      <CodActionsCard order={order} />

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Activity</h2>
        <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm text-muted-foreground">
          {order.activity.length === 0 ? (
            <li>No activity recorded yet.</li>
          ) : (
            order.activity.map((row) => (
              <li key={row.id}>
                {row.action.replaceAll("_", " ")} · {row.actorRole} ·{" "}
                {formatDateTime(row.createdAt)}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  )
}
