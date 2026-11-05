import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/errors"

import { useDispatchVendorReturn } from "../hooks"
import type { VendorReturnShipment } from "../types/admin-orders.types"

type DispatchVendorReturnDialogProps = {
  shipment: VendorReturnShipment | null
  open: boolean
  onClose: () => void
}

export function DispatchVendorReturnDialog({
  shipment,
  open,
  onClose,
}: DispatchVendorReturnDialogProps) {
  const dispatch = useDispatchVendorReturn()
  const [carrier, setCarrier] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [error, setError] = useState<string | null>(null)

  const resetAndClose = () => {
    setCarrier("")
    setTrackingNumber("")
    setError(null)
    onClose()
  }

  const submit = async () => {
    if (!shipment) {
      return
    }

    setError(null)
    try {
      await dispatch.mutateAsync({
        shipmentId: shipment.id,
        payload: {
          ...(carrier.trim() ? { carrier: carrier.trim() } : {}),
          ...(trackingNumber.trim()
            ? { trackingNumber: trackingNumber.trim() }
            : {}),
        },
      })
      resetAndClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not dispatch vendor return."
      )
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          resetAndClose()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dispatch return to vendor</DialogTitle>
          <DialogDescription>
            Optional courier details for the sellable products going back to the
            vendor.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel htmlFor="vendor-return-carrier">Courier</FieldLabel>
            <Input
              id="vendor-return-carrier"
              value={carrier}
              onChange={(event) => setCarrier(event.target.value)}
              placeholder="Optional"
              maxLength={80}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="vendor-return-tracking">
              Tracking number
            </FieldLabel>
            <Input
              id="vendor-return-tracking"
              value={trackingNumber}
              onChange={(event) => setTrackingNumber(event.target.value)}
              placeholder="Optional"
              maxLength={120}
            />
          </Field>
        </FieldGroup>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={dispatch.isPending || !shipment}
            onClick={() => void submit()}
          >
            {dispatch.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Mark dispatched
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
