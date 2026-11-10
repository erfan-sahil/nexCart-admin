"use client"

import { Ban, CircleCheck, Loader2 } from "@/lib/icons"
import { useState } from "react"

import { badgeColors, UniversalBadge } from "@/components/shared"
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
import { cn } from "@/lib/utils"

import { PayoutMethodBadge, WithdrawalStatusBadge } from "./finance-ui"
import { formatBdt, maskAccountNumber } from "../lib/format"
import type { WithdrawalRow } from "../services/admin-finance.api"

function holderInitials(name?: string) {
  const letters = (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return letters || "?"
}

type WithdrawalApproveDialogProps = {
  withdrawal: WithdrawalRow | null
  open: boolean
  onClose: () => void
  isPending: boolean
  onConfirm: (reviewNote?: string) => Promise<void>
}

type WithdrawalRejectDialogProps = {
  withdrawal: WithdrawalRow | null
  open: boolean
  onClose: () => void
  isPending: boolean
  onConfirm: (reviewNote: string) => Promise<void>
}

function WithdrawalDialogSummary({ row }: { row: WithdrawalRow }) {
  return (
    <dl className="mt-4 grid gap-2 rounded-lg border border-border/80 bg-muted/25 px-3 py-3 text-sm sm:grid-cols-2">
      <div className="sm:col-span-2">
        <dt className="text-xs text-muted-foreground">Requested amount</dt>
        <dd className="mt-0.5 text-base font-semibold tabular-nums">
          {formatBdt(row.amount)}
        </dd>
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">Payout account</dt>
        <dd className="mt-0.5 font-medium tabular-nums">
          {maskAccountNumber(row.accountNumber)}
        </dd>
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">Method</dt>
        <dd className="mt-0.5">
          <PayoutMethodBadge method={row.method} />
        </dd>
      </div>
    </dl>
  )
}

function WithdrawalApproveForm({
  withdrawal,
  onClose,
  isPending,
  onConfirm,
}: {
  withdrawal: WithdrawalRow
  onClose: () => void
  isPending: boolean
  onConfirm: (reviewNote?: string) => Promise<void>
}) {
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const holder = withdrawal.accountHolderName ?? "Vendor payout"

  const confirm = async () => {
    setError(null)

    try {
      await onConfirm(note.trim() || undefined)
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not approve withdrawal."
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
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-base font-semibold text-brand-foreground shadow-sm ring-4 ring-background">
              {holderInitials(withdrawal.accountHolderName)}
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                Approve withdrawal
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                {holder}
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <UniversalBadge
                  name={formatBdt(withdrawal.amount)}
                  colors={badgeColors.approved}
                  showDot={false}
                  className="normal-case tabular-nums"
                />
                <WithdrawalStatusBadge status={withdrawal.status} />
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
            Approve{" "}
            <span className="font-medium text-foreground tabular-nums">
              {formatBdt(withdrawal.amount)}
            </span>{" "}
            for{" "}
            <span className="font-medium wrap-break-word text-foreground">
              {holder}
            </span>
            . The request moves to approved; you can mark it paid after payout.
          </p>

          <WithdrawalDialogSummary row={withdrawal} />

          <Field className="mt-4">
            <FieldLabel htmlFor="approveNote">
              Review note (optional)
            </FieldLabel>
            <Textarea
              id="approveNote"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Internal note for this approval"
              rows={2}
              maxLength={500}
              disabled={isPending}
            />
          </Field>
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            onClick={() => void confirm()}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <CircleCheck className="size-4" aria-hidden="true" />
            )}
            {isPending ? "Approving…" : "Approve request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function WithdrawalRejectForm({
  withdrawal,
  onClose,
  isPending,
  onConfirm,
}: {
  withdrawal: WithdrawalRow
  onClose: () => void
  isPending: boolean
  onConfirm: (reviewNote: string) => Promise<void>
}) {
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const holder = withdrawal.accountHolderName ?? "Vendor payout"

  const confirm = async () => {
    setError(null)

    try {
      await onConfirm(note.trim() || "Rejected by admin")
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not reject withdrawal."
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
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader
          className={cn(
            "shrink-0 border-b px-6 py-6 text-left",
            "border-destructive/20 bg-destructive/8"
          )}
        >
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-destructive text-base font-semibold text-white shadow-sm ring-4 ring-background">
              {holderInitials(withdrawal.accountHolderName)}
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                Reject withdrawal
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                {holder}
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <UniversalBadge
                  name={formatBdt(withdrawal.amount)}
                  colors={badgeColors.rejected}
                  showDot={false}
                  className="normal-case tabular-nums"
                />
                <WithdrawalStatusBadge status={withdrawal.status} />
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
            Reject the payout request for{" "}
            <span className="font-medium text-foreground tabular-nums">
              {formatBdt(withdrawal.amount)}
            </span>
            . Funds return to the vendor&apos;s available balance. Add an
            optional note they can see on the record.
          </p>

          <WithdrawalDialogSummary row={withdrawal} />

          <Field className="mt-4">
            <FieldLabel htmlFor="rejectNote">Review note (optional)</FieldLabel>
            <Textarea
              id="rejectNote"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Reason for rejection"
              rows={3}
              maxLength={500}
              disabled={isPending}
            />
          </Field>
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="cursor-pointer"
            onClick={() => void confirm()}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Ban className="size-4" aria-hidden="true" />
            )}
            {isPending ? "Rejecting…" : "Reject request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function WithdrawalApproveDialog({
  withdrawal,
  open,
  onClose,
  isPending,
  onConfirm,
}: WithdrawalApproveDialogProps) {
  if (!open || !withdrawal) {
    return null
  }

  return (
    <WithdrawalApproveForm
      key={withdrawal.id}
      withdrawal={withdrawal}
      onClose={onClose}
      isPending={isPending}
      onConfirm={onConfirm}
    />
  )
}

export function WithdrawalRejectDialog({
  withdrawal,
  open,
  onClose,
  isPending,
  onConfirm,
}: WithdrawalRejectDialogProps) {
  if (!open || !withdrawal) {
    return null
  }

  return (
    <WithdrawalRejectForm
      key={withdrawal.id}
      withdrawal={withdrawal}
      onClose={onClose}
      isPending={isPending}
      onConfirm={onConfirm}
    />
  )
}
