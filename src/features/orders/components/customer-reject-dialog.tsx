import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { formatMoney } from "../labels"
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

export function CustomerRejectDialog({
  order,
  open,
  onClose,
  isPending,
  onSubmit,
}: CustomerRejectDialogProps) {
  const [lines, setLines] = useState<LineDraft[]>(() => buildLines(order))
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)

  const selectedTotal = useMemo(
    () =>
      lines
        .filter((line) => line.selected && line.quantity > 0)
        .reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [lines]
  )

  const submit = async () => {
    const selected = lines.filter((line) => line.selected && line.quantity > 0)

    if (!reason.trim()) {
      setError("Reason is required.")
      return
    }

    if (selected.length === 0) {
      setError("Select at least one rejected product.")
      return
    }

    setError(null)
    await onSubmit({
      reason: reason.trim(),
      lines: selected.map((line) => ({
        variantId: line.variantId,
        quantity: line.quantity,
      })),
    })
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Customer rejected delivery</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select only the products the customer refused. Accepted items stay
            as a completed purchase.
          </p>

          <FieldGroup className="gap-3">
            <Field>
              <FieldLabel htmlFor="reject-reason">Reason</FieldLabel>
              <Textarea
                id="reject-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Damaged, wrong item, customer refused…"
                rows={3}
              />
            </Field>
          </FieldGroup>

          <ul className="divide-y divide-border rounded-lg border border-border">
            {lines.map((line) => (
              <li
                key={line.variantId}
                className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <label className="flex min-w-0 items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={line.selected}
                    onChange={(event) =>
                      setLines((prev) =>
                        prev.map((row) =>
                          row.variantId === line.variantId
                            ? { ...row, selected: event.target.checked }
                            : row
                        )
                      )
                    }
                  />
                  <span className="min-w-0">
                    <span className="block font-medium">
                      {line.productName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {line.sku} · {formatMoney(order.currency, line.unitPrice)}
                    </span>
                  </span>
                </label>
                <Input
                  type="number"
                  min={1}
                  max={line.maxQty}
                  disabled={!line.selected}
                  className="w-24"
                  value={line.quantity}
                  onChange={(event) => {
                    const next = Number(event.target.value)
                    setLines((prev) =>
                      prev.map((row) =>
                        row.variantId === line.variantId
                          ? {
                              ...row,
                              quantity: Number.isFinite(next)
                                ? Math.min(Math.max(1, next), row.maxQty)
                                : 1,
                            }
                          : row
                      )
                    )
                  }}
                />
              </li>
            ))}
          </ul>

          <p className="text-sm">
            Rejected merchandise{" "}
            <span className="font-medium tabular-nums">
              {formatMoney(order.currency, selectedTotal)}
            </span>
          </p>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={() => void submit()}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Record rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
