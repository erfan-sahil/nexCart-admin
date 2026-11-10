import { useMemo, useState } from "react"
import { RefreshCcw } from "@/lib/icons"

import { UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api/errors"
import { cn } from "@/lib/utils"

import {
  formatMoney,
  fulfillmentStatusBadge,
  orderStatusBadge,
} from "../labels"
import type {
  AdminOrderDetail,
  DeliveryReturnLinePayload,
} from "../types/admin-orders.types"

type LineDraft = {
  variantId: string
  productName: string
  sku: string
  maxQty: number
  unitPrice: number
  quantity: number
  selected: boolean
}

type CustomerRejectDialogProps = {
  order: AdminOrderDetail
  open: boolean
  onClose: () => void
  isPending: boolean
  onSubmit: (input: {
    reason: string
    lines: DeliveryReturnLinePayload[]
  }) => Promise<void>
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-semibold tracking-wide text-brand-text uppercase">
      {children}
    </h3>
  )
}

function buildLines(order: AdminOrderDetail): LineDraft[] {
  return order.vendorOrders
    .filter((vendorOrder) => vendorOrder.status !== "cancelled")
    .flatMap((vendorOrder) =>
      vendorOrder.items.map((item) => ({
        variantId: item.variantId,
        productName: item.productName,
        sku: item.sku,
        maxQty: item.targetQty ?? item.quantity,
        unitPrice: item.unitPrice,
        quantity: item.targetQty ?? item.quantity,
        selected: false,
      }))
    )
}

function CustomerRejectForm({
  order,
  onClose,
  isPending,
  onSubmit,
}: {
  order: AdminOrderDetail
  onClose: () => void
  isPending: boolean
  onSubmit: CustomerRejectDialogProps["onSubmit"]
}) {
  const [lines, setLines] = useState<LineDraft[]>(() => buildLines(order))
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)

  const orderBadge = orderStatusBadge(order.status)
  const fulfillmentBadge = fulfillmentStatusBadge(order.fulfillmentStatus)

  const selectedLines = useMemo(
    () => lines.filter((line) => line.selected && line.quantity > 0),
    [lines]
  )

  const selectedTotal = useMemo(
    () =>
      selectedLines.reduce(
        (sum, line) => sum + line.unitPrice * line.quantity,
        0
      ),
    [selectedLines]
  )

  const submit = async () => {
    if (!reason.trim()) {
      setError("Reason is required.")
      return
    }

    if (selectedLines.length === 0) {
      setError("Select at least one rejected product.")
      return
    }

    setError(null)
    try {
      await onSubmit({
        reason: reason.trim(),
        lines: selectedLines.map((line) => ({
          variantId: line.variantId,
          quantity: line.quantity,
        })),
      })
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not record customer rejection."
      )
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !isPending) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[min(40rem,calc(100dvh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="shrink-0 border-b border-amber-500/25 bg-amber-500/10 px-5 py-5 text-left">
          <div className="flex items-center gap-3.5 pr-8">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-sm ring-2 ring-background dark:bg-amber-500">
              <RefreshCcw className="size-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate font-mono text-lg font-semibold">
                {order.orderNumber}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-foreground/70">
                Customer rejected delivery · {order.shipping.recipientName}
              </DialogDescription>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
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
              </div>
            </div>
          </div>
        </DialogHeader>

        <DialogBody
          scrollClassName="min-h-0 flex-1 bg-muted/20"
          viewportClassName="max-h-[min(26rem,calc(100dvh-15rem))]"
          className="space-y-4 px-5 py-5"
        >
          <section className="space-y-2.5">
            <SectionLabel>Reason</SectionLabel>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="reject-reason">Customer reason</FieldLabel>
                <Textarea
                  id="reject-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Damaged, wrong item, customer refused…"
                  rows={3}
                  disabled={isPending}
                />
              </Field>
            </FieldGroup>
          </section>

          <section className="space-y-2.5">
            <SectionLabel>Rejected products</SectionLabel>
            <p className="text-sm text-muted-foreground">
              Select refused lines only; other items remain purchased.
            </p>
            {lines.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-card px-3 py-6 text-center text-sm text-muted-foreground">
                No line items available for this order.
              </p>
            ) : (
              <ul className="space-y-2">
                {lines.map((line) => (
                  <li
                    key={line.variantId}
                    className={cn(
                      "rounded-lg border border-border/80 bg-card px-3.5 py-3 transition-colors",
                      line.selected && "border-brand/40 bg-brand-soft/30"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id={`reject-${line.variantId}`}
                        checked={line.selected}
                        disabled={isPending}
                        onCheckedChange={(checked) =>
                          setLines((prev) =>
                            prev.map((row) =>
                              row.variantId === line.variantId
                                ? { ...row, selected: checked === true }
                                : row
                            )
                          )
                        }
                        className="mt-0.5"
                      />
                      <label
                        htmlFor={`reject-${line.variantId}`}
                        className="min-w-0 flex-1 cursor-pointer"
                      >
                        <p className="text-sm leading-snug font-medium text-foreground">
                          {line.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {line.sku} · max {line.maxQty}
                        </p>
                      </label>
                      <div className="flex shrink-0 items-center gap-2">
                        <FieldLabel
                          htmlFor={`reject-qty-${line.variantId}`}
                          className="sr-only"
                        >
                          Quantity
                        </FieldLabel>
                        <Input
                          id={`reject-qty-${line.variantId}`}
                          type="number"
                          min={1}
                          max={line.maxQty}
                          disabled={!line.selected || isPending}
                          className="h-8 w-20 tabular-nums"
                          value={line.quantity}
                          onChange={(event) => {
                            const next = Number(event.target.value)
                            setLines((prev) =>
                              prev.map((row) =>
                                row.variantId === line.variantId
                                  ? {
                                      ...row,
                                      quantity: Number.isFinite(next)
                                        ? Math.min(
                                            Math.max(1, next),
                                            row.maxQty
                                          )
                                        : 1,
                                    }
                                  : row
                              )
                            )
                          }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-card px-3.5 py-3 text-sm">
            <span className="text-muted-foreground">
              {selectedLines.length > 0
                ? `${selectedLines.length} line${selectedLines.length === 1 ? "" : "s"} selected`
                : "No lines selected"}
            </span>
            <span className="font-medium tabular-nums">
              {formatMoney(order.currency, selectedTotal)}
            </span>
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
        </DialogBody>

        <DialogFooter className="shrink-0 border-t border-border bg-card px-5 py-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            disabled={isPending}
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            disabled={isPending || lines.length === 0}
            onClick={() => void submit()}
          >
            <RefreshCcw />
            {isPending ? "Recording…" : "Record rejection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function CustomerRejectDialog({
  order,
  open,
  onClose,
  isPending,
  onSubmit,
}: CustomerRejectDialogProps) {
  if (!open) {
    return null
  }

  return (
    <CustomerRejectForm
      key={order.id}
      order={order}
      onClose={onClose}
      isPending={isPending}
      onSubmit={onSubmit}
    />
  )
}
