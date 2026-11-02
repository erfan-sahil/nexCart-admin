import { useState } from "react"
import { Loader2 } from "lucide-react"

import { UniversalBadge } from "@/components/shared"
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
import { ApiError } from "@/lib/api/errors"

import { useUpdateAdminVendorOrderStatus } from "../hooks"
import {
  formatMoney,
  VENDOR_ORDER_STATUS_LABEL,
  vendorOrderStatusBadge,
} from "../labels"
import type {
  AdminOrderDetail,
  AdminVendorOrder,
} from "../types/admin-orders.types"
import { InspectVendorOrderDialog } from "./inspect-vendor-order-dialog"

type VendorOrderFulfillmentCardProps = {
  order: AdminOrderDetail
  vendorOrder: AdminVendorOrder
}

export function VendorOrderFulfillmentCard({
  order,
  vendorOrder,
}: VendorOrderFulfillmentCardProps) {
  const mutation = useUpdateAdminVendorOrderStatus(order.id)
  const [inspectOpen, setInspectOpen] = useState(false)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [targetDraft, setTargetDraft] = useState<
    { variantId: string; productName: string; targetQty: number; max: number }[]
  >([])
  const [actionError, setActionError] = useState<string | null>(null)

  const runStatus = async (
    payload: Parameters<typeof mutation.mutateAsync>[0]["payload"]
  ) => {
    setActionError(null)
    try {
      await mutation.mutateAsync({ vendorOrderId: vendorOrder.id, payload })
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Action failed.")
    }
  }

  const pendingReturn = vendorOrder.rejectReturns.find(
    (row) => row.status === "pending_return"
  )

  const packReady = vendorOrder.items.every(
    (line) => line.acceptedQtyCumulative === line.targetQty
  )

  const openAdjust = () => {
    setTargetDraft(
      vendorOrder.items.map((line) => ({
        variantId: line.variantId,
        productName: line.productName,
        targetQty: line.targetQty,
        max: line.expectedQty,
      }))
    )
    setAdjustOpen(true)
  }

  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{vendorOrder.storeName}</p>
          <p className="text-sm text-muted-foreground">
            {vendorOrder.vendorOrderNumber}
          </p>
        </div>
        <UniversalBadge
          name={
            VENDOR_ORDER_STATUS_LABEL[vendorOrder.status] ?? vendorOrder.status
          }
          colors={vendorOrderStatusBadge(vendorOrder.status)}
        />
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        {vendorOrder.items.map((line) => (
          <li
            key={line.variantId}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-2"
          >
            <span>
              {line.productName}{" "}
              <span className="text-muted-foreground">· {line.sku}</span>
            </span>
            <span className="text-muted-foreground tabular-nums">
              accepted {line.acceptedQtyCumulative} / target {line.targetQty}{" "}
              (ordered {line.expectedQty})
            </span>
          </li>
        ))}
      </ul>

      {vendorOrder.inboundBatches.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Inbound batches
          </p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {vendorOrder.inboundBatches.map((batch) => (
              <li key={batch.id}>
                Batch #{batch.sequence} · {batch.status}
                {batch.inspectedAt
                  ? ` · inspected ${new Date(batch.inspectedAt).toLocaleString()}`
                  : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {vendorOrder.rejectReturns.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Reject returns
          </p>
          <ul className="mt-2 space-y-2">
            {vendorOrder.rejectReturns.map((ret) => (
              <li
                key={ret.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed px-3 py-2 text-sm"
              >
                <span>{ret.status.replaceAll("_", " ")}</span>
                {ret.status === "pending_return" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={mutation.isPending}
                    onClick={() =>
                      void runStatus({
                        status: "return_rejects_to_vendor",
                        rejectReturnId: ret.id,
                      })
                    }
                  >
                    Mark in transit to vendor
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {vendorOrder.status === "sending_to_warehouse" ? (
          <Button
            type="button"
            size="sm"
            disabled={mutation.isPending}
            onClick={() => void runStatus({ status: "received_at_warehouse" })}
          >
            Mark received
          </Button>
        ) : null}
        {vendorOrder.status === "received_at_warehouse" ? (
          <Button
            type="button"
            size="sm"
            disabled={mutation.isPending}
            onClick={() => void runStatus({ status: "inspecting" })}
          >
            Start inspection
          </Button>
        ) : null}
        {vendorOrder.status === "inspecting" ? (
          <Button
            type="button"
            size="sm"
            disabled={mutation.isPending}
            onClick={() => setInspectOpen(true)}
          >
            Submit inspection
          </Button>
        ) : null}
        {(vendorOrder.status === "partially_accepted" ||
          vendorOrder.status === "rejected_at_warehouse") &&
        pendingReturn ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={mutation.isPending}
            onClick={() =>
              void runStatus({
                status: "return_rejects_to_vendor",
                rejectReturnId: pendingReturn.id,
              })
            }
          >
            Return rejects to vendor
          </Button>
        ) : null}
        {vendorOrder.status === "partially_accepted" ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={openAdjust}
          >
            Adjust target qty
          </Button>
        ) : null}
        {packReady ? (
          <span className="inline-flex items-center text-xs text-emerald-700">
            Ready to pack with siblings
          </span>
        ) : null}
        {vendorOrder.status !== "cancelled" &&
        vendorOrder.status !== "delivered" ? (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={mutation.isPending}
            onClick={() => void runStatus({ status: "cancelled" })}
          >
            Cancel vendor slice
          </Button>
        ) : null}
      </div>

      {actionError ? (
        <p className="mt-3 text-sm text-destructive">{actionError}</p>
      ) : null}
      {mutation.isPending ? (
        <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          Updating…
        </p>
      ) : null}

      <InspectVendorOrderDialog
        key={`${vendorOrder.id}-${inspectOpen}`}
        vendorOrder={vendorOrder}
        open={inspectOpen}
        onClose={() => setInspectOpen(false)}
        isPending={mutation.isPending}
        onSubmit={async (items, decisionStatus) => {
          await runStatus({ status: decisionStatus, items })
        }}
      />

      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust target quantity</DialogTitle>
          </DialogHeader>
          <FieldGroup className="gap-3">
            {targetDraft.map((line, index) => (
              <Field key={line.variantId}>
                <FieldLabel>{line.productName}</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  max={line.max}
                  value={line.targetQty}
                  onChange={(event) => {
                    const targetQty = Number(event.target.value)
                    setTargetDraft((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, targetQty } : row
                      )
                    )
                  }}
                />
              </Field>
            ))}
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAdjustOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={mutation.isPending}
              onClick={() =>
                void runStatus({
                  status: "adjust_target_qty",
                  adjustQuantities: targetDraft.map((line) => ({
                    variantId: line.variantId,
                    targetQty: line.targetQty,
                  })),
                }).then(() => setAdjustOpen(false))
              }
            >
              Save targets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="mt-3 text-xs text-muted-foreground">
        Subtotal {formatMoney(order.currency, vendorOrder.itemsSubtotal)}
      </p>
    </article>
  )
}
