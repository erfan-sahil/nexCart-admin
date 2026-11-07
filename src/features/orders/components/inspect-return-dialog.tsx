import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useReturnRefundPreview } from "../hooks"
import { formatMoney } from "../labels"
import type {
  AdminDeliveryReturn,
  InspectReturnLinePayload,
} from "../types/admin-orders.types"

type InspectReturnDialogProps = {
  returnItem: AdminDeliveryReturn
  currency: string
  open: boolean
  onClose: () => void
  isPending: boolean
  onSubmit: (lines: InspectReturnLinePayload[]) => Promise<void>
}

export function InspectReturnDialog({
  returnItem,
  currency,
  open,
  onClose,
  isPending,
  onSubmit,
}: InspectReturnDialogProps) {
  const [lines, setLines] = useState<InspectReturnLinePayload[]>(() =>
    returnItem.lines.map((line) => ({
      variantId: line.variantId,
      disposition: "sellable",
    }))
  )
  const [error, setError] = useState<string | null>(null)
  const previewQuery = useReturnRefundPreview(returnItem.id, open)
  const preview = previewQuery.data

  const submit = async () => {
    if (lines.length === 0) {
      setError("No return lines to inspect.")
      return
    }

    setError(null)
    await onSubmit(lines)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>Inspect returned products</DialogTitle>
        </DialogHeader>

        <DialogBody
          scrollClassName="min-h-0 flex-1"
          className="space-y-4 px-0 py-0"
        >
          <p className="text-sm text-muted-foreground">
            Mark each line sellable to restock and refund, or damaged to pause
            for manual resolution.
          </p>

          <ul className="divide-y divide-border rounded-lg border border-border">
            {returnItem.lines.map((line) => {
              const draft = lines.find(
                (row) => row.variantId === line.variantId
              )

              return (
                <li
                  key={line.variantId}
                  className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 text-sm">
                    <p className="font-medium">{line.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {line.sku} · qty {line.quantity} ·{" "}
                      {formatMoney(currency, line.unitPrice * line.quantity)}
                    </p>
                  </div>
                  <Select
                    value={draft?.disposition ?? "sellable"}
                    onValueChange={(value) =>
                      setLines((prev) =>
                        prev.map((row) =>
                          row.variantId === line.variantId
                            ? {
                                ...row,
                                disposition: value as "sellable" | "damaged",
                              }
                            : row
                        )
                      )
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sellable">Sellable</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </li>
              )
            })}
          </ul>

          {preview ? (
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm">
              <p className="font-medium">Refund preview</p>
              <dl className="mt-2 space-y-1.5">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Merchandise</dt>
                  <dd className="tabular-nums">
                    {formatMoney(currency, preview.merchandiseRefund)}
                  </dd>
                </div>
                {preview.couponShare > 0 ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Coupon share</dt>
                    <dd className="tabular-nums">
                      −{formatMoney(currency, preview.couponShare)}
                    </dd>
                  </div>
                ) : null}
                {preview.deliveryFeeRefund > 0 ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Delivery fee</dt>
                    <dd className="tabular-nums">
                      {formatMoney(currency, preview.deliveryFeeRefund)}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-3 border-t border-border pt-1.5">
                  <dt className="text-muted-foreground">Cash refund</dt>
                  <dd className="font-medium tabular-nums">
                    {formatMoney(currency, preview.cashRefundAmount)}
                  </dd>
                </div>
                {preview.balanceWaivedAmount > 0 ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Balance waived</dt>
                    <dd className="tabular-nums">
                      {formatMoney(currency, preview.balanceWaivedAmount)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </DialogBody>

        <DialogFooter className="shrink-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={() => void submit()}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Confirm inspection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
