import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/errors"

import { useUpdateAdminOrderStatus } from "../hooks"
import type { AdminOrderDetail } from "../types/admin-orders.types"

type ParentOrderFulfillmentCardProps = {
  order: AdminOrderDetail
}

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

  const run = async (payload: Parameters<typeof mutation.mutateAsync>[0]) => {
    setError(null)
    try {
      await mutation.mutateAsync(payload)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not update shipment."
      )
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h2 className="text-sm font-semibold">Outbound shipment</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Parent order fulfillment after every active vendor slice meets target
        acceptance.
      </p>
      <p className="mt-3 text-sm">
        Shipment status:{" "}
        <span className="font-medium">
          {shipmentStatus.replaceAll("_", " ")}
        </span>
      </p>

      <FieldGroup className="mt-4 gap-3 sm:grid-cols-2">
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

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={mutation.isPending}
          onClick={() => void run({ status: "packed" })}
        >
          Mark packed
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={mutation.isPending}
          onClick={() =>
            void run({
              status: "shipped",
              carrier: carrier.trim(),
              trackingNumber: trackingNumber.trim(),
            })
          }
        >
          Mark shipped
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={mutation.isPending}
          onClick={() => void run({ status: "out_for_delivery" })}
        >
          Out for delivery
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={mutation.isPending}
          onClick={() => void run({ status: "delivered" })}
        >
          Mark delivered
        </Button>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </section>
  )
}
