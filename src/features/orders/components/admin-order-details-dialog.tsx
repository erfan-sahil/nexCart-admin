import {
  CalendarClock,
  CircleDollarSign,
  Loader2,
  MapPin,
  Package,
  Pencil,
  Phone,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
  Wallet,
  type AppIcon,
} from "@/lib/icons"

import { UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ApiError } from "@/lib/api/errors"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAdminOrder } from "../hooks"
import {
  formatMoney,
  fulfillmentStatusBadge,
  isPostShipmentStatus,
  orderStatusBadge,
  paymentStatusBadge,
} from "../labels"
import type {
  AdminOrderLineItem,
  AdminOrderListItem,
} from "../types/admin-orders.types"

type AdminOrderDetailsDialogProps = {
  order?: AdminOrderListItem | null
  orderId?: string | null
  open: boolean
  onClose: () => void
  onUpdate: (order: AdminOrderListItem) => void
}

type DetailTone = "brand" | "emerald" | "amber" | "violet"

const TONE_CLASS: Record<DetailTone, string> = {
  brand: "bg-brand/15 text-brand-text",
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
}

function DetailItem({
  icon: Icon,
  label,
  value,
  tone,
  nowrap = false,
  className,
}: {
  icon: AppIcon
  label: string
  value: string
  tone: DetailTone
  nowrap?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border/80 bg-card px-3.5 py-3",
        nowrap && "min-w-max flex-1",
        className
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          TONE_CLASS[tone]
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className={cn(nowrap ? "shrink-0" : "min-w-0 flex-1")}>
        <dt className="text-xs font-medium whitespace-nowrap text-muted-foreground">
          {label}
        </dt>
        <dd
          className={cn(
            "mt-0.5 text-sm font-medium text-foreground",
            nowrap ? "whitespace-nowrap" : "wrap-break-word"
          )}
        >
          {value}
        </dd>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-semibold tracking-wide text-brand-text uppercase">
      {children}
    </h3>
  )
}

export function AdminOrderDetailsDialog({
  order = null,
  orderId = null,
  open,
  onClose,
  onUpdate,
}: AdminOrderDetailsDialogProps) {
  const resolvedId = order?.id ?? orderId ?? ""

  if (!open || !resolvedId) {
    return null
  }

  return (
    <AdminOrderDetailsBody
      key={resolvedId}
      order={order}
      orderId={resolvedId}
      onClose={onClose}
      onUpdate={onUpdate}
    />
  )
}

function AdminOrderDetailsBody({
  order,
  orderId,
  onClose,
  onUpdate,
}: {
  order: AdminOrderListItem | null
  orderId: string
  onClose: () => void
  onUpdate: (order: AdminOrderListItem) => void
}) {
  const detailQuery = useAdminOrder(orderId)
  const full = detailQuery.data
  const summary = order ?? full

  const orderBadge = summary
    ? orderStatusBadge(summary.status)
    : orderStatusBadge("confirmed")
  const fulfillmentBadge = summary
    ? fulfillmentStatusBadge(summary.fulfillmentStatus)
    : fulfillmentStatusBadge("pending")
  const paymentBadge = summary
    ? paymentStatusBadge(summary.paymentStatus)
    : paymentStatusBadge("unpaid")

  const errorMessage =
    detailQuery.error instanceof ApiError
      ? detailQuery.error.message
      : detailQuery.isError
        ? "Could not load order details."
        : null

  const shipLine = full
    ? [full.shipping.line1, full.shipping.line2].filter(Boolean).join(", ")
    : ""
  const shipLocality = full
    ? [full.shipping.city, full.shipping.state, full.shipping.postalCode]
        .filter(Boolean)
        .join(", ")
    : ""
  const addressParts = [shipLine, shipLocality, full?.shipping.country].filter(
    Boolean
  )
  const deliveryAddress =
    addressParts.length > 0 ? addressParts.join(" · ") : "—"

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm ring-4 ring-background">
              <ShoppingBag className="size-6" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate font-mono text-lg font-semibold">
                {summary?.orderNumber ?? "Loading order…"}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                Commerce order
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <UniversalBadge
                  name={orderBadge.name}
                  colors={orderBadge.colors}
                  icon={orderBadge.icon}
                />
                <UniversalBadge
                  name={fulfillmentBadge.name}
                  colors={fulfillmentBadge.colors}
                  icon={fulfillmentBadge.icon}
                />
                <UniversalBadge
                  name={paymentBadge.name}
                  colors={paymentBadge.colors}
                  icon={paymentBadge.icon}
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        <DialogBody
          scrollClassName="max-h-[calc(100dvh-16rem)] bg-muted/20"
          viewportClassName="max-h-[calc(100dvh-16rem)]"
        >
          <div className="space-y-5 px-6 py-5">
            {detailQuery.isLoading && !full ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                <span className="sr-only">Loading order details</span>
              </div>
            ) : errorMessage || !full || !summary ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-destructive">
                {errorMessage ?? "Order not found."}
              </p>
            ) : (
              <>
                <section className="space-y-3">
                  <SectionLabel>Summary</SectionLabel>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <DetailItem
                      icon={CircleDollarSign}
                      label="Grand total"
                      value={formatMoney(summary.currency, summary.grandTotal)}
                      tone="emerald"
                    />
                    <DetailItem
                      icon={Wallet}
                      label="Payment"
                      value={`${paymentBadge.name} · ${summary.paymentMethod.toUpperCase()}`}
                      tone="violet"
                    />
                    <DetailItem
                      icon={Store}
                      label="Vendor orders"
                      value={String(summary.vendorOrderCount)}
                      tone="brand"
                    />
                    <DetailItem
                      icon={CalendarClock}
                      label="Placed"
                      value={formatDateTime(summary.createdAt)}
                      tone="amber"
                      nowrap
                    />
                  </dl>
                </section>

                <section className="space-y-3">
                  <SectionLabel>Delivery</SectionLabel>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <DetailItem
                      icon={UserRound}
                      label="Recipient"
                      value={full.shipping.recipientName}
                      tone="brand"
                    />
                    <DetailItem
                      icon={Phone}
                      label="Phone"
                      value={full.shipping.phone || "No phone on file"}
                      tone="emerald"
                    />
                    <DetailItem
                      icon={MapPin}
                      label="Address"
                      value={deliveryAddress}
                      tone="violet"
                      className="sm:col-span-2"
                    />
                    {full.shipment &&
                    isPostShipmentStatus(full.shipment.status) ? (
                      <DetailItem
                        icon={Truck}
                        label="Shipment"
                        value={
                          full.shipment.trackingNumber
                            ? `${full.shipment.carrier || "Carrier"} · ${full.shipment.trackingNumber}`
                            : full.shipment.status.replaceAll("_", " ")
                        }
                        tone="amber"
                        className="sm:col-span-2"
                      />
                    ) : null}
                  </dl>
                </section>

                <section className="space-y-3">
                  <SectionLabel>Products</SectionLabel>
                  <div className="space-y-4">
                    {full.vendorOrders.map((vendorOrder) => (
                      <div key={vendorOrder.id} className="space-y-2">
                        <p className="text-sm font-medium text-foreground">
                          {vendorOrder.storeName}
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {vendorOrder.vendorOrderNumber}
                          </span>
                        </p>
                        <ProductLines
                          currency={full.currency}
                          items={vendorOrder.items}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </DialogBody>

        <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            disabled={!full}
            onClick={() => full && onUpdate(full)}
          >
            <Pencil />
            Update order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ProductLines({
  currency,
  items,
}: {
  currency: string
  items: AdminOrderLineItem[]
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card px-3.5 py-4 text-sm text-muted-foreground">
        No line items for this vendor.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={`${item.variantId}-${item.sku}`}
          className="flex items-start gap-3 rounded-xl border border-border/80 bg-card px-3.5 py-3"
        >
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              TONE_CLASS.brand
            )}
          >
            <Package className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              {item.productName}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {item.sku} · Qty {item.targetQty}
              {item.acceptedQtyCumulative > 0
                ? ` · Accepted ${item.acceptedQtyCumulative}`
                : ""}
            </p>
          </div>
          <div className="shrink-0 text-right text-sm">
            <p className="font-medium tabular-nums">
              {formatMoney(currency, item.lineTotal)}
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {formatMoney(currency, item.unitPrice)} each
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
