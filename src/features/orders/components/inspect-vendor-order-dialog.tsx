import { useMemo, useState } from "react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApiError } from "@/lib/api/errors"

import {
  FULFILLMENT_REJECTION_REASONS,
  REJECTION_REASON_LABEL,
  type FulfillmentRejectionReason,
} from "../labels"
import type {
  AdminVendorOrder,
  InspectLinePayload,
} from "../types/admin-orders.types"

type LineDraft = InspectLinePayload & {
  sentQty: number
  productName: string
  sku: string
}

type InspectVendorOrderDialogProps = {
  vendorOrder: AdminVendorOrder | null
  open: boolean
  onClose: () => void
  onSubmit: (
    items: InspectLinePayload[],
    decisionStatus: string
  ) => Promise<void>
  isPending: boolean
}

function activeBatchLines(vendorOrder: AdminVendorOrder): LineDraft[] {
  const batch =
    vendorOrder.inboundBatches.find(
      (row) => row.status === "inspecting" || row.status === "received"
    ) ??
    [...vendorOrder.inboundBatches]
      .reverse()
      .find((row) => row.status !== "inspected")

  if (!batch) {
    return []
  }

  return batch.lines.map((line) => ({
    variantId: line.variantId,
    productName: line.productName,
    sku: line.sku,
    sentQty: line.sentQty,
    acceptedQty: line.sentQty,
    rejectedQty: 0,
    rejectionReason: undefined,
    rejectionNote: "",
  }))
}

export function InspectVendorOrderDialog({
  vendorOrder,
  open,
  onClose,
  onSubmit,
  isPending,
}: InspectVendorOrderDialogProps) {
  const [lines, setLines] = useState<LineDraft[]>(() =>
    vendorOrder ? activeBatchLines(vendorOrder) : []
  )
  const [error, setError] = useState<string | null>(null)

  const decisionStatus = useMemo(() => {
    const accepted = lines.reduce((sum, line) => sum + line.acceptedQty, 0)
    const rejected = lines.reduce((sum, line) => sum + line.rejectedQty, 0)

    if (accepted === 0 && rejected > 0) {
      return "rejected_at_warehouse"
    }

    if (rejected > 0) {
      return "partially_accepted"
    }

    return "accepted_at_warehouse"
  }, [lines])

  const updateLine = (variantId: string, patch: Partial<LineDraft>) => {
    setLines((current) =>
      current.map((line) =>
        line.variantId === variantId ? { ...line, ...patch } : line
      )
    )
  }

  const onAcceptAll = () => {
    setLines((current) =>
      current.map((line) => ({
        ...line,
        acceptedQty: line.sentQty,
        rejectedQty: 0,
        rejectionReason: undefined,
      }))
    )
  }

  const handleSubmit = async () => {
    if (!vendorOrder) {
      return
    }

    setError(null)

    for (const line of lines) {
      if (line.acceptedQty + line.rejectedQty !== line.sentQty) {
        setError(
          `Accepted + rejected must equal sent quantity for ${line.productName}.`
        )
        return
      }

      if (line.rejectedQty > 0 && !line.rejectionReason) {
        setError(`Select a rejection reason for ${line.productName}.`)
        return
      }
    }

    try {
      await onSubmit(
        lines.map(
          ({
            variantId,
            acceptedQty,
            rejectedQty,
            rejectionReason,
            rejectionNote,
          }) => ({
            variantId,
            acceptedQty,
            rejectedQty,
            ...(rejectedQty > 0
              ? {
                  rejectionReason:
                    rejectionReason as FulfillmentRejectionReason,
                  rejectionNote,
                }
              : {}),
          })
        ),
        decisionStatus
      )
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Inspection failed.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Warehouse inspection</DialogTitle>
        </DialogHeader>
        {vendorOrder ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {vendorOrder.vendorOrderNumber} · {vendorOrder.storeName}
            </p>
            <div className="space-y-3">
              {lines.map((line) => (
                <div
                  key={line.variantId}
                  className="rounded-lg border border-border p-3"
                >
                  <p className="text-sm font-medium">{line.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    Sent {line.sentQty} · SKU {line.sku}
                  </p>
                  <FieldGroup className="mt-3 gap-3 sm:grid-cols-2">
                    <Field>
                      <FieldLabel>Accepted</FieldLabel>
                      <Input
                        type="number"
                        min={0}
                        max={line.sentQty}
                        value={line.acceptedQty}
                        onChange={(event) => {
                          const acceptedQty = Number(event.target.value)
                          updateLine(line.variantId, {
                            acceptedQty,
                            rejectedQty: Math.max(
                              line.sentQty - acceptedQty,
                              0
                            ),
                          })
                        }}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Rejected</FieldLabel>
                      <Input
                        type="number"
                        min={0}
                        max={line.sentQty}
                        value={line.rejectedQty}
                        onChange={(event) => {
                          const rejectedQty = Number(event.target.value)
                          updateLine(line.variantId, {
                            rejectedQty,
                            acceptedQty: Math.max(
                              line.sentQty - rejectedQty,
                              0
                            ),
                          })
                        }}
                      />
                    </Field>
                    {line.rejectedQty > 0 ? (
                      <>
                        <Field>
                          <FieldLabel>Reason</FieldLabel>
                          <Select
                            value={line.rejectionReason ?? ""}
                            onValueChange={(value) =>
                              updateLine(line.variantId, {
                                rejectionReason:
                                  value as FulfillmentRejectionReason,
                              })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                              {FULFILLMENT_REJECTION_REASONS.map((reason) => (
                                <SelectItem key={reason} value={reason}>
                                  {REJECTION_REASON_LABEL[reason]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field>
                          <FieldLabel>Note</FieldLabel>
                          <Input
                            value={line.rejectionNote ?? ""}
                            onChange={(event) =>
                              updateLine(line.variantId, {
                                rejectionNote: event.target.value,
                              })
                            }
                            placeholder="Optional note"
                          />
                        </Field>
                      </>
                    ) : null}
                  </FieldGroup>
                </div>
              ))}
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        ) : null}
        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={onAcceptAll}>
            Accept all sent qty
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending || lines.length === 0}
              onClick={() => void handleSubmit()}
            >
              Submit inspection
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
