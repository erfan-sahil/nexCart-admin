import { ArrowLeft, Loader2 } from "@/lib/icons"
import { Link, useParams } from "react-router"

import { UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/errors"
import { formatDateTime } from "@/lib/format"

import { useAdminOrder, useCancelAdminOrder } from "../hooks"
import {
  formatMoney,
  fulfillmentStatusBadge,
  orderStatusBadge,
  paymentStatusBadge,
} from "../labels"
import { CodActionsCard } from "./cod-actions-card"
import { DeliveryReturnCard } from "./delivery-return-card"
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
      <div className="flex w-full justify-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (errorMessage || !order) {
    return (
      <div className="flex w-full flex-col items-center gap-4 py-20 text-center">
        <p className="text-sm text-destructive">
          {errorMessage ?? "Order not found."}
        </p>
        <Button type="button" variant="outline" asChild>
          <Link to="/commerce/orders">Back to orders</Link>
        </Button>
      </div>
    )
  }

  const status = orderStatusBadge(order.status)
  const fulfillment = fulfillmentStatusBadge(order.fulfillmentStatus)
  const payment = paymentStatusBadge(order.paymentStatus)
  const shipLine = [order.shipping.line1, order.shipping.line2]
    .filter(Boolean)
    .join(", ")
  const shipLocality = [
    order.shipping.city,
    order.shipping.state,
    order.shipping.postalCode,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      {/* Identity */}
      <header className="space-y-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2 w-fit text-muted-foreground"
          asChild
        >
          <Link to="/commerce/orders">
            <ArrowLeft />
            Orders
          </Link>
        </Button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {order.orderNumber}
            </h1>
            <div className="flex flex-wrap items-center gap-1.5">
              <UniversalBadge
                name={status.name}
                colors={status.colors}
                icon={status.icon}
              />
              <UniversalBadge
                name={fulfillment.name}
                colors={fulfillment.colors}
                icon={fulfillment.icon}
              />
              <UniversalBadge
                name={payment.name}
                colors={payment.colors}
                icon={payment.icon}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Placed {formatDateTime(order.createdAt)}
              <span className="mx-1.5 text-border">·</span>
              {order.vendorOrders.length} vendor
              {order.vendorOrders.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <div className="min-w-[8.5rem]">
              <p className="text-xs text-muted-foreground">Grand total</p>
              <p className="text-2xl font-semibold tracking-tight tabular-nums">
                {formatMoney(order.currency, order.grandTotal)}
              </p>
            </div>
            {order.canCancel ? (
              <Button
                type="button"
                variant="destructive"
                disabled={cancel.isPending}
                onClick={() => void onCancel()}
              >
                {cancel.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Cancel order
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Context: who / where / money */}
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Delivery
          </h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Customer</dt>
              <dd className="mt-0.5 font-medium">
                {order.shipping.recipientName}
              </dd>
              <dd className="text-muted-foreground">{order.shipping.phone}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Address</dt>
              <dd className="mt-0.5">{shipLine}</dd>
              {shipLocality ? (
                <dd className="text-muted-foreground">{shipLocality}</dd>
              ) : null}
              {order.shipping.country ? (
                <dd className="text-muted-foreground">
                  {order.shipping.country}
                </dd>
              ) : null}
            </div>
          </dl>
        </article>

        <article className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Payment summary
          </h2>
          <dl className="mt-3 space-y-2.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Method</dt>
              <dd className="font-medium uppercase">{order.paymentMethod}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Items</dt>
              <dd className="tabular-nums">
                {formatMoney(order.currency, order.totals.itemsSubtotal)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Delivery fee</dt>
              <dd className="tabular-nums">
                {formatMoney(order.currency, order.totals.deliveryFee)}
              </dd>
            </div>
            {order.totals.discountTotal > 0 ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Discount</dt>
                <dd className="text-emerald-700 tabular-nums dark:text-emerald-400">
                  −{formatMoney(order.currency, order.totals.discountTotal)}
                </dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3 border-t border-border pt-2.5">
              <dt className="font-medium">Paid</dt>
              <dd className="font-medium tabular-nums">
                {formatMoney(order.currency, order.payment.amountPaid)}
              </dd>
            </div>
            {(order.payment.amountRefunded ?? 0) > 0 ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Refunded</dt>
                <dd className="font-medium text-emerald-700 tabular-nums dark:text-emerald-400">
                  {formatMoney(
                    order.currency,
                    order.payment.amountRefunded ?? 0
                  )}
                </dd>
              </div>
            ) : null}
            {order.payment.balanceDue > 0 ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Balance due</dt>
                <dd className="font-medium text-amber-700 tabular-nums dark:text-amber-300">
                  {formatMoney(order.currency, order.payment.balanceDue)}
                </dd>
              </div>
            ) : null}
          </dl>
        </article>
      </section>

      {/* Workflow: intake left, outbound + audit right */}
      <div className="grid w-full min-w-0 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.9fr)]">
        <section className="min-w-0 space-y-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Vendor intake
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Receive, inspect, and accept each vendor slice before packing.
            </p>
          </div>
          <div className="space-y-3">
            {order.vendorOrders.map((vendorOrder) => (
              <VendorOrderFulfillmentCard
                key={vendorOrder.id}
                order={order}
                vendorOrder={vendorOrder}
              />
            ))}
          </div>
        </section>

        <aside className="min-w-0 space-y-3 xl:sticky xl:top-20 xl:self-start">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Outbound & records
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Ship the parent order, settle COD, and review activity.
            </p>
          </div>
          <ParentOrderFulfillmentCard order={order} />
          {(order.returns ?? []).map((returnItem) => (
            <DeliveryReturnCard
              key={returnItem.id}
              order={order}
              returnItem={returnItem}
            />
          ))}
          <CodActionsCard order={order} />

          <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
              <h3 className="text-sm font-semibold">Activity</h3>
              <span className="text-xs text-muted-foreground tabular-nums">
                {order.activity.length}
              </span>
            </div>
            {order.activity.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-5">
                No activity recorded yet.
              </p>
            ) : (
              <ol className="max-h-80 divide-y divide-border overflow-y-auto">
                {order.activity.map((row) => (
                  <li key={row.id} className="px-4 py-3 sm:px-5">
                    <p className="text-sm font-medium capitalize">
                      {row.action.replaceAll("_", " ")}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {row.actorRole}
                      <span className="mx-1.5 text-border">·</span>
                      {formatDateTime(row.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}
