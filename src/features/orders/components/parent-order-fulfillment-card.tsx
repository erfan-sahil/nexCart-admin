import { useMemo, useState } from "react"
import { Ban, ChevronDown, Loader2, Package, Pencil, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/errors"

import { useCancelAdminOrder, useUpdateAdminOrderStatus } from "../hooks"
import {
  isPackedAwaitingShip,
  isPostShipmentStatus,
  isPrePackShipmentStatus,
  SHIPMENT_STATUS_LABEL,
} from "../labels"
import type {
  AdminOrderDetail,
  UpdateAdminOrderStatusPayload,
} from "../types/admin-orders.types"
import { CustomerRejectDialog } from "./customer-reject-dialog"
import { PackParentOrderDialog } from "./pack-parent-order-dialog"
import { ShipmentActionConfirmDialog } from "./shipment-action-confirm-dialog"

type ParentOrderFulfillmentCardProps = {
  order: AdminOrderDetail
}

type ShipmentAction = {
  label: string
  status: UpdateAdminOrderStatusPayload["status"]
  confirmTitle: string
  confirmDescription: string
  confirmLabel: string
  needsReason?: boolean
  opensRejectDialog?: boolean
  isOrderCancel?: boolean
  destructive?: boolean
}

const TERMINAL_SHIPMENT_STATUSES = [
  "delivered",
  "delivery_failed",
  "customer_rejected",
  "returning_to_warehouse",
  "returned_to_warehouse",
] as const

const CANCEL_BEFORE_OUT_FOR_DELIVERY_STATUSES = [
  "awaiting_items",
  "pending",
  "ready_to_pack",
  "packed",
  "shipped",
  "dispatched",
  "in_transit",
] as const

const CANCEL_ORDER_ACTION: ShipmentAction = {
  label: "Cancel order",
  status: "cancelled",
  confirmTitle: "Cancel order",
  confirmDescription:
    "Cancel the entire parent order before it goes out for delivery. Vendor slices will stop fulfilling.",
  confirmLabel: "Cancel order",
  isOrderCancel: true,
  destructive: true,
}

function canCancelBeforeOutForDelivery(status: string, canCancel: boolean) {
  if (!canCancel) {
    return false
  }

  return (
    CANCEL_BEFORE_OUT_FOR_DELIVERY_STATUSES as readonly string[]
  ).includes(status)
}

function postShipActions(status: string): ShipmentAction[] {
  if ((TERMINAL_SHIPMENT_STATUSES as readonly string[]).includes(status)) {
    return []
  }

  if (status === "out_for_delivery") {
    return [
      {
        label: "Mark delivered",
        status: "delivered",
        confirmTitle: "Mark delivered",
        confirmDescription:
          "Record that the customer received this shipment. Returns are not allowed after delivery is accepted.",
        confirmLabel: "Mark delivered",
      },
      {
        label: "Delivery failed",
        status: "delivery_failed",
        confirmTitle: "Delivery failed",
        confirmDescription:
          "Open a delivery-failed return. The customer did not receive the order as planned.",
        confirmLabel: "Confirm delivery failed",
        needsReason: true,
        destructive: true,
      },
      {
        label: "Customer rejected",
        status: "customer_rejected",
        confirmTitle: "Customer rejected",
        confirmDescription: "Start a customer-rejected return with line items.",
        confirmLabel: "Continue",
        opensRejectDialog: true,
      },
    ]
  }

  if (["shipped", "dispatched", "in_transit"].includes(status)) {
    return [
      {
        label: "Out for delivery",
        status: "out_for_delivery",
        confirmTitle: "Out for delivery",
        confirmDescription:
          "Courier is on the way to the customer for this shipment.",
        confirmLabel: "Mark out for delivery",
      },
      {
        label: "Mark delivered",
        status: "delivered",
        confirmTitle: "Mark delivered",
        confirmDescription:
          "Skip straight to delivered only if the customer already received the parcel.",
        confirmLabel: "Mark delivered",
      },
    ]
  }

  return []
}

export function ParentOrderFulfillmentCard({
  order,
}: ParentOrderFulfillmentCardProps) {
  const mutation = useUpdateAdminOrderStatus(order.id)
  const cancelOrder = useCancelAdminOrder()
  const [carrier, setCarrier] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [packOpen, setPackOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ShipmentAction | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const [editingCourier, setEditingCourier] = useState(false)
  const [courierCarrier, setCourierCarrier] = useState("")
  const [courierTracking, setCourierTracking] = useState("")

  const shipmentStatus = order.shipment?.status ?? "awaiting_items"
  const savedCarrier = order.shipment?.carrier ?? ""
  const savedTracking = order.shipment?.trackingNumber ?? ""
  const showPackButton = isPrePackShipmentStatus(shipmentStatus)
  const showShipForm = isPackedAwaitingShip(shipmentStatus)
  const showShippedTracking =
    isPostShipmentStatus(shipmentStatus) && !showShipForm

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

  const deliveryActions = useMemo(
    () => postShipActions(shipmentStatus),
    [shipmentStatus]
  )

  const showCancelBeforeDelivery = canCancelBeforeOutForDelivery(
    shipmentStatus,
    order.canCancel
  )

  const isBusy = mutation.isPending || cancelOrder.isPending

  const run = async (payload: UpdateAdminOrderStatusPayload) => {
    setError(null)
    await mutation.mutateAsync(payload)
  }

  const handleShip = async () => {
    const nextCarrier = carrier.trim()
    const nextTracking = trackingNumber.trim()

    if (!nextCarrier || !nextTracking) {
      setError("Carrier and tracking number are required to mark shipped.")
      return
    }

    setError(null)
    try {
      await run({
        status: "shipped",
        carrier: nextCarrier,
        trackingNumber: nextTracking,
      })
      setCarrier("")
      setTrackingNumber("")
      setEditingCourier(false)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not mark as shipped."
      )
    }
  }

  const onSelectDeliveryAction = (action: ShipmentAction) => {
    if (action.opensRejectDialog) {
      setRejectOpen(true)
      return
    }
    setConfirmAction(action)
  }

  const confirmDeliveryAction = async (reason?: string) => {
    if (!confirmAction) {
      return
    }

    if (confirmAction.isOrderCancel) {
      await cancelOrder.mutateAsync(order.id)
      return
    }

    if (confirmAction.needsReason) {
      await run({
        status: confirmAction.status,
        reason,
      })
      return
    }

    await run({ status: confirmAction.status })
  }

  const startCourierEdit = () => {
    setCourierCarrier(savedCarrier)
    setCourierTracking(savedTracking)
    setEditingCourier(true)
    setError(null)
  }

  const cancelCourierEdit = () => {
    setEditingCourier(false)
    setCourierCarrier("")
    setCourierTracking("")
  }

  const saveCourierDetails = async () => {
    const nextCarrier = courierCarrier.trim()
    const nextTracking = courierTracking.trim()

    if (!nextCarrier || !nextTracking) {
      setError("Carrier and tracking number are required.")
      return
    }

    setError(null)
    try {
      await run({
        status: "update_courier_details",
        carrier: nextCarrier,
        trackingNumber: nextTracking,
      })
      setEditingCourier(false)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not update courier details."
      )
    }
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
            Pack, ship, then advance delivery status step by step.
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

        {showPackButton ? (
          <Button
            type="button"
            size="sm"
            className="w-full sm:w-auto"
            disabled={isBusy}
            onClick={() => setPackOpen(true)}
          >
            {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Package />}
            Mark as packed
          </Button>
        ) : null}

        {showShipForm ? (
          <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Add courier details, then dispatch.
            </p>
            <FieldGroup className="gap-3 sm:grid sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="ship-carrier">Carrier</FieldLabel>
                <Input
                  id="ship-carrier"
                  value={carrier}
                  onChange={(event) => setCarrier(event.target.value)}
                  placeholder="Courier name"
                  maxLength={80}
                  disabled={isBusy}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="ship-tracking">Tracking number</FieldLabel>
                <Input
                  id="ship-tracking"
                  value={trackingNumber}
                  onChange={(event) => setTrackingNumber(event.target.value)}
                  placeholder="Tracking ID"
                  maxLength={120}
                  disabled={isBusy}
                />
              </Field>
            </FieldGroup>
            <Button
              type="button"
              size="sm"
              disabled={isBusy}
              onClick={() => void handleShip()}
            >
              {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Truck />}
              Mark shipped
            </Button>
          </div>
        ) : null}

        {showShippedTracking ? (
          <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Courier details on file
              </p>
              {!editingCourier ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isBusy}
                  onClick={startCourierEdit}
                >
                  <Pencil />
                  Edit courier details
                </Button>
              ) : null}
            </div>
            <FieldGroup className="gap-3 sm:grid sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="ship-carrier-saved">Carrier</FieldLabel>
                <Input
                  id="ship-carrier-saved"
                  value={editingCourier ? courierCarrier : savedCarrier}
                  onChange={(event) => setCourierCarrier(event.target.value)}
                  placeholder="Not recorded"
                  maxLength={80}
                  disabled={!editingCourier || isBusy}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="ship-tracking-saved">
                  Tracking number
                </FieldLabel>
                <Input
                  id="ship-tracking-saved"
                  value={editingCourier ? courierTracking : savedTracking}
                  onChange={(event) => setCourierTracking(event.target.value)}
                  placeholder="Not recorded"
                  maxLength={120}
                  disabled={!editingCourier || isBusy}
                />
              </Field>
            </FieldGroup>
            {editingCourier ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => void saveCourierDetails()}
                >
                  {isBusy ? <Loader2 className="size-4 animate-spin" /> : null}
                  Save courier details
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={isBusy}
                  onClick={cancelCourierEdit}
                >
                  Cancel
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          {showCancelBeforeDelivery ? (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="w-full sm:mr-auto sm:w-auto"
              disabled={isBusy}
              onClick={() => setConfirmAction(CANCEL_ORDER_ACTION)}
            >
              {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Ban />}
              Cancel order
            </Button>
          ) : null}

          {deliveryActions.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={isBusy}
                >
                  {isBusy ? <Loader2 className="size-4 animate-spin" /> : null}
                  Update delivery
                  <ChevronDown className="size-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {deliveryActions.map((action) => (
                  <DropdownMenuItem
                    key={action.label}
                    disabled={isBusy}
                    variant={action.destructive ? "destructive" : "default"}
                    onSelect={(event) => {
                      event.preventDefault()
                      onSelectDeliveryAction(action)
                    }}
                  >
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <PackParentOrderDialog
        order={order}
        open={packOpen}
        onClose={() => setPackOpen(false)}
        isPending={mutation.isPending}
        onConfirm={async () => {
          await run({ status: "packed" })
        }}
      />

      <ShipmentActionConfirmDialog
        open={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        isPending={isBusy}
        title={confirmAction?.confirmTitle ?? "Confirm"}
        description={confirmAction?.confirmDescription ?? ""}
        confirmLabel={confirmAction?.confirmLabel ?? "Confirm"}
        destructive={confirmAction?.destructive}
        needsReason={confirmAction?.needsReason}
        onConfirm={confirmDeliveryAction}
      />

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
