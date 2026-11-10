"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ArrowRight,
  CircleCheck,
  Clock3,
  Loader2,
  ShieldAlert,
  Wallet,
} from "@/lib/icons"
import { useState } from "react"

import { badgeColors, UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogBody,
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
import { cn } from "@/lib/utils"

import { BalanceMixBar } from "./finance-ui"
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

function storeInitials(name: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return letters || "?"
}

export function ReleaseSettlementDialog({
  store,
  open,
  onOpenChange,
  onReleased,
}: ReleaseSettlementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
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

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-semibold tracking-wide text-brand-text uppercase">
      {children}
    </h3>
  )
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
      <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
        <div className="flex items-center gap-4 pr-8">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-base font-semibold text-brand-foreground shadow-sm ring-4 ring-background">
            {storeInitials(store.storeName)}
          </span>
          <div className="min-w-0">
            <DialogTitle className="truncate text-lg font-semibold">
              Make eligible for withdrawal
            </DialogTitle>
            <DialogDescription className="mt-1 truncate font-mono text-xs text-foreground/70">
              {store.storeId}
            </DialogDescription>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <UniversalBadge
                name={store.storeName}
                colors={badgeColors.vendor}
                showDot={false}
                className="max-w-48 truncate normal-case"
              />
              <UniversalBadge
                name="Early release"
                icon={Wallet}
                colors={badgeColors.approved}
                showDot={false}
              />
            </div>
          </div>
        </div>
      </DialogHeader>

      <DialogBody
        scrollClassName="max-h-[calc(100dvh-16rem)] bg-muted/20"
        viewportClassName="max-h-[calc(100dvh-16rem)]"
      >
        <div className="space-y-5 px-6 py-5">
          <p className="text-sm text-muted-foreground">
            Move pending settlement into available balance for{" "}
            <span className="font-medium text-foreground">
              {store.storeName}
            </span>
            . Leave the amount blank to release all eligible funds, or enter a
            cap. Automatic settlement still runs on schedule.
          </p>

          <section className="space-y-3">
            <SectionLabel>Current balances</SectionLabel>
            <div className="rounded-xl border border-border/80 bg-card px-3.5 py-3">
              <BalanceMixBar
                pending={store.pendingSettlement}
                available={store.availableBalance}
                withdrawn={store.withdrawnBalance}
              />
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-background px-3 py-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    <Clock3 className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      Pending now
                    </p>
                    <p className="mt-0.5 text-sm font-semibold tabular-nums">
                      {formatBdt(store.pendingSettlement)}
                    </p>
                  </div>
                </div>
                <ArrowRight
                  className="mx-auto hidden size-4 text-muted-foreground sm:block"
                  aria-hidden="true"
                />
                <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-background px-3 py-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    <Wallet className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      Available now
                    </p>
                    <p className="mt-0.5 text-sm font-semibold tabular-nums">
                      {formatBdt(store.availableBalance)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <SectionLabel>Release settings</SectionLabel>

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
                className="tabular-nums"
              />
              <p
                id="release-amount-hint"
                className="mt-1.5 text-xs text-muted-foreground"
              >
                Blank releases every eligible order. A value caps the release
                (oldest delivered orders first; partial amounts allowed).
              </p>
            </Field>

            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors",
                force
                  ? "border-amber-500/40 bg-amber-500/5"
                  : "border-border/80 bg-card"
              )}
            >
              <Checkbox
                checked={force}
                onCheckedChange={(value) => setForce(value === true)}
                className="mt-0.5"
                aria-label="Force release unpaid or unreconciled orders"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <ShieldAlert className="size-4 text-amber-600 dark:text-amber-400" />
                  Force release unpaid / unreconciled orders
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Bypass prepaid paid and COD reconciled checks. Use only when
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
          </section>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {resultMessage ? (
            <p
              role="status"
              className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-800 dark:text-emerald-200"
            >
              {resultMessage}
            </p>
          ) : null}
        </div>
      </DialogBody>

      <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
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
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Releasing…
            </>
          ) : (
            <>
              <CircleCheck className="size-4" aria-hidden="true" />
              Release to available
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  )
}
