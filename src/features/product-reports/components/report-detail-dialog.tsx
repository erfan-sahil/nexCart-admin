import type { ReactNode } from "react"
import {
  AlignLeft,
  CalendarClock,
  CheckCircle2,
  Flag,
  History,
  Loader2,
  Package,
  Store,
  UserRound,
  XCircle,
} from "lucide-react"

import { badgeColors, UniversalBadge } from "@/components/shared"
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
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

import {
  PRODUCT_REPORT_STATUS_BADGE,
  PRODUCT_REPORT_STATUS_LABEL,
  PRODUCT_REPORT_TYPE_LABEL,
} from "../labels"
import type { ProductReport } from "../types"

type ReportDetailDialogProps = {
  report: ProductReport | null
  open: boolean
  updating: boolean
  actionError: string | null
  onClose: () => void
  onMarkReviewed: (report: ProductReport) => void
  onDismiss: (report: ProductReport) => void
}

type DetailTone = "brand" | "emerald" | "amber" | "violet"

const TONE_CLASS: Record<DetailTone, string> = {
  brand: "bg-brand/15 text-brand-text",
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
}

function reporterInitials(displayName: string) {
  const letters = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return letters || "?"
}

function DetailItem({
  icon: Icon,
  label,
  value,
  tone,
  nowrap = false,
  className,
}: {
  icon: typeof UserRound
  label: string
  value: string
  tone: DetailTone
  nowrap?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border/80 bg-card px-3.5 py-3",
        nowrap && "min-w-max flex-1",
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
      <div className={cn(nowrap ? "shrink-0" : "min-w-0 flex-1")}>
        <dt className="text-xs font-medium whitespace-nowrap text-muted-foreground">
          {label}
        </dt>
        <dd
          className={cn(
            "mt-0.5 text-sm font-medium text-foreground",
            nowrap ? "whitespace-nowrap" : "wrap-break-word"
          )}
        >
          {value}
        </dd>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-semibold tracking-wide text-brand-text uppercase">
      {children}
    </h3>
  )
}

function MessageBlock({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border/80 bg-card px-3.5 py-3">
      <p className="text-xs font-medium text-muted-foreground">Message</p>
      <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
        {children}
      </p>
    </div>
  )
}

export function ReportDetailDialog({
  report,
  open,
  updating,
  actionError,
  onClose,
  onMarkReviewed,
  onDismiss,
}: ReportDetailDialogProps) {
  if (!open || !report) {
    return null
  }

  const reporterName = report.reporter.displayName || "Anonymous reporter"
  const isOpen = report.status === "open"

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-base font-semibold text-brand-foreground shadow-sm ring-4 ring-background">
              {reporterInitials(reporterName)}
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {reporterName}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                Product report · {PRODUCT_REPORT_TYPE_LABEL[report.type]}
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <UniversalBadge
                  name={PRODUCT_REPORT_STATUS_LABEL[report.status]}
                  colors={PRODUCT_REPORT_STATUS_BADGE[report.status]}
                  className="normal-case"
                />
                <UniversalBadge
                  name={PRODUCT_REPORT_TYPE_LABEL[report.type]}
                  icon={Flag}
                  colors={badgeColors.under_review}
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
          {actionError ? (
            <p role="alert" className="text-sm text-destructive">
              {actionError}
            </p>
          ) : null}

          <section className="space-y-3">
            <SectionLabel>Report</SectionLabel>
            <DetailItem
              icon={Flag}
              label="Reason"
              value={PRODUCT_REPORT_TYPE_LABEL[report.type]}
              tone="amber"
              className="sm:max-w-sm"
            />
            <MessageBlock>{report.message}</MessageBlock>
          </section>

          <section className="space-y-3">
            <SectionLabel>Product &amp; store</SectionLabel>
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailItem
                icon={Package}
                label="Product"
                value={report.product.name}
                tone="brand"
              />
              <DetailItem
                icon={Store}
                label="Store"
                value={report.store.name}
                tone="violet"
              />
              {report.product.slug ? (
                <DetailItem
                  icon={AlignLeft}
                  label="Product slug"
                  value={report.product.slug}
                  tone="emerald"
                  className="sm:col-span-2"
                />
              ) : null}
            </dl>
          </section>

          <section className="space-y-3">
            <SectionLabel>Reporter</SectionLabel>
            <DetailItem
              icon={UserRound}
              label="Submitted by"
              value={reporterName}
              tone="brand"
              className="sm:max-w-sm"
            />
          </section>

          <section className="space-y-3">
            <SectionLabel>Timeline</SectionLabel>
            <dl className="flex flex-wrap gap-3">
              <DetailItem
                icon={CalendarClock}
                label="Submitted"
                value={formatDateTime(report.createdAt)}
                tone="brand"
                nowrap
              />
              <DetailItem
                icon={History}
                label="Last updated"
                value={formatDateTime(report.updatedAt)}
                tone="emerald"
                nowrap
              />
            </dl>
          </section>
        </DialogBody>

        <DialogFooter className="shrink-0 flex-col gap-3 border-t border-border bg-card px-6 py-4 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onClose}
            disabled={updating}
          >
            Close
          </Button>
          {isOpen ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                disabled={updating}
                onClick={() => onDismiss(report)}
              >
                {updating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <XCircle />
                )}
                Dismiss
              </Button>
              <Button
                type="button"
                className="cursor-pointer"
                disabled={updating}
                onClick={() => onMarkReviewed(report)}
              >
                {updating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 />
                )}
                Mark reviewed
              </Button>
            </div>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
