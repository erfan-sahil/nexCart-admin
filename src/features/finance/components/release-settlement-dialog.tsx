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
import { Input } from "@/components/ui/input"
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
  const [amount, setAmount] = useState<number | "">("")
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [resultMessage, setResultMessage] = useState<string | null>(null)

  const pendingMax = Math.round(store.pendingSettlement * 100) / 100
  const hasAmount = amount !== "" && amount !== null
  const parsedAmount = hasAmount ? Number(amount) : null
  const amountValid =
    !hasAmount ||
    (parsedAmount !== null &&
      Number.isFinite(parsedAmount) &&
      parsedAmount > 0 &&
      parsedAmount <= pendingMax + 0.0001)

  const release = useMutation({
    mutationFn: () =>
      releaseStoreSettlement(store.storeId, {
        force,
        amount:
          parsedAmount !== null && Number.isFinite(parsedAmount)
            ? Math.round(parsedAmount * 100) / 100
            : undefined,
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

  const canRelease = pendingMax > 0 && amountValid

  return (
    <>
      <DialogHeader>
        <DialogTitle>Make eligible for withdrawal</DialogTitle>
        <DialogDescription>
          Move pending settlement into available balance for{" "}
          <span className="font-medium text-foreground">{store.storeName}</span>
          . Leave amount blank to release all eligible funds, or enter a
          specific amount. Automatic settlement still runs on its own.
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

        <Field>
          <FieldLabel htmlFor="release-amount">
            Amount to make eligible{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </FieldLabel>
          <Input
            id="release-amount"
            type="number"
            min={0.01}
            max={pendingMax}
            step="0.01"
            value={amount}
            placeholder={`All eligible · max ${pendingMax.toFixed(2)}`}
            onChange={(event) => {
              const next = event.target.value
              setAmount(next === "" ? "" : Number(next))
            }}
            aria-describedby="release-amount-hint"
          />
          <p
            id="release-amount-hint"
            className="mt-1.5 text-xs text-muted-foreground"
          >
            Optional. Blank releases every eligible order. A value caps the
            release (oldest delivered orders first; partial amounts allowed).
          </p>
        </Field>

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
          onClick={() => {
            if (!amountValid) {
              setError(
                `If set, amount must be between 0.01 and ${pendingMax.toFixed(2)}`
              )
              return
            }
            release.mutate()
          }}
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
