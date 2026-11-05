import { useMemo, useState } from "react"
import { ChevronDown, Loader2, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api/errors"

import { useUpdateAdminOrderStatus } from "../hooks"
import { SHIPMENT_STATUS_LABEL } from "../labels"
import type {
  AdminOrderDetail,
  UpdateAdminOrderStatusPayload,
} from "../types/admin-orders.types"
import { CustomerRejectDialog } from "./customer-reject-dialog"

type ParentOrderFulfillmentCardProps = {
  order: AdminOrderDetail
}

type ShipmentAction = {
  label: string
  status: UpdateAdminOrderStatusPayload["status"]
  needsTracking?: boolean
  needsReason?: boolean
  opensRejectDialog?: boolean
}

const BASE_ACTIONS: ShipmentAction[] = [
  { label: "Mark packed", status: "packed" },
  { label: "Mark shipped", status: "shipped", needsTracking: true },
  { label: "Out for delivery", status: "out_for_delivery" },
  { label: "Mark delivered", status: "delivered" },
]

function actionsForShipment(status: string): ShipmentAction[] {
  if (status === "delivered") {
    return []
  }

  if (
    [
      "delivery_failed",
      "customer_rejected",
      "returning_to_warehouse",
      "returned_to_warehouse",
    ].includes(status)
  ) {
    return []
  }

  if (status === "out_for_delivery") {
    return [
      { label: "Mark delivered", status: "delivered" },
      {
        label: "Delivery failed",
        status: "delivery_failed",
        needsReason: true,
      },
      {
        label: "Customer rejected",
        status: "customer_rejected",
        opensRejectDialog: true,
      },
    ]
  }

  if (
    [
      "packed",
      "dispatched",
      "in_transit",
      "shipped",
      "awaiting_items",
      "pending",
      "ready_to_pack",
    ].includes(status)
  ) {
    return BASE_ACTIONS
  }

  return BASE_ACTIONS
}

export function ParentOrderFulfillmentCard({
  order,
}: ParentOrderFulfillmentCardProps) {
  const mutation = useUpdateAdminOrderStatus(order.id)
  const [carrier, setCarrier] = useState(order.shipment?.carrier ?? "")
  const [trackingNumber, setTrackingNumber] = useState(
    order.shipment?.trackingNumber ?? ""
  )
  const [failureReason, setFailureReason] = useState("")
  const [rejectOpen, setRejectOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shipmentStatus = order.shipment?.status ?? "awaiting_items"
  const hasOpenReturn = (order.returns ?? []).some((row) =>
    [
      "pending_warehouse_receipt",
      "received_at_warehouse",
      "accepted",
      "refund_processing",
      "damaged",
      "inspection_rejected",
    ].includes(row.status)
  )
  const actions = useMemo(
    () => actionsForShipment(shipmentStatus),
    [shipmentStatus]
  )

  const run = async (payload: UpdateAdminOrderStatusPayload) => {
    setError(null)
    try {
      await mutation.mutateAsync(payload)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not update shipment."
      )
    }
  }

  const onSelectAction = (action: ShipmentAction) => {
    if (action.opensRejectDialog) {
      setRejectOpen(true)
      return
    }

    if (action.needsTracking) {
      void run({
        status: action.status,
        carrier: carrier.trim(),
        trackingNumber: trackingNumber.trim(),
      })
      return
    }

    if (action.needsReason) {
      if (!failureReason.trim()) {
        setError("Enter a reason for the delivery failure.")
        return
      }

      void run({
        status: action.status,
        reason: failureReason.trim(),
      })
      return
    }

    void run({ status: action.status })
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-start gap-3 border-b border-border px-4 py-3.5 sm:px-5">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-text">
          <Truck className="size-4" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">Shipment</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Pack and dispatch after vendor intake is complete.
          </p>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <p className="text-sm">
          Status{" "}
          <span className="font-medium">
            {SHIPMENT_STATUS_LABEL[shipmentStatus] ??
              shipmentStatus.replaceAll("_", " ")}
          </span>
        </p>

        {shipmentStatus === "delivered" ? (
          <p className="text-sm text-muted-foreground">
            Customer accepted delivery. Returns are not allowed after
            acceptance.
          </p>
        ) : null}

        {hasOpenReturn ? (
          <p className="text-sm text-muted-foreground">
            A delivery return is in progress. Manage it in the return card
            below.
          </p>
        ) : null}

        {actions.length > 0 ? (
          <>
            <FieldGroup className="gap-3">
              <Field>
                <FieldLabel htmlFor="ship-carrier">Carrier</FieldLabel>
                <Input
                  id="ship-carrier"
                  value={carrier}
                  onChange={(event) => setCarrier(event.target.value)}
                  placeholder="Courier name"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="ship-tracking">Tracking number</FieldLabel>
                <Input
                  id="ship-tracking"
                  value={trackingNumber}
                  onChange={(event) => setTrackingNumber(event.target.value)}
                  placeholder="Tracking ID"
                />
              </Field>
              {shipmentStatus === "out_for_delivery" ? (
                <Field>
                  <FieldLabel htmlFor="ship-fail-reason">
                    Delivery failure reason
                  </FieldLabel>
                  <Textarea
                    id="ship-fail-reason"
                    value={failureReason}
                    onChange={(event) => setFailureReason(event.target.value)}
                    placeholder="Courier could not deliver…"
                    rows={2}
                  />
                </Field>
              ) : null}
            </FieldGroup>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  className="w-full sm:w-auto"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Update shipment
                  <ChevronDown className="size-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                {actions.map((action) => (
                  <DropdownMenuItem
                    key={action.status}
                    disabled={mutation.isPending}
                    onSelect={() => onSelectAction(action)}
                  >
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <CustomerRejectDialog
        key={`${order.id}-${rejectOpen}`}
        order={order}
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        isPending={mutation.isPending}
        onSubmit={async ({ reason, lines }) => {
          await run({
            status: "customer_rejected",
            reason,
            lines,
          })
          setRejectOpen(false)
        }}
      />
    </section>
  )
}
