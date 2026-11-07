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
import { CancelVendorOrderDialog } from "./cancel-vendor-order-dialog"
import { InspectVendorOrderDialog } from "./inspect-vendor-order-dialog"
import { VendorReturnShipmentStepper } from "./vendor-return-shipment-status"

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
  const [cancelOpen, setCancelOpen] = useState(false)
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
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <p className="font-medium">{vendorOrder.storeName}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {vendorOrder.vendorOrderNumber}
            <span className="mx-1.5 text-border">·</span>
            <span className="tabular-nums">
              {formatMoney(order.currency, vendorOrder.itemsSubtotal)}
            </span>
          </p>
        </div>
        <UniversalBadge
          name={
            VENDOR_ORDER_STATUS_LABEL[vendorOrder.status] ?? vendorOrder.status
          }
          colors={vendorOrderStatusBadge(vendorOrder.status)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium sm:px-5">Item</th>
              <th className="px-3 py-2 text-right font-medium tabular-nums">
                Ordered
              </th>
              <th className="px-3 py-2 text-right font-medium tabular-nums">
                Target
              </th>
              <th className="px-3 py-2 text-right font-medium tabular-nums">
                Accepted
              </th>
              {(vendorOrder.rejectionSummary?.some(
                (row) => row.rejectedQty > 0
              ) ??
                false) && (
                <th className="px-4 py-2 text-right font-medium tabular-nums sm:px-5">
                  Customer rejected
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {vendorOrder.items.map((line) => {
              const rejection = vendorOrder.rejectionSummary?.find(
                (row) => row.variantId === line.variantId
              )
              const showRejectedColumn =
                vendorOrder.rejectionSummary?.some(
                  (row) => row.rejectedQty > 0
                ) ?? false

              return (
                <tr key={line.variantId}>
                  <td className="px-4 py-2.5 sm:px-5">
                    <p className="font-medium">{line.productName}</p>
                    <p className="text-xs text-muted-foreground">{line.sku}</p>
                  </td>
                  <td className="px-3 py-2.5 text-right text-muted-foreground tabular-nums">
                    {line.expectedQty}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {line.targetQty}
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                    {rejection
                      ? rejection.acceptedQty
                      : line.acceptedQtyCumulative}
                  </td>
                  {showRejectedColumn ? (
                    <td className="px-4 py-2.5 text-right tabular-nums sm:px-5">
                      {rejection && rejection.rejectedQty > 0 ? (
                        <span>
                          {rejection.rejectedQty}
                          {rejection.disposition &&
                          rejection.disposition !== "pending"
                            ? ` · ${rejection.disposition}`
                            : ""}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                  ) : null}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {vendorOrder.inboundBatches.length > 0 ? (
        <div className="border-t border-border px-4 py-3 sm:px-5">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
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
        <div className="border-t border-border px-4 py-3 sm:px-5">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Reject returns
          </p>
          <ul className="mt-2 space-y-2">
            {vendorOrder.rejectReturns.map((ret) => (
              <li
                key={ret.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-sm"
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

      {(vendorOrder.vendorReturnShipments?.length ?? 0) > 0 ? (
        <div className="border-t border-border px-4 py-3 sm:px-5">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Return to vendor
          </p>
          <ul className="mt-2 space-y-3">
            {vendorOrder.vendorReturnShipments?.map((shipment) => (
              <li
                key={shipment.id}
                className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2"
              >
                <VendorReturnShipmentStepper shipment={shipment} compact />
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {shipment.lines.map((line) => (
                    <li key={`${shipment.id}-${line.variantId}`}>
                      {line.productName} · {line.sku} · qty {line.quantity}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/20 px-4 py-3 sm:px-5">
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
          <span className="inline-flex items-center text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Ready to pack with siblings
          </span>
        ) : null}
        {vendorOrder.status !== "cancelled" &&
        vendorOrder.status !== "delivered" &&
        vendorOrder.status !== "customer_rejected" &&
        vendorOrder.status !== "partially_rejected" &&
        vendorOrder.status !== "delivery_failed" ? (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="ml-auto"
            disabled={mutation.isPending}
            onClick={() => setCancelOpen(true)}
          >
            Cancel vendor slice
          </Button>
        ) : null}
      </div>

      {actionError ? (
        <p className="border-t border-border px-4 py-2.5 text-sm text-destructive sm:px-5">
          {actionError}
        </p>
      ) : null}
      {mutation.isPending ? (
        <p className="inline-flex items-center gap-1.5 border-t border-border px-4 py-2 text-xs text-muted-foreground sm:px-5">
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

      <CancelVendorOrderDialog
        vendorOrder={vendorOrder}
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        isPending={mutation.isPending}
        onConfirm={async () => {
          setActionError(null)
          await mutation.mutateAsync({
            vendorOrderId: vendorOrder.id,
            payload: { status: "cancelled" },
          })
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
    </article>
  )
}
