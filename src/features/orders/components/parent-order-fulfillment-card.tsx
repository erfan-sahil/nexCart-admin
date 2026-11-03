import { useState } from "react"
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
import { ApiError } from "@/lib/api/errors"

import { useUpdateAdminOrderStatus } from "../hooks"
import type {
  AdminOrderDetail,
  UpdateAdminOrderStatusPayload,
} from "../types/admin-orders.types"

type ParentOrderFulfillmentCardProps = {
  order: AdminOrderDetail
}

const SHIPMENT_ACTIONS: {
  label: string
  status: UpdateAdminOrderStatusPayload["status"]
  needsTracking?: boolean
}[] = [
  { label: "Mark packed", status: "packed" },
  { label: "Mark shipped", status: "shipped", needsTracking: true },
  { label: "Out for delivery", status: "out_for_delivery" },
  { label: "Mark delivered", status: "delivered" },
]

export function ParentOrderFulfillmentCard({
  order,
}: ParentOrderFulfillmentCardProps) {
  const mutation = useUpdateAdminOrderStatus(order.id)
  const [carrier, setCarrier] = useState(order.shipment?.carrier ?? "")
  const [trackingNumber, setTrackingNumber] = useState(
    order.shipment?.trackingNumber ?? ""
  )
  const [error, setError] = useState<string | null>(null)

  const shipmentStatus = order.shipment?.status ?? "awaiting_items"

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

  const onSelectAction = (action: (typeof SHIPMENT_ACTIONS)[number]) => {
    if (action.needsTracking) {
      void run({
        status: action.status,
        carrier: carrier.trim(),
        trackingNumber: trackingNumber.trim(),
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
          <span className="font-medium capitalize">
            {shipmentStatus.replaceAll("_", " ")}
          </span>
        </p>

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
          <DropdownMenuContent align="start" className="w-48">
            {SHIPMENT_ACTIONS.map((action) => (
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

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </section>
  )
}
