import { useState } from "react"
import { Ban, Store } from "@/lib/icons"

import { UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ApiError } from "@/lib/api/errors"

import { VENDOR_ORDER_STATUS_LABEL, vendorOrderStatusBadge } from "../labels"
import type { AdminVendorOrder } from "../types/admin-orders.types"

type CancelVendorOrderDialogProps = {
  vendorOrder: AdminVendorOrder | null
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isPending: boolean
}

function storeInitials(storeName: string) {
  const letters = storeName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return letters || "?"
}

function CancelVendorOrderForm({
  vendorOrder,
  onClose,
  onConfirm,
  isPending,
}: {
  vendorOrder: AdminVendorOrder
  onClose: () => void
  onConfirm: () => Promise<void>
  isPending: boolean
}) {
  const [error, setError] = useState<string | null>(null)

  const confirm = async () => {
    setError(null)

    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not cancel this vendor slice. Please try again."
      )
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !isPending) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-destructive/20 bg-destructive/8 px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-destructive text-base font-semibold text-white shadow-sm ring-4 ring-background">
              {storeInitials(vendorOrder.storeName)}
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {vendorOrder.storeName}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate font-mono text-foreground/70">
                {vendorOrder.vendorOrderNumber}
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <UniversalBadge
                  name={
                    VENDOR_ORDER_STATUS_LABEL[vendorOrder.status] ??
                    vendorOrder.status
                  }
                  icon={Store}
                  colors={vendorOrderStatusBadge(vendorOrder.status)}
                  showDot={false}
                  className="normal-case"
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5">
          {error ? (
            <p role="alert" className="mb-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <p className="text-sm text-muted-foreground">
            Cancel this vendor slice for{" "}
            <span className="font-medium wrap-break-word text-foreground">
              {vendorOrder.storeName}
            </span>
            . Fulfillment for this store on the parent order will stop and this
            action cannot be undone.
          </p>
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onClose}
            disabled={isPending}
          >
            Keep slice
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="cursor-pointer"
            onClick={() => void confirm()}
            disabled={isPending}
          >
            <Ban />
            {isPending ? "Cancelling…" : "Cancel vendor slice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function CancelVendorOrderDialog({
  vendorOrder,
  open,
  onClose,
  onConfirm,
  isPending,
}: CancelVendorOrderDialogProps) {
  if (!open || !vendorOrder) {
    return null
  }

  return (
    <CancelVendorOrderForm
      key={vendorOrder.id}
      vendorOrder={vendorOrder}
      onClose={onClose}
      onConfirm={onConfirm}
      isPending={isPending}
    />
  )
}
