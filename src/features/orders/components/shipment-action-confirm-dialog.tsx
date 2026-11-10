import { useState } from "react"
import { Ban, Truck } from "@/lib/icons"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api/errors"

type ShipmentActionConfirmDialogProps = {
  open: boolean
  onClose: () => void
  isPending: boolean
  title: string
  description: string
  confirmLabel: string
  destructive?: boolean
  needsReason?: boolean
  onConfirm: (reason?: string) => Promise<void>
}

export function ShipmentActionConfirmDialog({
  open,
  onClose,
  isPending,
  title,
  description,
  confirmLabel,
  destructive = false,
  needsReason = false,
  onConfirm,
}: ShipmentActionConfirmDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const [reason, setReason] = useState("")

  const reset = () => {
    setError(null)
    setReason("")
  }

  const close = () => {
    if (isPending) {
      return
    }
    reset()
    onClose()
  }

  const submit = async () => {
    if (needsReason && !reason.trim()) {
      setError("Enter a reason to continue.")
      return
    }

    setError(null)
    try {
      await onConfirm(needsReason ? reason.trim() : undefined)
      reset()
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not update shipment status."
      )
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          close()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader
          className={
            destructive
              ? "shrink-0 border-b border-destructive/20 bg-destructive/8 px-6 py-6 text-left"
              : "shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left"
          }
        >
          <div className="flex items-center gap-4 pr-8">
            <span
              className={
                destructive
                  ? "flex size-14 shrink-0 items-center justify-center rounded-2xl bg-destructive text-white shadow-sm ring-4 ring-background"
                  : "flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm ring-4 ring-background"
              }
            >
              {destructive ? (
                <Ban className="size-6" />
              ) : (
                <Truck className="size-6" />
              )}
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold">
                {title}
              </DialogTitle>
              <DialogDescription className="mt-1 text-foreground/70">
                Shipment update
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">{description}</p>
          {needsReason ? (
            <Field>
              <FieldLabel htmlFor="shipment-action-reason">Reason</FieldLabel>
              <Textarea
                id="shipment-action-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Describe what happened…"
                rows={3}
                disabled={isPending}
              />
            </Field>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={close}
            disabled={isPending}
          >
            Go back
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            className="cursor-pointer"
            disabled={isPending}
            onClick={() => void submit()}
          >
            {isPending ? "Updating…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
