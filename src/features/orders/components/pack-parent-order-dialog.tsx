import { useState } from "react"
import { Package, ShoppingBag } from "@/lib/icons"

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

import type { AdminOrderDetail } from "../types/admin-orders.types"

type PackParentOrderDialogProps = {
  order: AdminOrderDetail | null
  open: boolean
  onClose: () => void
  isPending: boolean
  onConfirm: () => Promise<void>
}

export function PackParentOrderDialog({
  order,
  open,
  onClose,
  isPending,
  onConfirm,
}: PackParentOrderDialogProps) {
  const [error, setError] = useState<string | null>(null)

  if (!open || !order) {
    return null
  }

  const confirm = async () => {
    setError(null)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not mark this order as packed."
      )
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !isPending) {
          setError(null)
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm ring-4 ring-background">
              <Package className="size-6" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate font-mono text-lg font-semibold">
                {order.orderNumber}
              </DialogTitle>
              <DialogDescription className="mt-1 text-foreground/70">
                Mark order packed
              </DialogDescription>
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
            Confirm that every accepted item for this order is packed and ready
            for dispatch. Vendor slices must be ready to pack before you
            continue.
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
            Not yet
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            disabled={isPending}
            onClick={() => void confirm()}
          >
            <ShoppingBag />
            {isPending ? "Packing…" : "Mark as packed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
