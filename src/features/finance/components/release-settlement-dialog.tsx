"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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

import { formatBdt } from "../lib/format"
import {
  releaseStoreSettlement,
  type VendorEarningsRow,
} from "../services/admin-finance.api"

type ReleaseSettlementDialogProps = {
  store: VendorEarningsRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onReleased?: (storeId: string) => void
}

export function ReleaseSettlementDialog({
  store,
  open,
  onOpenChange,
  onReleased,
}: ReleaseSettlementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {store ? (
          <ReleaseSettlementForm
            key={store.storeId}
            store={store}
            onClose={() => onOpenChange(false)}
            onReleased={onReleased}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

type ReleaseSettlementFormProps = {
  store: VendorEarningsRow
  onClose: () => void
  onReleased?: (storeId: string) => void
}

function ReleaseSettlementForm({
  store,
  onClose,
  onReleased,
}: ReleaseSettlementFormProps) {
  const queryClient = useQueryClient()
  const [force, setForce] = useState(false)
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [resultMessage, setResultMessage] = useState<string | null>(null)

  const release = useMutation({
    mutationFn: () =>
      releaseStoreSettlement(store.storeId, {
        force,
        note: note.trim() || undefined,
      }),
    onSuccess: async (data) => {
      setError(null)
      setResultMessage(
        data.releasedCount > 0
          ? `Moved ${formatBdt(data.releasedAmount)} from pending to available across ${data.releasedCount} order(s).`
          : data.skippedPayment > 0 && !force
            ? "Nothing released. Some orders still need payment/COD reconciliation — enable force release to override."
            : "Nothing new to release. Eligible orders may already be available or still undelivered."
      )

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin", "vendor-earnings"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin", "finance"],
        }),
      ])

      onReleased?.(store.storeId)

      if (data.releasedCount > 0) {
        window.setTimeout(() => onClose(), 900)
      }
    },
    onError: (err) => {
      setResultMessage(null)
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not release settlement for this store."
      )
    },
  })

  const canRelease = store.pendingSettlement > 0

  return (
    <>
      <DialogHeader>
        <DialogTitle>Make eligible for withdrawal</DialogTitle>
        <DialogDescription>
          Move pending settlement into available balance for{" "}
          <span className="font-medium text-foreground">{store.storeName}</span>
          . Automatic settlement still runs on its own; this only releases
          early.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <dl className="grid gap-2 rounded-lg border border-border bg-muted/30 px-3 py-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Pending now</dt>
            <dd className="mt-0.5 font-medium tabular-nums">
              {formatBdt(store.pendingSettlement)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Available now</dt>
            <dd className="mt-0.5 font-medium tabular-nums">
              {formatBdt(store.availableBalance)}
            </dd>
          </div>
        </dl>

        <p className="text-xs text-muted-foreground">
          Releases delivered/completed orders only. By default the settlement
          hold is skipped but prepaid/COD payment checks still apply.
        </p>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-3">
          <Checkbox
            checked={force}
            onCheckedChange={(value) => setForce(value === true)}
            className="mt-0.5"
            aria-label="Force release unpaid or unreconciled orders"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium">
              Force release unpaid / unreconciled orders
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Also bypass prepaid paid and COD reconciled checks. Use only when
              you intentionally want the vendor to withdraw early.
            </span>
          </span>
        </label>

        <Field>
          <FieldLabel htmlFor="release-note">Note (optional)</FieldLabel>
          <Textarea
            id="release-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Reason for early eligibility"
            rows={3}
            maxLength={500}
          />
        </Field>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {resultMessage ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            {resultMessage}
          </p>
        ) : null}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={onClose}
          disabled={release.isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="cursor-pointer"
          disabled={!canRelease || release.isPending}
          onClick={() => release.mutate()}
        >
          {release.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Releasing
            </>
          ) : (
            "Release to available"
          )}
        </Button>
      </DialogFooter>
    </>
  )
}
