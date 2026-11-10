import { useMemo, useState } from "react"
import {
  ClipboardCheck,
  Package,
  PackageCheck,
  Store,
  Tags,
  type AppIcon,
} from "@/lib/icons"

import { UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApiError } from "@/lib/api/errors"
import { cn } from "@/lib/utils"

import {
  FULFILLMENT_REJECTION_REASONS,
  REJECTION_REASON_LABEL,
  VENDOR_ORDER_STATUS_LABEL,
  vendorOrderStatusBadge,
  type FulfillmentRejectionReason,
} from "../labels"
import type {
  AdminVendorOrder,
  InboundBatch,
  InspectLinePayload,
} from "../types/admin-orders.types"

type LineDraft = InspectLinePayload & {
  sentQty: number
  productName: string
  sku: string
}

type InspectVendorOrderDialogProps = {
  vendorOrder: AdminVendorOrder | null
  open: boolean
  onClose: () => void
  onSubmit: (
    items: InspectLinePayload[],
    decisionStatus: string
  ) => Promise<void>
  isPending: boolean
}

type DetailTone = "brand" | "emerald" | "amber" | "violet"

const TONE_CLASS: Record<DetailTone, string> = {
  brand: "bg-brand/15 text-brand-text",
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-semibold tracking-wide text-brand-text uppercase">
      {children}
    </h3>
  )
}

function DetailItem({
  icon: Icon,
  label,
  value,
  tone,
  className,
}: {
  icon: AppIcon
  label: string
  value: string
  tone: DetailTone
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border/80 bg-card px-3.5 py-3",
        className
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          TONE_CLASS[tone]
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium wrap-break-word text-foreground">
          {value}
        </dd>
      </div>
    </div>
  )
}

function activeBatch(vendorOrder: AdminVendorOrder): InboundBatch | undefined {
  return (
    vendorOrder.inboundBatches.find(
      (row) => row.status === "inspecting" || row.status === "received"
    ) ??
    [...vendorOrder.inboundBatches]
      .reverse()
      .find((row) => row.status !== "inspected")
  )
}

function activeBatchLines(vendorOrder: AdminVendorOrder): LineDraft[] {
  const batch = activeBatch(vendorOrder)

  if (!batch) {
    return []
  }

  return batch.lines.map((line) => ({
    variantId: line.variantId,
    productName: line.productName,
    sku: line.sku,
    sentQty: line.sentQty,
    acceptedQty: line.sentQty,
    rejectedQty: 0,
    rejectionReason: undefined,
    rejectionNote: "",
  }))
}

function InspectVendorOrderForm({
  vendorOrder,
  onClose,
  onSubmit,
  isPending,
}: {
  vendorOrder: AdminVendorOrder
  onClose: () => void
  onSubmit: (
    items: InspectLinePayload[],
    decisionStatus: string
  ) => Promise<void>
  isPending: boolean
}) {
  const batch = activeBatch(vendorOrder)
  const [lines, setLines] = useState<LineDraft[]>(() =>
    activeBatchLines(vendorOrder)
  )
  const [error, setError] = useState<string | null>(null)

  const decisionStatus = useMemo(() => {
    const accepted = lines.reduce((sum, line) => sum + line.acceptedQty, 0)
    const rejected = lines.reduce((sum, line) => sum + line.rejectedQty, 0)

    if (accepted === 0 && rejected > 0) {
      return "rejected_at_warehouse"
    }

    if (rejected > 0) {
      return "partially_accepted"
    }

    return "accepted_at_warehouse"
  }, [lines])

  const sentTotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.sentQty, 0),
    [lines]
  )

  const statusBadge = vendorOrderStatusBadge(vendorOrder.status)
  const outcomeBadge = vendorOrderStatusBadge(decisionStatus)

  const updateLine = (variantId: string, patch: Partial<LineDraft>) => {
    setLines((current) =>
      current.map((line) =>
        line.variantId === variantId ? { ...line, ...patch } : line
      )
    )
  }

  const onAcceptAll = () => {
    setLines((current) =>
      current.map((line) => ({
        ...line,
        acceptedQty: line.sentQty,
        rejectedQty: 0,
        rejectionReason: undefined,
        rejectionNote: "",
      }))
    )
  }

  const handleSubmit = async () => {
    setError(null)

    for (const line of lines) {
      if (line.acceptedQty + line.rejectedQty !== line.sentQty) {
        setError(
          `Accepted + rejected must equal sent quantity for ${line.productName}.`
        )
        return
      }

      if (line.rejectedQty > 0 && !line.rejectionReason) {
        setError(`Select a rejection reason for ${line.productName}.`)
        return
      }
    }

    try {
      await onSubmit(
        lines.map(
          ({
            variantId,
            acceptedQty,
            rejectedQty,
            rejectionReason,
            rejectionNote,
          }) => ({
            variantId,
            acceptedQty,
            rejectedQty,
            ...(rejectedQty > 0
              ? {
                  rejectionReason:
                    rejectionReason as FulfillmentRejectionReason,
                  rejectionNote,
                }
              : {}),
          })
        ),
        decisionStatus
      )
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Inspection failed.")
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
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm ring-4 ring-background">
              <ClipboardCheck className="size-6" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate font-mono text-lg font-semibold">
                {vendorOrder.vendorOrderNumber}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                Warehouse inspection
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <UniversalBadge
                  name={vendorOrder.storeName}
                  icon={Store}
                  colors={statusBadge}
                  showDot={false}
                  className="max-w-48 normal-case"
                />
                <UniversalBadge
                  name={
                    VENDOR_ORDER_STATUS_LABEL[vendorOrder.status] ??
                    vendorOrder.status
                  }
                  colors={statusBadge}
                />
                <UniversalBadge
                  name={`Outcome · ${
                    VENDOR_ORDER_STATUS_LABEL[decisionStatus] ?? decisionStatus
                  }`}
                  icon={PackageCheck}
                  colors={outcomeBadge}
                  showDot={false}
                  className="normal-case"
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        <DialogBody
          scrollClassName="max-h-[calc(100dvh-16rem)] bg-muted/20"
          viewportClassName="max-h-[calc(100dvh-16rem)]"
          className="space-y-5 px-6 py-5"
        >
          <section className="space-y-3">
            <SectionLabel>Batch</SectionLabel>
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailItem
                icon={Store}
                label="Store"
                value={vendorOrder.storeName}
                tone="brand"
              />
              <DetailItem
                icon={Tags}
                label="Inbound batch"
                value={
                  batch
                    ? `#${batch.sequence} · ${batch.status.replaceAll("_", " ")}`
                    : "No active batch"
                }
                tone="amber"
              />
              <DetailItem
                icon={Package}
                label="Units to inspect"
                value={
                  lines.length > 0
                    ? `${lines.length} line${lines.length === 1 ? "" : "s"} · ${sentTotal} units sent`
                    : "—"
                }
                tone="emerald"
                className="sm:col-span-2"
              />
            </dl>
          </section>

          <section className="space-y-3">
            <SectionLabel>Inbound lines</SectionLabel>
            {lines.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-card px-3.5 py-8 text-center text-sm text-muted-foreground">
                No inbound lines are available for inspection on this batch.
              </p>
            ) : (
              <ul className="space-y-3">
                {lines.map((line) => (
                  <li
                    key={line.variantId}
                    className="rounded-xl border border-border/80 bg-card px-3.5 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg",
                          TONE_CLASS.brand
                        )}
                      >
                        <Package className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {line.productName}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {line.sku} · Sent {line.sentQty}
                        </p>
                      </div>
                    </div>

                    <FieldGroup className="mt-3 gap-3 border-t border-border/80 pt-3 sm:grid sm:grid-cols-2">
                      <Field>
                        <FieldLabel>Accepted</FieldLabel>
                        <Input
                          type="number"
                          min={0}
                          max={line.sentQty}
                          className="w-full"
                          value={line.acceptedQty}
                          onChange={(event) => {
                            const acceptedQty = Number(event.target.value)
                            updateLine(line.variantId, {
                              acceptedQty,
                              rejectedQty: Math.max(
                                line.sentQty - acceptedQty,
                                0
                              ),
                            })
                          }}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Rejected</FieldLabel>
                        <Input
                          type="number"
                          min={0}
                          max={line.sentQty}
                          className="w-full"
                          value={line.rejectedQty}
                          onChange={(event) => {
                            const rejectedQty = Number(event.target.value)
                            updateLine(line.variantId, {
                              rejectedQty,
                              acceptedQty: Math.max(
                                line.sentQty - rejectedQty,
                                0
                              ),
                            })
                          }}
                        />
                      </Field>
                      {line.rejectedQty > 0 ? (
                        <>
                          <Field className="sm:col-span-2">
                            <FieldLabel>Rejection reason</FieldLabel>
                            <Select
                              value={line.rejectionReason ?? ""}
                              onValueChange={(value) =>
                                updateLine(line.variantId, {
                                  rejectionReason:
                                    value as FulfillmentRejectionReason,
                                })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select reason" />
                              </SelectTrigger>
                              <SelectContent>
                                {FULFILLMENT_REJECTION_REASONS.map((reason) => (
                                  <SelectItem key={reason} value={reason}>
                                    {REJECTION_REASON_LABEL[reason]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field className="sm:col-span-2">
                            <FieldLabel>Note</FieldLabel>
                            <Input
                              value={line.rejectionNote ?? ""}
                              onChange={(event) =>
                                updateLine(line.variantId, {
                                  rejectionNote: event.target.value,
                                })
                              }
                              placeholder="Optional note for the vendor"
                            />
                          </Field>
                        </>
                      ) : null}
                    </FieldGroup>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
        </DialogBody>

        <DialogFooter className="shrink-0 flex-col gap-2 border-t border-border bg-card px-6 py-4 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer sm:mr-auto"
            disabled={isPending || lines.length === 0}
            onClick={onAcceptAll}
          >
            Accept all sent qty
          </Button>
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              disabled={isPending}
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              type="button"
              className="cursor-pointer"
              disabled={isPending || lines.length === 0}
              onClick={() => void handleSubmit()}
            >
              <ClipboardCheck />
              {isPending ? "Submitting…" : "Submit inspection"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function InspectVendorOrderDialog({
  vendorOrder,
  open,
  onClose,
  onSubmit,
  isPending,
}: InspectVendorOrderDialogProps) {
  if (!open || !vendorOrder) {
    return null
  }

  return (
    <InspectVendorOrderForm
      key={vendorOrder.id}
      vendorOrder={vendorOrder}
      onClose={onClose}
      onSubmit={onSubmit}
      isPending={isPending}
    />
  )
}
