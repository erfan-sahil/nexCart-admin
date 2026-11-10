import { CheckCircle2, Package, Truck } from "@/lib/icons"

import { UniversalBadge } from "@/components/shared"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/format"

import {
  VENDOR_RETURN_SHIPMENT_STATUS_LABEL,
  vendorReturnShipmentStatusBadge,
} from "../labels"
import type { VendorReturnShipment } from "../types/admin-orders.types"

const STEPS = [
  {
    status: "pending_dispatch_to_vendor",
    label: "Pending dispatch",
    icon: Package,
  },
  {
    status: "in_transit_to_vendor",
    label: "In transit",
    icon: Truck,
  },
  {
    status: "received_by_vendor",
    label: "Received",
    icon: CheckCircle2,
  },
] as const

function stepIndex(status: string) {
  const index = STEPS.findIndex((step) => step.status === status)
  return index >= 0 ? index : 0
}

export function VendorReturnShipmentStatusBadge({
  status,
}: {
  status: string
}) {
  const badge = vendorReturnShipmentStatusBadge(status)
  return (
    <UniversalBadge name={badge.name} colors={badge.colors} icon={badge.icon} />
  )
}

export function VendorReturnShipmentStepper({
  shipment,
  compact = false,
}: {
  shipment: VendorReturnShipment
  compact?: boolean
}) {
  const current = stepIndex(shipment.status)

  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      <div className="flex flex-wrap items-center gap-2">
        <VendorReturnShipmentStatusBadge status={shipment.status} />
        {!compact ? (
          <span className="text-xs text-muted-foreground">
            {VENDOR_RETURN_SHIPMENT_STATUS_LABEL[shipment.status] ??
              shipment.status}
          </span>
        ) : null}
      </div>

      <ol className="flex flex-wrap gap-2">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          const done = index <= current
          return (
            <li
              key={step.status}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px]",
                done
                  ? "border-border bg-muted/40 text-foreground"
                  : "border-dashed border-border text-muted-foreground"
              )}
            >
              <Icon className="size-3" />
              {step.label}
            </li>
          )
        })}
      </ol>

      {(shipment.carrier ||
        shipment.trackingNumber ||
        shipment.dispatchedAt ||
        shipment.receivedByVendorAt) && (
        <p className="text-xs text-muted-foreground">
          {shipment.carrier
            ? `${shipment.carrier}${shipment.trackingNumber ? ` · ${shipment.trackingNumber}` : ""}`
            : shipment.trackingNumber
              ? shipment.trackingNumber
              : null}
          {shipment.dispatchedAt
            ? `${shipment.carrier || shipment.trackingNumber ? " · " : ""}Dispatched ${formatDateTime(shipment.dispatchedAt)}`
            : null}
          {shipment.receivedByVendorAt
            ? ` · Received ${formatDateTime(shipment.receivedByVendorAt)}`
            : null}
        </p>
      )}
    </div>
  )
}
